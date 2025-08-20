import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MultiImageUpload from '../components/MultiImageUpload';
import axios from 'axios';
import { config } from '../utils/config';
import { HomeIcon, CameraIcon } from '@heroicons/react/24/outline';

const PostRoom = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    location: '',
    room_type: '',
    gender_preference: 'any',
    wifi: false,
    ac: false,
    furnished: false,
    parking: false,
    laundry: false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create room (only backend-accepted fields)
      const createPayload = {
        title: formData.title,
        description: formData.description,
        rent: formData.rent,
        location: formData.location,
        room_type: formData.room_type,
        wifi: formData.wifi,
        ac: formData.ac,
        furnished: formData.furnished,
        parking: formData.parking,
        laundry: formData.laundry,
      };
      const roomResponse = await axios.post(`${config.apiBaseUrl}/rooms/create/`, createPayload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });
      const roomId = roomResponse.data.id;

      // Upload images if any (non-blocking per-image errors)
      let failedUploads = 0;
      if (images.length > 0) {
        for (const img of images) {
          const file = img?.file || img; // support preview objects or raw File
          if (!file) continue;

          try {
            const imageFormData = new FormData();
            imageFormData.append('image', file);

            await axios.post(`${config.apiBaseUrl}/rooms/${roomId}/upload-image/`, imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
              },
            });
          } catch (uploadErr) {
            // Log and count failures but don't block the flow
            console.error('Image upload failed:', uploadErr?.response?.data || uploadErr?.message);
            failedUploads += 1;
          }
        }
      }

      if (failedUploads > 0) {
        setError(`${failedUploads} image(s) failed to upload. The room was created.`);
      }

      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Room create failed:', error?.response?.data || error?.message);
      setError(error.response?.data?.detail || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Your Room</h1>
          <p className="text-gray-600">Create a detailed listing to attract the right tenants</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spacious 1BHK near Metro"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Rent (₹) *
            </label>
            <input
              type="number"
              name="rent"
              required
              value={formData.rent}
              onChange={handleChange}
              placeholder="15000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Koramangala, Bangalore"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type *
            </label>
            <select
              name="room_type"
              required
              value={formData.room_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Room Type</option>
              <option value="1bhk">1BHK Apartment</option>
              <option value="2bhk">2BHK Apartment</option>
              <option value="3bhk">3BHK Apartment</option>
              <option value="pg">PG for Students</option>
              <option value="shared">Shared Room</option>
              <option value="studio">Studio Apartment</option>
            </select>
          </div>
        </div>
        
        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender Preference
          </label>
          <select
            name="gender_preference"
            value={formData.gender_preference}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="any">Any Gender</option>
            <option value="male">Male Only</option>
            <option value="female">Female Only</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your room, nearby amenities, rules, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Facilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Facilities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="wifi"
                checked={formData.wifi}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              WiFi
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="ac"
                checked={formData.ac}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              AC
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="furnished"
                checked={formData.furnished}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              Furnished
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="parking"
                checked={formData.parking}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              Parking
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="laundry"
                checked={formData.laundry}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              Laundry
            </label>
          </div>
        </div>

        {/* Enhanced Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <CameraIcon className="h-5 w-5 inline mr-2" />
            Room Photos
          </label>
          <MultiImageUpload 
            onImagesChange={handleImagesChange}
            maxImages={10}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
          />
          <p className="text-sm text-gray-500 mt-2">
            Upload up to 10 high-quality photos. The first image will be used as the cover photo.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Posting Room...
              </>
            ) : (
              <>
                <HomeIcon className="h-5 w-5 mr-2" />
                Post Room
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default PostRoom;
