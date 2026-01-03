import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface SimulatedMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  onMapClick?: (lat: number, lng: number) => void;
  markerPosition?: { lat: number; lng: number } | null;
  className?: string;
  children?: React.ReactNode;
}

const SimulatedMap: React.FC<SimulatedMapProps> = ({
  center,
  zoom,
  onMapClick,
  markerPosition,
  className = '',
  children
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Simulated map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current || !onMapClick) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate relative position (0-1) and convert to lat/lng
    // This is a simplified simulation
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    // Calculate coordinates based on Saudi Arabia bounds
    const south = 16.3421;
    const north = 32.1517;
    const west = 34.5000;
    const east = 55.6667;
    
    const lat = north - (yPercent * (north - south));
    const lng = west + (xPercent * (east - west));
    
    onMapClick(lat, lng);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={mapRef}
        className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 border border-muted rounded-lg cursor-pointer overflow-hidden relative"
        onClick={handleMapClick}
      >
        {/* Simulated map with roads and landmarks */}
        <div className="absolute inset-0">
          {/* Grid lines for roads */}
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-300 opacity-50"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 opacity-50"></div>
          <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-300 opacity-50"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-gray-300 opacity-50"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 opacity-50"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-gray-300 opacity-50"></div>
          
          {/* Simulated landmarks */}
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="absolute top-2/5 left-2/5 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute top-1/5 left-1/5 w-2 h-2 bg-purple-500 rounded-full"></div>
          <div className="absolute top-3/5 left-3/5 w-2 h-2 bg-yellow-500 rounded-full"></div>
          
          {/* Water areas */}
          <div className="absolute bottom-0 left-0 w-1/4 h-1/5 bg-blue-200 rounded-tl-lg opacity-70"></div>
          <div className="absolute top-0 right-0 w-1/5 h-1/4 bg-blue-200 rounded-br-lg opacity-70"></div>
        </div>

        {/* Map controls */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md z-10">
          <h3 className="font-bold text-sm text-gray-800">KSA Location Map</h3>
        </div>
        
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button className="bg-white p-2 rounded shadow-md hover:bg-gray-50">
            <div className="w-4 h-4 border border-gray-400"></div>
          </button>
          <button className="bg-white p-2 rounded shadow-md hover:bg-gray-50">
            <div className="w-4 h-4 border-t-2 border-l-2 border-gray-400 transform rotate-45 origin-bottom-left"></div>
          </button>
          <button className="bg-white p-2 rounded shadow-md hover:bg-gray-50">
            <div className="w-4 h-4 border-b-2 border-r-2 border-gray-400 transform -rotate-45 origin-top-left"></div>
          </button>
        </div>

        {/* Selected location marker */}
        {markerPosition && (
          <div
            className="absolute w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full border-4 border-white shadow-2xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-bounce"
            style={{
              left: `${((markerPosition.lng - 34.5) / (55.6667 - 34.5)) * 100}%`,
              top: `${((32.1517 - markerPosition.lat) / (32.1517 - 16.3421)) * 100}%`,
            }}
          >
            <MapPin className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Click instruction when no location is selected */}
        {!markerPosition && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg border-2 border-white">
            <p className="text-sm font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Click anywhere on the map to select a location
            </p>
          </div>
        )}
      </div>
      
      {children}
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatedMap;