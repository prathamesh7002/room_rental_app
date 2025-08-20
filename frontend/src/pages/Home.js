import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import SmartSearch from '../components/SmartSearch';
import AdvancedFilters from '../components/AdvancedFilters';
import MapView from '../components/MapView';
import { config } from '../utils/config';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  HomeIcon,
  StarIcon,
  WifiIcon,
  FireIcon,
  CheckCircleIcon,
  ViewColumnsIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  const applyFiltersAndSearch = React.useCallback(() => {
    let filtered = [...rooms];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(room => 
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.location) {
      filtered = filtered.filter(room => 
        room.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minRent || filters.maxRent) {
      filtered = filtered.filter(room => {
        const rent = parseInt(room.rent);
        return rent >= (filters.minRent || 0) && rent <= (filters.maxRent || 999999);
      });
    }

    if (filters.roomType) {
      filtered = filtered.filter(room => room.room_type === filters.roomType);
    }

    if (filters.genderPreference) {
      filtered = filtered.filter(room => 
        room.gender_preference === filters.genderPreference || 
        room.gender_preference === 'any'
      );
    }

    if (filters.furnished) {
      filtered = filtered.filter(room => room.furnished === filters.furnished);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(room => 
        filters.amenities.every(amenity => 
          room.amenities && room.amenities.includes(amenity)
        )
      );
    }

    setFilteredRooms(filtered);
  }, [rooms, searchQuery, filters]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const fetchFeaturedRooms = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/rooms/`);
      const data = await response.json();
      setRooms(data.results || data);
      setFilteredRooms(data.results || data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <FireIcon className="h-5 w-5 mr-2 text-orange-300" />
              <span className="text-sm font-medium">Trusted by 10,000+ renters</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Find Your
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Perfect Room
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Discover comfortable, verified, and affordable rooms in prime locations. 
              Your dream home is just a search away.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-blue-200 text-sm">Verified Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-blue-200 text-sm">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-blue-200 text-sm">Support</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Search Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <SmartSearch 
                  onSearch={handleSearch}
                  placeholder="Search for rooms, locations, or landmarks..."
                />
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <AdvancedFilters 
                  onFiltersChange={handleFiltersChange}
                  initialFilters={filters}
                />
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'map' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <MapIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {searchQuery || Object.keys(filters).some(key => filters[key]) 
                ? `Search Results (${filteredRooms.length})` 
                : 'Featured Rooms'
              }
            </h2>
            <p className="text-gray-600">
              {searchQuery || Object.keys(filters).some(key => filters[key])
                ? `Found ${filteredRooms.length} rooms matching your criteria`
                : 'Discover the best accommodations in your area'
              }
            </p>
          </div>
          <Link
            to="/find-room"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            View All →
          </Link>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.slice(0, 12).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <MapView 
            rooms={filteredRooms}
            onRoomSelect={handleRoomSelect}
            selectedRoom={selectedRoom}
          />
        )}
        
        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No rooms found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({});
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding your perfect room simple, secure, and stress-free
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Listings</h3>
              <p className="text-gray-600">All our rooms are verified and inspected for quality and authenticity</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Modern Amenities</h3>
              <p className="text-gray-600">High-speed WiFi, AC, and all modern amenities included</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Top Rated</h3>
              <p className="text-gray-600">Highly rated by thousands of satisfied tenants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Rooms Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Rooms</h2>
            <p className="text-xl text-gray-600">Handpicked rooms in prime locations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="h-56 bg-gray-200 relative overflow-hidden">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0].image?.startsWith('http')
                        ? room.images[0].image
                        : `${config.apiBaseUrl.replace('/api', '')}${room.images[0].image}`}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200">
                      <HomeIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                      ₹{room.rent}/mo
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {room.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{room.location}</span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2 text-sm leading-relaxed">
                    {room.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.wifi && (
                      <span className="inline-flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        <WifiIcon className="h-3 w-3 mr-1" />
                        WiFi
                      </span>
                    )}
                    {room.ac && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        AC
                      </span>
                    )}
                    {room.furnished && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                        Furnished
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
            ))}
          </div>
          
          {rooms.length === 0 && (
            <div className="text-center text-gray-500 py-16">
              <HomeIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No rooms available at the moment.</p>
              <p className="text-sm mt-2">Check back soon for new listings!</p>
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link
              to="/find-room"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Explore All Rooms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
