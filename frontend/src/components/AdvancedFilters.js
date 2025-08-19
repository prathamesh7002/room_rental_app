import React, { useState, useEffect } from 'react';
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  HomeIcon,
  UserGroupIcon,
  WifiIcon,
  FireIcon,
  TruckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AdvancedFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minRent: 0,
    maxRent: 50000,
    roomType: '',
    genderPreference: '',
    furnished: '',
    amenities: [],
    availableFrom: '',
    ...initialFilters
  });

  const roomTypes = [
    { value: 'pg', label: 'PG (Paying Guest)' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'flat', label: 'Flat/Apartment' },
    { value: 'shared', label: 'Shared Room' },
    { value: 'single', label: 'Single Room' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male Only' },
    { value: 'female', label: 'Female Only' },
    { value: 'any', label: 'Any Gender' }
  ];

  const furnishedOptions = [
    { value: 'furnished', label: 'Furnished' },
    { value: 'semi-furnished', label: 'Semi-Furnished' },
    { value: 'unfurnished', label: 'Unfurnished' }
  ];

  const amenitiesList = [
    { value: 'wifi', label: 'WiFi', icon: WifiIcon },
    { value: 'ac', label: 'AC', icon: FireIcon },
    { value: 'food', label: 'Food Included', icon: HomeIcon },
    { value: 'laundry', label: 'Laundry', icon: TruckIcon },
    { value: 'parking', label: 'Parking', icon: TruckIcon },
    { value: 'gym', label: 'Gym', icon: UserGroupIcon },
    { value: 'security', label: '24/7 Security', icon: CheckCircleIcon },
    { value: 'power_backup', label: 'Power Backup', icon: FireIcon }
  ];

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const handleInputChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minRent: 0,
      maxRent: 50000,
      roomType: '',
      genderPreference: '',
      furnished: '',
      amenities: [],
      availableFrom: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.minRent > 0 || filters.maxRent < 50000) count++;
    if (filters.roomType) count++;
    if (filters.genderPreference) count++;
    if (filters.furnished) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.availableFrom) count++;
    return count;
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-600" />
        <span className="text-gray-700 font-medium">Filters</span>
        {getActiveFiltersCount() > 0 && (
          <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
            {getActiveFiltersCount()}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter area, landmark, or city"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyRupeeIcon className="h-4 w-4 inline mr-1" />
                Budget Range
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={filters.minRent}
                    onChange={(e) => handleInputChange('minRent', parseInt(e.target.value) || 0)}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    value={filters.maxRent}
                    onChange={(e) => handleInputChange('maxRent', parseInt(e.target.value) || 50000)}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={filters.maxRent}
                    onChange={(e) => handleInputChange('maxRent', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹25k</span>
                    <span>₹50k+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <HomeIcon className="h-4 w-4 inline mr-1" />
                Room Type
              </label>
              <select
                value={filters.roomType}
                onChange={(e) => handleInputChange('roomType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {roomTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="h-4 w-4 inline mr-1" />
                Gender Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {genderOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('genderPreference', 
                      filters.genderPreference === option.value ? '' : option.value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      filters.genderPreference === option.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Furnished Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Furnished Status
              </label>
              <div className="space-y-2">
                {furnishedOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="furnished"
                      value={option.value}
                      checked={filters.furnished === option.value}
                      onChange={(e) => handleInputChange('furnished', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 gap-2">
                {amenitiesList.map(amenity => {
                  const IconComponent = amenity.icon;
                  return (
                    <button
                      key={amenity.value}
                      onClick={() => handleAmenityToggle(amenity.value)}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg border transition-colors ${
                        filters.amenities.includes(amenity.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {amenity.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available From
              </label>
              <input
                type="date"
                value={filters.availableFrom}
                onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
