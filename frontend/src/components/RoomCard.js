import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WishlistButton from './WishlistButton';
import { config } from '../utils/config';
import { 
  MapPinIcon, 
  HomeIcon,
  WifiIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const RoomCard = ({ room }) => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
      <div className="h-56 bg-gray-200 relative overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <img
            src={`${config.apiBaseUrl.replace('/api', '')}${room.images[0].image}`}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200">
            <HomeIcon className="h-12 w-12" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-4 left-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            room.is_available 
              ? 'bg-green-100/90 text-green-800 border border-green-200' 
              : 'bg-red-100/90 text-red-800 border border-red-200'
          }`}>
            {room.is_available ? (
              <>
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Available
              </>
            ) : (
              <>
                <XCircleIcon className="h-3 w-3 mr-1" />
                Occupied
              </>
            )}
          </div>
        </div>
        
        {/* Price Badge and Wishlist */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-white/20">
            <div className="flex items-center text-gray-900 font-bold">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">₹{room.rent}</span>
              <span className="text-xs text-gray-600 ml-1">/mo</span>
            </div>
          </div>
          {isAuthenticated && user?.id !== room.owner?.id && (
            <WishlistButton 
              roomId={room.id} 
              className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg border border-white/20"
            />
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {room.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{room.location}</span>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-2 text-sm leading-relaxed">
          {room.description}
        </p>
        
        {/* Enhanced Facilities */}
        <div className="flex flex-wrap gap-2 mb-6">
          {room.wifi && (
            <span className="inline-flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
              <WifiIcon className="h-3 w-3 mr-1" />
              WiFi
            </span>
          )}
          {room.ac && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
              AC
            </span>
          )}
          {room.furnished && (
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium border border-purple-200">
              Furnished
            </span>
          )}
          {room.parking && (
            <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200">
              Parking
            </span>
          )}
          {room.laundry && (
            <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-full text-xs font-medium border border-pink-200">
              Laundry
            </span>
          )}
        </div>
        
        <Link
          to={`/room/${room.id}`}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-center block shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;
