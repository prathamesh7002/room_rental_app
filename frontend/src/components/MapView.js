import React, { useState, useEffect, useRef } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const MapView = ({ rooms = [], onRoomSelect, selectedRoom, onLocationChange }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchBox, setSearchBox] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const searchInputRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Check if Google Maps is loaded
        if (!window.google) {
          throw new Error('Google Maps not loaded');
        }

        const { Map } = await window.google.maps.importLibrary('maps');
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');

        // Default location (India)
        const defaultCenter = { lat: 20.5937, lng: 78.9629 };

        const mapInstance = new Map(mapRef.current, {
          zoom: 6,
          center: defaultCenter,
          mapId: 'room-rental-map',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMap(mapInstance);

        // Initialize search box
        if (searchInputRef.current) {
          const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current);
          setSearchBox(searchBoxInstance);

          // Listen for place selection
          searchBoxInstance.addListener('places_changed', () => {
            const places = searchBoxInstance.getPlaces();
            if (places.length === 0) return;

            const place = places[0];
            if (place.geometry && place.geometry.location) {
              mapInstance.setCenter(place.geometry.location);
              mapInstance.setZoom(13);
              
              if (onLocationChange) {
                onLocationChange({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  address: place.formatted_address
                });
              }
            }
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(error.message);
        setIsLoading(false);
      }
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=beta`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setMapError('Failed to load Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [onLocationChange]);

  // Update markers when rooms change
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = rooms.map(room => {
      if (!room.latitude || !room.longitude) return null;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = `
        relative bg-white rounded-lg shadow-lg border-2 p-2 cursor-pointer transform transition-transform hover:scale-110
        ${selectedRoom?.id === room.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
      `;
      markerElement.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
            ${room.images?.[0] ? 
              `<img src="${room.images[0].image}" alt="${room.title}" class="w-full h-full object-cover">` :
              `<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>`
            }
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">${room.title}</p>
            <p class="text-xs text-blue-600 font-bold">₹${room.rent}/month</p>
          </div>
        </div>
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
      `;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: parseFloat(room.latitude), lng: parseFloat(room.longitude) },
        map: map,
        content: markerElement,
        title: room.title
      });

      // Add click listener
      markerElement.addEventListener('click', () => {
        if (onRoomSelect) {
          onRoomSelect(room);
        }
      });

      return marker;
    }).filter(Boolean);

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.position);
      });
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, rooms, selectedRoom, onRoomSelect]);

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Unable to load map</p>
          <p className="text-sm text-gray-500">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Search Box */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="h-96 w-full rounded-xl overflow-hidden shadow-lg" />

      {/* Room Count Badge */}
      {rooms.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg border">
          <span className="text-sm font-medium text-gray-700">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}
    </div>
  );
};

export default MapView;
