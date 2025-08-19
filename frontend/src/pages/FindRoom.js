import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import SmartSearch from '../components/SmartSearch';
import AdvancedFilters from '../components/AdvancedFilters';
import MapView from '../components/MapView';
import axios from 'axios';
import { config } from '../utils/config';
import { 
  ViewColumnsIcon,
  MapIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const FindRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchParams] = useSearchParams();

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiBaseUrl}/rooms/`);
      setRooms(response.data.results || response.data);
      setFilteredRooms(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    
    // Initialize from URL params
    const initialQuery = searchParams.get('q') || '';
    const initialLocation = searchParams.get('location') || '';
    
    if (initialQuery) setSearchQuery(initialQuery);
    if (initialLocation) setFilters({ location: initialLocation });
  }, [searchParams, fetchRooms]);

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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Room</h1>
          <p className="text-gray-600">Discover the best accommodations with our advanced search and filters</p>
        </div>
        
        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="mb-6">
            <SmartSearch 
              onSearch={handleSearch}
              placeholder="Search for rooms, locations, or landmarks..."
              initialQuery={searchQuery}
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

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading rooms...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results ({filteredRooms.length})
                </h2>
                <p className="text-gray-600">
                  {searchQuery || Object.keys(filters).length > 0
                    ? `Found ${filteredRooms.length} rooms matching your criteria`
                    : `Showing all ${filteredRooms.length} available rooms`
                  }
                </p>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRooms.map((room) => (
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
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FindRoom;
