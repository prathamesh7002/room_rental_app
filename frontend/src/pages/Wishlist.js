import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../utils/config';
import RoomCard from '../components/RoomCard';
import {
  HeartIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const Wishlist = () => {
  const [wishlistRooms, setWishlistRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/wishlist/`);
      setWishlistRooms(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (roomId) => {
    try {
      await axios.delete(`${config.apiBaseUrl}/wishlist/remove/${roomId}/`);
      setWishlistRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await axios.delete(`${config.apiBaseUrl}/wishlist/clear/`);
        setWishlistRooms([]);
      } catch (error) {
        console.error('Error clearing wishlist:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistRooms.length} saved room{wishlistRooms.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {wishlistRooms.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistRooms.map((room) => (
              <div key={room.id} className="relative">
                <RoomCard room={room} />
                <button
                  onClick={() => removeFromWishlist(room.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  title="Remove from wishlist"
                >
                  <HeartIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Start browsing rooms and save your favorites here
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Rooms
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
