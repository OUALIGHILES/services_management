import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Camera, Upload, X } from 'lucide-react';
import SimulatedMap from './SimulatedMap';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface KsaMapProps {
  onLocationSelect: (location: Location) => void;
  onImageUpload: (image: string) => void;
  initialLocation?: Location;
  initialImage?: string;
}

const KsaMap: React.FC<KsaMapProps> = ({
  onLocationSelect,
  onImageUpload,
  initialLocation,
  initialImage
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(() => {
    if (initialLocation) {
      // If initial location has no address, generate one
      if (!initialLocation.address) {
        const address = generateAddressFromCoordinates(initialLocation.lat, initialLocation.lng);
        return { ...initialLocation, address };
      }
      return initialLocation;
    }
    return null;
  });
  const [locationImage, setLocationImage] = useState<string | null>(initialImage || null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saudi Arabia coordinates (Riyadh center)
  const SAUDI_CENTER = { lat: 24.7742, lng: 46.7386 };
  const SAUDI_BOUNDS = {
    north: 32.1517, // Northern boundary
    south: 16.3421, // Southern boundary
    east: 55.6667,  // Eastern boundary
    west: 34.5000   // Western boundary
  };

  // Function to generate realistic Saudi Arabian addresses based on coordinates
  const generateAddressFromCoordinates = (lat: number, lng: number): string => {
    // Define major Saudi cities with their coordinates
    const cities = [
      { name: 'Riyadh', lat: 24.7742, lng: 46.7386 },
      { name: 'Jeddah', lat: 21.5434, lng: 39.1728 },
      { name: 'Mecca', lat: 21.4225, lng: 39.8262 },
      { name: 'Medina', lat: 24.5247, lng: 39.5692 },
      { name: 'Dammam', lat: 26.4344, lng: 50.1032 },
      { name: 'Khobar', lat: 26.2825, lng: 50.2067 },
      { name: 'Tabuk', lat: 28.3833, lng: 36.5833 },
      { name: 'Al Khobar', lat: 26.2825, lng: 50.2067 },
      { name: 'Jubail', lat: 27.0422, lng: 49.6670 },
      { name: 'Abha', lat: 18.2164, lng: 42.5053 },
      { name: 'Taif', lat: 21.2854, lng: 40.4033 },
      { name: 'Al Hofuf', lat: 25.3567, lng: 49.5788 },
      { name: 'Yanbu', lat: 24.0863, lng: 38.0830 },
      { name: 'Najran', lat: 17.4987, lng: 44.1312 },
      { name: 'Arar', lat: 30.9749, lng: 41.0366 },
      { name: 'Hail', lat: 27.5216, lng: 41.6913 },
      { name: 'Sakaka', lat: 29.9695, lng: 40.2064 },
      { name: 'Al Qatif', lat: 26.5320, lng: 50.0410 },
      { name: 'Al Mubarraz', lat: 25.3542, lng: 49.5877 },
      { name: 'Buraidah', lat: 26.3263, lng: 43.9779 }
    ];

    // Find the closest city to the selected coordinates
    let closestCity = cities[0];
    let minDistance = Number.MAX_VALUE;

    for (const city of cities) {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    // Generate a realistic address based on the closest city
    if (minDistance < 0.5) { // If within 0.5 degrees (roughly 55km), consider it near the city
      // Generate a random street address near the city
      const streetNumbers = ['123', '456', '789', '101', '202', '303', '404', '505', '606', '707'];
      const streetNames = [
        'King Abdulaziz Street', 'Prince Mohammed bin Salman Road', 'Al Batha Street',
        'Olaya Street', 'Tahlia Street', 'King Fahd Road', 'Al Mada Street',
        'Salah Al Din Street', 'Al Qasr Al Maqta Street', 'Al Imarah Al Yamamah Street'
      ];

      const randomStreetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
      const randomStreetName = streetNames[Math.floor(Math.random() * streetNames.length)];

      return `${randomStreetNumber} ${randomStreetName}, ${closestCity.name}, Saudi Arabia`;
    } else {
      // If not near a major city, return a generic location
      return `Near ${closestCity.name}, Saudi Arabia - ${Math.abs(lat).toFixed(4)}°N, ${Math.abs(lng).toFixed(4)}°E`;
    }
  };

  // Handle map click to select location
  const handleMapClick = (lat: number, lng: number) => {
    // Generate a realistic address based on coordinates
    const address = generateAddressFromCoordinates(lat, lng);

    const newLocation: Location = {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      address: address
    };

    setSelectedLocation(newLocation);
    onLocationSelect(newLocation);
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      // Simulate searching for locations in Saudi Arabia
      const simulatedLocations: Record<string, Location> = {
        'riyadh': {
          lat: 24.7742,
          lng: 46.7386,
          address: 'Riyadh, Saudi Arabia'
        },
        'jeddah': {
          lat: 21.5434,
          lng: 39.1728,
          address: 'Jeddah, Saudi Arabia'
        },
        'mecca': {
          lat: 21.4225,
          lng: 39.8262,
          address: 'Mecca, Saudi Arabia'
        },
        'medina': {
          lat: 24.5247,
          lng: 39.5692,
          address: 'Medina, Saudi Arabia'
        },
        'dammam': {
          lat: 26.4344,
          lng: 50.1032,
          address: 'Dammam, Saudi Arabia'
        },
        'khobar': {
          lat: 26.2825,
          lng: 50.2067,
          address: 'Khobar, Saudi Arabia'
        },
        'tabuk': {
          lat: 28.3833,
          lng: 36.5833,
          address: 'Tabuk, Saudi Arabia'
        }
      };

      const query = searchQuery.toLowerCase();
      let foundLocation: Location | null = null;

      // Check if the query matches any known locations
      for (const [key, location] of Object.entries(simulatedLocations)) {
        if (key.includes(query) || query.includes(key)) {
          foundLocation = location;
          break;
        }
      }

      // If no specific location found, use a general location near Riyadh
      if (!foundLocation) {
        const lat = SAUDI_CENTER.lat + (Math.random() - 0.5) * 0.5;
        const lng = SAUDI_CENTER.lng + (Math.random() - 0.5) * 0.5;
        const address = generateAddressFromCoordinates(lat, lng);

        foundLocation = {
          lat: lat,
          lng: lng,
          address: address
        };
      }

      setSelectedLocation(foundLocation);
      onLocationSelect(foundLocation);
      setSearchQuery(''); // Clear the search after selection
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setImagePreview(imageData);
        setLocationImage(imageData);
        onImageUpload(imageData); // Notify parent component
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImagePreview(null);
    setLocationImage(null);
    onImageUpload(''); // Notify parent component that image is removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for location in Saudi Arabia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline">
          <MapPin className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full h-80">
            <SimulatedMap
              center={SAUDI_CENTER}
              zoom={6}
              onMapClick={handleMapClick}
              markerPosition={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null}
              className="h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      {selectedLocation && (
        <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-green-800">Selected Location</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {selectedLocation.address || `Lat: ${selectedLocation.lat.toFixed(6)}, Lng: ${selectedLocation.lng.toFixed(6)}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => {
                  setSelectedLocation(null);
                  onLocationSelect({ lat: 0, lng: 0 });
                }}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Upload */}
      <div className="space-y-4">
        <h4 className="font-medium">Location Image</h4>

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Location preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={removeImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-1">Click to upload location photo</p>
            <p className="text-xs text-muted-foreground">For hard-to-describe locations</p>
            <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />

        {!imagePreview && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Location Photo
          </Button>
        )}
      </div>
    </div>
  );
};

export default KsaMap;