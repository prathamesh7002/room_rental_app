import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { config } from '../utils/config';
import {
  HeartIcon as HeartOutline,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
} from '@heroicons/react/24/solid';

const WishlistButton = ({ roomId, className = '' }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const checkWishlistStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/wishlist/check/${roomId}/`);
      setIsWishlisted(response.data.is_wishlisted);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  }, [roomId]);

  useEffect(() => {
    if (isAuthenticated && roomId) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, roomId, checkWishlistStatus]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to save rooms to your wishlist');
      return;
    }

    setLoading(true);
    
    try {
      if (isWishlisted) {
        await axios.delete(`${config.apiBaseUrl}/wishlist/remove/${roomId}/`);
        setIsWishlisted(false);
      } else {
        await axios.post(`${config.apiBaseUrl}/wishlist/add/`, { room_id: roomId });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 ${
        isWishlisted 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
      ) : isWishlisted ? (
        <HeartSolid className="h-5 w-5" />
      ) : (
        <HeartOutline className="h-5 w-5" />
      )}
    </button>
  );
};

export default WishlistButton;
