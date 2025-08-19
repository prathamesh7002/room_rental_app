import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WishlistButton from '../components/WishlistButton';
import ContactButtons from '../components/ContactButtons';
import ReportModal from '../components/ReportModal';
import axios from 'axios';
import { config } from '../utils/config';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  WifiIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ShareIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

const RoomDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchRoomDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/rooms/${id}/`);
      setRoom(response.data);
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  const handleChatWithOwner = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/chat?user=${room.owner.id}`);
  };

  const nextImage = () => {
    if (room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <HomeIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Room Not Found</h2>
          <p className="text-gray-600 mb-8">The room you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/find-room" 
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <Link to="/find-room" className="text-gray-500 hover:text-gray-700">Find Room</Link>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{room.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-96 lg:h-[500px] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
              {room.images && room.images.length > 0 ? (
                <>
                  <img
                    src={`${config.apiBaseUrl.replace('/api', '')}${room.images[currentImageIndex].image}`}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                  {room.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                      >
                        <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                      >
                        <ChevronRightIcon className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {room.images.length}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: room.title,
                            text: `Check out this room: ${room.title}`,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                    >
                      <ShareIcon className="h-5 w-5 text-gray-700" />
                    </button>
                    {isAuthenticated && user?.id !== room.owner.id && (
                      <WishlistButton 
                        roomId={room.id} 
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                      />
                    )}
                    {isAuthenticated && user?.id !== room.owner.id && (
                      <button 
                        onClick={() => setShowReportModal(true)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                      >
                        <FlagIcon className="h-5 w-5 text-gray-700" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <HomeIcon className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">No Images Available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {room.images && room.images.length > 1 && (
              <div className="grid grid-cols-6 gap-3">
                {room.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-16 lg:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200 scale-105' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={`${config.apiBaseUrl.replace('/api', '')}${image.image}`}
                      alt={`${room.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Room Details Sidebar */}
          <div className="space-y-6">
            {/* Price and Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-3xl font-bold text-gray-900">
                  <CurrencyDollarIcon className="h-8 w-8 mr-1" />
                  ₹{room.rent}
                  <span className="text-lg text-gray-600 ml-2">/month</span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  room.is_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {room.is_available ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Available
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Occupied
                    </>
                  )}
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{room.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{room.location}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isAuthenticated && user?.id !== room.owner.id && (
                  <>
                    <button
                      onClick={handleChatWithOwner}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                      Chat with Owner
                    </button>
                    <ContactButtons 
                      ownerPhone={room.owner.phone}
                      ownerEmail={room.owner.email}
                      roomTitle={room.title}
                      roomUrl={window.location.href}
                    />
                  </>
                )}
                
                {!isAuthenticated && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">Please login to contact the owner</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
                    >
                      Login to Contact
                    </Link>
                  </div>
                )}
                
                {user?.id === room.owner.id && (
                  <div className="space-y-3">
                    <p className="text-center text-gray-600">This is your room listing</p>
                    <Link
                      to="/profile"
                      className="w-full bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold text-center block"
                    >
                      Manage in Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Facilities Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {room.wifi && (
                  <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                    <WifiIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">WiFi</span>
                  </div>
                )}
                {room.ac && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="h-5 w-5 bg-blue-600 rounded mr-2"></div>
                    <span className="text-blue-800 font-medium">AC</span>
                  </div>
                )}
                {room.furnished && (
                  <div className="flex items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <HomeIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-purple-800 font-medium">Furnished</span>
                  </div>
                )}
                {room.parking && (
                  <div className="flex items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="h-5 w-5 bg-yellow-600 rounded mr-2"></div>
                    <span className="text-yellow-800 font-medium">Parking</span>
                  </div>
                )}
                {room.laundry && (
                  <div className="flex items-center p-3 bg-pink-50 rounded-xl border border-pink-200">
                    <div className="h-5 w-5 bg-pink-600 rounded mr-2"></div>
                    <span className="text-pink-800 font-medium">Laundry</span>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Owner Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    {room.owner.first_name} {room.owner.last_name}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-gray-700">@{room.owner.username}</span>
                </div>
                {room.owner.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{room.owner.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Room Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Room Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Room Type:</span>
                  <span className="font-medium text-gray-900">{room.room_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="font-medium text-gray-900">
                      {new Date(room.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section - Full Width */}
        <div className="lg:col-span-3 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">About This Room</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{room.description}</p>
          </div>
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          roomId={room.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default RoomDetails;
