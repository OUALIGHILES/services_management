import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerPositionChange?: (lat: number, lng: number) => void;
  markerPosition?: { lat: number; lng: number } | null;
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  onMapClick,
  onMarkerPositionChange,
  markerPosition,
  className = '',
  children
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    let mapScript: HTMLScriptElement | null = null;
    let isMounted = true;

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      initializeMap();
    } else {
      // Check if script is already added
      const existingScript = document.querySelector('script[src*="googleapis.com/maps"]');
      if (existingScript) {
        // Wait for the existing script to load
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps && isMounted) {
            clearInterval(checkInterval);
            setIsGoogleMapsLoaded(true);
            initializeMap();
          }
        }, 100);
      } else {
        // Add the script
        mapScript = document.createElement('script');
        // Using a placeholder API key for now - this should be replaced with a real key
        const apiKey = 'AIzaSyCYrHtQ0H82uU3WgJ3Y37R5g2BjyYJZ000'; // Placeholder key
        mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        mapScript.async = true;
        mapScript.defer = true;
        document.head.appendChild(mapScript);

        // Set the global initMap function
        window.initMap = () => {
          if (isMounted) {
            setIsGoogleMapsLoaded(true);
            initializeMap();
          }
        };

        // Handle script loading errors
        mapScript.onerror = () => {
          console.error('Failed to load Google Maps API. Please check your API key.');
          if (isMounted) {
            // Fallback to a simple map representation if API fails to load
            setIsGoogleMapsLoaded(false);
          }
        };
      }
    }

    function initializeMap() {
      if (!mapRef.current || !window.google || !window.google.maps || !isMounted) return;

      // Create the map with Saudi Arabia boundaries restriction
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        restriction: {
          latLngBounds: {
            north: 32.1517, // Northern boundary of Saudi Arabia
            south: 16.3421, // Southern boundary of Saudi Arabia
            east: 55.6667,  // Eastern boundary of Saudi Arabia
            west: 34.5000   // Western boundary of Saudi Arabia
          },
          strictBounds: true,
        },
      });

      mapInstance.current = map;

      // Add click listener to the map
      if (onMapClick) {
        map.addListener('click', (event: any) => {
          if (!isMounted) return;
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onMapClick(lat, lng);
        });
      }

      // Set marker if position is provided
      if (markerPosition) {
        setMarker(markerPosition.lat, markerPosition.lng);
      }

      setIsMapLoaded(true);
    }

    function setMarker(lat: number, lng: number) {
      if (!isMounted || !mapInstance.current || !window.google || !window.google.maps) return;

      // Remove existing marker if it exists
      if (markerInstance.current) {
        try {
          markerInstance.current.setMap(null);
        } catch (e) {
          console.warn('Error removing marker:', e);
        }
        markerInstance.current = null;
      }

      // Create new marker
      markerInstance.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: 'Selected Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      // Center the map on the marker
      mapInstance.current.setCenter({ lat, lng });
    }

    // Update marker position when markerPosition prop changes
    if (isGoogleMapsLoaded && markerPosition && mapInstance.current) {
      setMarker(markerPosition.lat, markerPosition.lng);
    } else if (isGoogleMapsLoaded && !markerPosition && markerInstance.current) {
      // Remove marker if position is null
      try {
        markerInstance.current.setMap(null);
      } catch (e) {
        console.warn('Error removing marker:', e);
      }
      markerInstance.current = null;
    }

    // Cleanup function
    return () => {
      isMounted = false;

      // Remove marker
      if (markerInstance.current) {
        try {
          markerInstance.current.setMap(null);
        } catch (e) {
          console.warn('Error removing marker during cleanup:', e);
        }
        markerInstance.current = null;
      }

      // Remove map instance
      if (mapInstance.current) {
        // Reset map to a neutral position before cleanup
        try {
          mapInstance.current.setOptions({ zoom: 1, center: { lat: 0, lng: 0 } });
        } catch (e) {
          console.warn('Error resetting map options:', e);
        }
        mapInstance.current = null;
      }

      // Remove script if it was added by this component
      if (mapScript) {
        document.head.removeChild(mapScript);
      }
    };
  }, [center, zoom, markerPosition, onMapClick]);

  // Update marker position when markerPosition prop changes
  useEffect(() => {
    if (markerPosition && mapInstance.current && window.google && window.google.maps) {
      // Update existing marker position or create new one
      if (markerInstance.current) {
        markerInstance.current.setPosition({ lat: markerPosition.lat, lng: markerPosition.lng });
        mapInstance.current.setCenter({ lat: markerPosition.lat, lng: markerPosition.lng });
      } else {
        // Create marker if it doesn't exist
        markerInstance.current = new window.google.maps.Marker({
          position: { lat: markerPosition.lat, lng: markerPosition.lng },
          map: mapInstance.current,
          title: 'Selected Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
        mapInstance.current.setCenter({ lat: markerPosition.lat, lng: markerPosition.lng });
      }
      
      if (onMarkerPositionChange) {
        onMarkerPositionChange(markerPosition.lat, markerPosition.lng);
      }
    } else if (!markerPosition && markerInstance.current) {
      // Remove marker if position is null
      try {
        markerInstance.current.setMap(null);
      } catch (e) {
        console.warn('Error removing marker:', e);
      }
      markerInstance.current = null;
    }
  }, [markerPosition, onMarkerPositionChange]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isGoogleMapsLoaded ? (
        <>
          <div ref={mapRef} className="w-full h-full" />
          {children}
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-indigo-200 rounded-lg">
          <div className="text-center p-6">
            <MapPin className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-indigo-700 mb-2">KSA Location Map</h3>
            <p className="text-indigo-500 mb-4">Google Maps API failed to load</p>
            <p className="text-sm text-muted-foreground">Please check your API key or network connection</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;