import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const MapView = ({ rooms = [], onRoomSelect, selectedRoom, onLocationChange }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const [, setSearchBox] = useState(null); // searchBox is only needed for the setter
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
        await window.google.maps.importLibrary('marker');

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
        markersRef.current = []; 
        setMapError('Failed to load Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [onLocationChange]);

  // Update markers when rooms or map changes
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));

    // Add new markers
    const newMarkers = rooms.map(room => {
      const marker = new window.google.maps.Marker({
        position: { lat: parseFloat(room.latitude), lng: parseFloat(room.longitude) },
        map,
        title: room.title,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      marker.addListener('click', () => {
        if (onRoomSelect) onRoomSelect(room);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Center map on selected room if available
    if (selectedRoom) {
      const selectedMarker = newMarkers.find(m => m.getTitle() === selectedRoom.title);
      if (selectedMarker) {
        map.panTo(selectedMarker.getPosition());
      }
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
