import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { config } from '../utils/config';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SmartSearch = ({ onSearch, placeholder = "Search for rooms, locations, or landmarks..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Debounced search suggestions
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const fetchSuggestions = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiBaseUrl}/search/suggestions/`, {
        params: { q: searchQuery }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Perform search
    if (onSearch) {
      onSearch(searchQuery);
    }

    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const popularSearches = [
    'Near VNIT Nagpur',
    'PG for girls',
    'Furnished rooms',
    'Under ₹10000',
    'Near IT park',
    'Single occupancy'
  ];

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg bg-white"
        />
        <MagnifyingGlassIcon className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
        
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <h3 className="px-4 py-2 text-sm font-semibold text-gray-700">Suggestions</h3>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion.text);
                    handleSearch(suggestion.text);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <div className="flex items-center flex-1">
                    {suggestion.type === 'location' ? (
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    ) : (
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="text-gray-900">{suggestion.text}</p>
                      {suggestion.subtitle && (
                        <p className="text-sm text-gray-500">{suggestion.subtitle}</p>
                      )}
                    </div>
                  </div>
                  {suggestion.count && (
                    <span className="text-sm text-gray-400">{suggestion.count} rooms</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!loading && suggestions.length === 0 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-4 py-2">
                <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!loading && suggestions.length === 0 && query.length < 2 && (
            <div className="p-2">
              <h3 className="px-4 py-2 text-sm font-semibold text-gray-700">Popular Searches</h3>
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <p>No suggestions found for "{query}"</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Search anyway
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
