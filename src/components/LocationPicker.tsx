import React, { useState, useEffect } from "react";
import { MapPin, Search, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocationPickerProps {
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: { latitude: number; longitude: number; address: string };
}

const LocationPicker = ({
  onLocationChange = () => {},
  initialLocation = {
    latitude: 40.7128,
    longitude: -74.006,
    address: "New York, NY, USA",
  },
}: LocationPickerProps) => {
  const [location, setLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLocationDetection = () => {
    setIsLocating(true);
    setError(null);

    // Simulate geolocation API
    setTimeout(() => {
      // Simulate successful geolocation
      const success = Math.random() > 0.2; // 80% success rate for demo

      if (success) {
        // Simulate getting a nearby location with slight variation
        const newLocation = {
          latitude: location.latitude + (Math.random() * 0.01 - 0.005),
          longitude: location.longitude + (Math.random() * 0.01 - 0.005),
          address: "Detected Location, City, Country",
        };

        setLocation(newLocation);
        onLocationChange(newLocation);
      } else {
        setError(
          "Unable to detect your location. Please try again or enter manually.",
        );
      }

      setIsLocating(false);
    }, 2000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    // Simulate geocoding search
    const newLocation = {
      latitude: location.latitude + (Math.random() * 0.1 - 0.05),
      longitude: location.longitude + (Math.random() * 0.1 - 0.05),
      address: searchQuery,
    };

    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get relative position in the map container
    const mapContainer = e.currentTarget;
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to "coordinates" (this is just for UI demonstration)
    const newLat = location.latitude + (y / rect.height - 0.5) * -0.02;
    const newLng = location.longitude + (x / rect.width - 0.5) * 0.04;

    const newLocation = {
      latitude: newLat,
      longitude: newLng,
      address: `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`,
    };

    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  return (
    <div className="w-full space-y-4 bg-background">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <h3 className="text-lg font-medium">Select Location</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLocationDetection}
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Locate className="mr-2 h-4 w-4 animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <Locate className="mr-2 h-4 w-4" />
              Detect My Location
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for address or place"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div
            className="relative w-full h-[400px] bg-muted overflow-hidden"
            onClick={handleMapClick}
          >
            {!mapLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {/* Placeholder for actual map - in a real app, this would be a Google Maps or Leaflet component */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80')] bg-cover bg-center opacity-70"></div>

                {/* Centered marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary">
                  <MapPin className="h-8 w-8 animate-bounce" />
                </div>

                {/* Instructions overlay */}
                <div className="absolute bottom-4 left-0 right-0 mx-auto w-max bg-background/80 px-4 py-2 rounded-md text-sm">
                  Click on the map to adjust the location
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm">
        <div className="font-medium">Selected Location:</div>
        <div className="text-muted-foreground break-words">
          {location.address}
        </div>
        <div className="text-muted-foreground text-xs mt-1">
          Coordinates: {location.latitude.toFixed(6)},{" "}
          {location.longitude.toFixed(6)}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
