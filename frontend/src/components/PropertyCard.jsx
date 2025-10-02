import { CurrencyRupeeIcon, HomeIcon, MapPinIcon, StarIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Link } from "react-router-dom";

const PropertyCard = ({ property }) => {
    const imageUrl =
        property.photos && property.photos.length > 0
            ? property.photos[0].url || (property.photos[0].filename?.startsWith('http')
                ? property.photos[0].filename
                : `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/uploads/properties/${property.photos[0].filename}`)
            : null

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image' }}
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <HomeIcon className="w-12 h-12 text-gray-400" />
                    </div>
                )}

                <div className="absolute top-3 left-3">
                    <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {property.type}
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <span className="bg-white text-gray-800 px-2 py-1 rounded-full text-xs font-medium shadow">
                        {property.bedrooms} BHK
                    </span>
                </div>

                {!property.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                            Not Available
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{property.title}</h3>
                    <div className="flex items-center text-sm text-yellow-500">
                        <StarIcon className="w-4 h-4 fill-current mr-1" />
                        <span>{property.rating?.average || 0}</span>
                    </div>
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm truncate">{property.address?.city}, {property.address?.state}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-primary-600 font-semibold">
                        <CurrencyRupeeIcon className="w-5 h-5" />
                        <span className="text-lg">{property.rent?.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-1">/month</span>
                    </div>
                    <span className="text-sm text-gray-500">{property.area} sq ft</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">{property.furnished} • {property.preferredTenants}</div>
                    <Link
                        to={`/properties/${property._id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PropertyCard;
