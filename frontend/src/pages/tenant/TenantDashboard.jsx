import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingService } from "../../services/bookingService";
import { paymentService } from "../../services/paymentService";
import { feedbackService } from "../../services/feedbackService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const TenantDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // ✅ Single combined fetch function
  const fetchDashboardData = useCallback(async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      // Parallelized with Promise.allSettled to avoid blocking on one failed request
      const [bookingsRes, paymentsRes, feedbackRes] = await Promise.allSettled([
        bookingService.getBookings({ limit: 5 }),
        paymentService.getPayments({ limit: 5 }),
        feedbackService.getMyFeedback({ limit: 3 }),
      ]);

      if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value.data || []);
      if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value.data || []);
      if (feedbackRes.status === "fulfilled") setFeedback(feedbackRes.value.data || []);
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // ✅ Only runs when user changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ✅ Memoized stats calculation
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
    const approvedBookings = bookings.filter((b) => b.status === "Approved").length;
    const totalPayments = payments.length;
    const totalSpent = payments
      .filter((p) => p.status === "Completed")
      .reduce((sum, p) => sum + p.amount, 0);
    const feedbackGiven = feedback.length;
    return {
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalPayments,
      totalSpent,
      feedbackGiven,
    };
  }, [bookings, payments, feedback]);

  // ✅ Helpers
  const getStatusBadge = useCallback((status) => {
    const badges = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
      Approved: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
      Rejected: { color: "bg-red-100 text-red-800", icon: XCircleIcon },
      Cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircleIcon },
    };
    const { color, icon: Icon } = badges[status] || badges.Pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  }, []);

  const getPaymentStatusBadge = useCallback((status) => {
    const colors = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.Pending}`}>
        {status}
      </span>
    );
  }, []);

  const getPaymentTypeColor = useCallback((type) => {
    const colors = {
      Rent: "text-blue-600",
      "Security Deposit": "text-purple-600",
      Maintenance: "text-orange-600",
      "Late Fee": "text-red-600",
    };
    return colors[type] || "text-gray-600";
  }, []);

  const renderStars = useCallback(
    (rating) =>
      [...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        />
      )),
    []
  );

  // ✅ Memoize upcoming payments
  const upcomingPayments = useMemo(() => {
    const approved = bookings.find((b) => b.status === "Approved");
    if (!approved) return [];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    return [
      {
        property: approved.property?.title,
        amount: approved.monthlyRent,
        dueDate: nextDate,
        type: "Rent",
      },
    ];
  }, [bookings]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}! Here's your rental overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Bookings", value: stats.totalBookings, icon: CalendarIcon, color: "bg-blue-100 text-blue-600" },
          { title: "Pending", value: stats.pendingBookings, icon: ClockIcon, color: "bg-yellow-100 text-yellow-600" },
          { title: "Approved", value: stats.approvedBookings, icon: CheckCircleIcon, color: "bg-green-100 text-green-600" },
          { title: "Total Spent", value: `₹${stats.totalSpent.toLocaleString()}`, icon: CurrencyRupeeIcon, color: "bg-purple-100 text-purple-600" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color.split(" ")[0]}`}>
                <card.icon className={`w-6 h-6 ${card.color.split(" ")[1]}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Upcoming Payment</h3>
              {upcomingPayments.map((p, i) => (
                <p key={i} className="mt-2 text-sm text-yellow-700">
                  {p.type} payment of ₹{p.amount.toLocaleString()} for {p.property} is due on{" "}
                  {p.dueDate.toLocaleDateString()}
                </p>
              ))}
              <Link
                to="/tenant/payments"
                className="mt-4 inline-block text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200 transition-colors duration-200"
              >
                Make Payment
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex justify-between gap-4">
          <Link to="/properties" className="flex w-full items-center justify-center p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200">
            <MagnifyingGlassIcon className="w-8 h-8 text-primary-600 mr-2" />
            <span className="text-primary-600 font-semibold">Search Properties</span>
          </Link>
          <Link to="/tenant/bookings" className="flex w-full items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <CalendarIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">My Bookings</span>
          </Link>
          <Link to="/tenant/feedback" className="flex w-full items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <StarIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">My Reviews</span>
          </Link>
        </div>
      </div>

      {/* Bookings & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bookings */}
        <DashboardSection
          title="Recent Bookings"
          emptyText="No bookings yet"
          link="/tenant/bookings"
          icon={CalendarIcon}
          data={bookings}
          renderItem={(booking) => (
            <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 truncate">{booking.property?.title}</h3>
                <p className="text-sm text-gray-500">₹{booking.monthlyRent?.toLocaleString()}/month</p>
                <p className="text-xs text-gray-400">Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="ml-4">{getStatusBadge(booking.status)}</div>
            </div>
          )}
        />

        {/* Payments */}
        <DashboardSection
          title="Recent Payments"
          emptyText="No payments yet"
          link="/tenant/payments"
          icon={CurrencyRupeeIcon}
          data={payments}
          renderItem={(payment) => (
            <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-900">₹{payment.amount.toLocaleString()}</h3>
                  <span className={`ml-2 text-sm font-medium ${getPaymentTypeColor(payment.paymentType)}`}>
                    {payment.paymentType}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{payment.property?.title}</p>
                <p className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="ml-4">{getPaymentStatusBadge(payment.status)}</div>
            </div>
          )}
        />
      </div>

      {/* Feedback */}
      <DashboardSection
        title="My Reviews"
        emptyText="No reviews written yet"
        subText="Write reviews for properties you've rented to help other tenants"
        link="/tenant/feedback"
        icon={StarIcon}
        data={feedback}
        renderItem={(f) => (
          <div key={f._id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 truncate">{f.property?.title}</h3>
                <div className="flex items-center mt-1">
                  {renderStars(f.rating)}
                  <span className="ml-2 text-sm text-gray-600">{f.rating}/5</span>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(f.createdAt).toLocaleDateString()}
              </span>
            </div>
            {f.comment && <p className="text-sm text-gray-600 mt-2">"{f.comment}"</p>}
          </div>
        )}
      />
    </div>
  );
};

// ✅ Small reusable section component
const DashboardSection = ({ title, link, emptyText, subText, icon: Icon, data, renderItem }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <Link to={link} className="text-primary-600 hover:text-primary-500 text-sm font-medium">
        View All
      </Link>
    </div>

    {data.length > 0 ? (
      <div className="space-y-4">{data.map(renderItem)}</div>
    ) : (
      <div className="text-center py-8">
        <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">{emptyText}</p>
        {subText && <p className="text-sm text-gray-400 mt-1">{subText}</p>}
      </div>
    )}
  </div>
);

export default TenantDashboard;
