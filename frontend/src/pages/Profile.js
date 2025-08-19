import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../utils/config';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import {
  UserIcon,
  PencilIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userRooms, setUserRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
    fetchUserRooms();
  }, [isAuthenticated, user]);

  const fetchUserRooms = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/rooms/my-rooms/`);
      setUserRooms(response.data);
    } catch (error) {
      console.error('Error fetching user rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`${config.apiBaseUrl}/rooms/${roomId}/delete/`);
        setUserRooms(userRooms.filter(room => room.id !== roomId));
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Failed to delete room');
      }
    }
  };

  const handleProfilePhotoChange = async (file) => {
    const formData = new FormData();
    formData.append('profile_photo', file);
    
    try {
      await axios.patch(`${config.apiBaseUrl}/auth/profile/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${config.apiBaseUrl}/auth/profile/`, profileData);
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="relative px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
              <div className="relative">
                <ProfilePhotoUpload
                  currentPhoto={user.profile_photo ? `${config.apiBaseUrl.replace('/api', '')}${user.profile_photo}` : null}
                  onPhotoChange={handleProfilePhotoChange}
                  isVerified={user.is_verified}
                />
              </div>
              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h1>
                  {user.is_verified && (
                    <ShieldCheckIcon className="h-6 w-6 text-green-500 ml-2" />
                  )}
                </div>
                <p className="text-gray-600 mb-1">@{user.username}</p>
                <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Joined {new Date(user.date_joined).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {editMode ? (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-gray-900 font-medium">{user.first_name} {user.last_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900 font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Statistics</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rooms Posted:</span>
                        <span className="font-semibold">{userRooms.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verification Status:</span>
                        <span className={`font-semibold ${
                          user.is_verified ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Bio</p>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User's Rooms */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Room Listings</h2>
            <Link
              to="/post-room"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Post New Room
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your rooms...</p>
            </div>
          ) : userRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRooms.map((room) => (
                <div key={room.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={`${config.apiBaseUrl.replace('/api', '')}${room.images[0].image}`}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    room.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {room.is_available ? 'Available' : 'Not Available'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{room.title}</h3>
                  <p className="text-xl font-bold text-blue-600 mb-2">₹{room.rent}/month</p>
                  <p className="text-gray-600 mb-2">{room.location}</p>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{room.description}</p>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/room/${room.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-center text-sm font-medium"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => deleteRoom(room.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">You haven't posted any rooms yet.</p>
              <Link
                to="/post-room"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Post Your First Room
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
