import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  StarIcon,
  MagnifyingGlassIcon,
  CurrencyRupeeIcon,
  HomeModernIcon,
  ChevronDownIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import PropertyCard from '../components/PropertyCard';


const dummyCities = [
  { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { name: 'Delhi', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80' },
  { name: 'Pune', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
  { name: 'Hyderabad', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
  { name: 'Chennai', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80' },
];

const features = [
  {
    icon: UserGroupIcon,
    title: 'Trusted Community',
    description: 'Connect with verified property owners and tenants in a safe environment.'
  },
  {
    icon: CheckBadgeIcon,
    title: 'Verified Listings',
    description: 'All properties are verified by our team to ensure quality and authenticity.'
  },
  {
    icon: ChartBarIcon,
    title: 'Easy Management',
    description: 'Manage your properties, bookings, and payments all in one place.'
  },
];

const stats = [
  { label: 'Properties Listed', value: '10,000+' },
  { label: 'Happy Tenants', value: '5,000+' },
  { label: 'Property Owners', value: '2,000+' },
  { label: 'Cities Covered', value: '50+' }
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Tenant',
    content: 'Found my dream apartment in just 2 days! The process was smooth and transparent.',
    rating: 5
  },
  {
    name: 'Raj Kumar',
    role: 'Property Owner',
    content: 'Managing my properties has never been easier. Great platform for landlords!',
    rating: 5
  },
  {
    name: 'Anita Desai',
    role: 'Tenant',
    content: 'Excellent service and genuine listings. Highly recommended for property search.',
    rating: 5
  }
];

const pricingPlans = [
  {
    name: 'Free',
    price: '₹0',
    features: ['List 1 property', 'Basic support', 'Standard visibility'],
    cta: 'Get Started',
    highlight: false
  },
  {
    name: 'Premium',
    price: '₹499/mo',
    features: ['List up to 10 properties', 'Priority support', 'Increased visibility', 'Analytics dashboard'],
    cta: 'Upgrade',
    highlight: true
  },
  {
    name: 'Featured',
    price: '₹999/mo',
    features: ['Unlimited listings', 'Featured placement', 'Dedicated manager', 'All Premium features'],
    cta: 'Go Featured',
    highlight: false
  }
];

const blogPosts = [
  {
    title: '5 Tips for First-Time Renters',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
    excerpt: 'Renting for the first time? Here are 5 essential tips to help you find the perfect home.',
    link: '#'
  },
  {
    title: 'How to List Your Property Effectively',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
    excerpt: 'Maximize your property’s visibility and attract quality tenants with these listing strategies.',
    link: '#'
  },
  {
    title: 'Understanding Rental Agreements',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
    excerpt: 'A quick guide to understanding the key clauses in your rental agreement.',
    link: '#'
  }
];

const faqs = [
  {
    question: 'How do I list my property?',
    answer: 'Sign up as a property owner, go to your dashboard, and click on “Add Property”. Fill in the details and submit.'
  },
  {
    question: 'Are the properties verified?',
    answer: 'Yes, all properties are verified by our team before being listed to ensure authenticity.'
  },
  {
    question: 'How do I contact a property owner?',
    answer: 'Once you find a property you like, use the “Contact Owner” button on the property details page.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We support all major payment methods including UPI, credit/debit cards, and net banking.'
  }
];

const Home = () => {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState({ city: '', budget: '', type: '' });
  const [faqOpen, setFaqOpen] = useState(null);

  const currentUserStr = localStorage.getItem('currentuser');
  const currentUser = (() => {
    if (!currentUserStr) return null;
    try {
      return JSON.parse(currentUserStr);
    } catch {
      return null;
    }
  })();
  const currentRole = currentUser?.role || user?.role || null;
  const navigate = useNavigate()

  // if(currentUser.role === "Owner"){
  //   navigate("/owner/dashboard")
  // }

  useEffect(() => {
    if (currentRole === "Owner") {
      navigate("/owner/dashboard")
    }else if( currentRole === "Admin"){
      navigate("/admin/dashboard")
      }
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getProperties();
        // console.log('Fetched properties:', response.data);
        setFeatured((response.data || []).slice(0, 3));
      } catch {
        setFeatured([]);
      }
    };
    fetchProperties();
  }, [currentRole, navigate]);

  const handleSearchChange = e => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleFaqToggle = idx => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  // Dummy property types for search bar
  const propertyTypes = ['Apartment', 'Villa', 'Studio', 'PG', 'Independent House'];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-blue-900 min-h-[480px] flex items-center">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Find Your Perfect Home
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover, connect, and rent from thousands of verified properties across India.
          </p>
          {/* Search Bar */}
          <form className="w-full max-w-3xl bg-white/90 rounded-xl shadow-lg flex flex-col md:flex-row gap-2 md:gap-0 p-4 md:p-2 mb-4" onSubmit={e => { e.preventDefault(); window.location.href = `/properties?city=${search.city}&budget=${search.budget}&type=${search.type}`; }}>
            <div className="flex-1 flex items-center px-2">
              <HomeModernIcon className="w-5 h-5 text-blue-500 mr-2" />
              <input name="city" value={search.city} onChange={handleSearchChange} className="w-full bg-transparent outline-none text-gray-800" placeholder="Enter city (e.g. Mumbai)" />
            </div>
            <div className="flex-1 flex items-center px-2 border-t md:border-t-0 md:border-l border-gray-200">
              <CurrencyRupeeIcon className="w-5 h-5 text-blue-500 mr-2" />
              <input name="budget" value={search.budget} onChange={handleSearchChange} className="w-full bg-transparent outline-none text-gray-800" placeholder="Budget (e.g. 20000)" type="number" min="0" />
            </div>
            <div className="flex-1 flex items-center px-2 border-t md:border-t-0 md:border-l border-gray-200">
              <BuildingOfficeIcon className="w-5 h-5 text-blue-500 mr-2" />
              <select name="type" value={search.type} onChange={handleSearchChange} className="w-full bg-transparent outline-none text-gray-800">
                <option value="">Property Type</option>
                {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <button type="submit" className="flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg ml-0 md:ml-2 mt-2 md:mt-0 transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" /> Search
            </button>
          </form>
          <div className="flex gap-4 mt-2">
            <Link to="/properties" className="text-white underline hover:text-blue-200">Browse All Properties</Link>
            {!user && <Link to="/register" className="text-white underline hover:text-blue-200">List Your Property</Link>}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(property => <PropertyCard key={property._id} property={property} />)}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        </div>
      )}

      {/* Popular Cities */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Popular Cities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {dummyCities.map(city => (
              <div key={city.name} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col items-center cursor-pointer group">
                <img src={city.image} alt={city.name} className="h-28 w-full object-cover group-hover:scale-105 transition-transform duration-200" />
                <div className="p-3 text-center font-semibold text-gray-800">{city.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">We provide a comprehensive platform for all your rental property needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center hover:shadow-lg transition">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                  <feature.icon className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to find or list your property</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-700 text-white text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up & Browse</h3>
              <p className="text-gray-600">Create your account and start browsing verified properties in your desired location.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-700 text-white text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect & Visit</h3>
              <p className="text-gray-600">Connect with property owners and schedule visits to find your perfect match.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-700 text-white text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book & Move In</h3>
              <p className="text-gray-600">Complete the booking process and move into your new home hassle-free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Real experiences from our satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <StarIcon key={j} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/Guides */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Guides & Tips</h2>
            <Link to="#" className="text-blue-700 font-semibold hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
                <img src={post.image} alt={post.title} className="h-40 w-full object-cover" />
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-lg font-bold text-gray-900 mb-2">{post.title}</div>
                  <div className="text-gray-600 mb-4">{post.excerpt}</div>
                  <a href={post.link} className="mt-auto inline-block text-blue-700 font-semibold hover:underline">Read More</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <button onClick={() => handleFaqToggle(i)} className="w-full flex justify-between items-center text-left font-semibold text-gray-800 focus:outline-none">
                  <span>{faq.question}</span>
                  <ChevronDownIcon className={`w-5 h-5 ml-2 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && <div className="mt-2 text-gray-600">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="bg-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Find a Home or List Your Property?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of satisfied users who found their perfect rental property.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/properties" className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors">Find a Home</Link>
            <Link to={user ? "/owner/add-property" : "/register"} className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-colors">List a Property</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2 text-white">PropertyRent</h3>
            <p className="text-gray-400 text-sm mb-4">Your trusted platform for finding and listing rental properties across India.</p>
            <div className="flex gap-3 mt-2">
              <a href="#" className="hover:text-white">Facebook</a>
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">Instagram</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Quick Links</h4>
            <ul className="space-y-1">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/properties" className="hover:underline">Browse Properties</Link></li>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Support</h4>
            <ul className="space-y-1">
              <li><Link to="/help" className="hover:underline">Help Center</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Contact</h4>
            <ul className="space-y-1 text-sm">
              <li>Email: support@propertyrent.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Mon-Fri: 9am - 6pm</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-8">&copy; {new Date().getFullYear()} PropertyRent. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Home;
