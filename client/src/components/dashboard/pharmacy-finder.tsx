import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, MapPinIcon, Clock } from "lucide-react";
import type { Pharmacy, Inventory, Medication } from "@shared/schema";
import { useState } from "react";

export default function PharmacyFinder() {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(10); // km

  const { data: pharmacies } = useQuery<Pharmacy[]>({
    queryKey: ["/api/pharmacies/search", coordinates?.lat, coordinates?.lng, searchRadius],
    enabled: !!coordinates,
  });

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  // Get inventory for each pharmacy
  const pharmacyInventories = useQuery<Record<number, Inventory[]>>({
    queryKey: ["/api/pharmacies/inventory", pharmacies?.map(p => p.id)],
    enabled: !!pharmacies?.length,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    queryFn: async () => {
      const inventories: Record<number, Inventory[]> = {};
      if (!pharmacies) return inventories;

      await Promise.all(
        pharmacies.map(async (pharmacy) => {
          const response = await fetch(`/api/pharmacies/${pharmacy.id}/inventory`);
          const data = await response.json();
          inventories[pharmacy.id] = data;
        })
      );

      return inventories;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find a Pharmacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={getLocation}
              className="flex items-center gap-2"
            >
              <MapPinIcon className="h-4 w-4" />
              Use My Location
            </Button>
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Search radius (km)"
                className="pl-9"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {pharmacies?.map((pharmacy) => (
              <Card key={pharmacy.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                      <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}
                      </p>
                    </div>
                    <Badge variant={pharmacy.isActive ? "default" : "secondary"}>
                      {pharmacy.isActive ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {pharmacy.operatingHours}
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <h4 className="text-sm font-medium mb-2">Available Medications:</h4>
                      <div className="space-y-1">
                        {pharmacyInventories.data?.[pharmacy.id]?.map((item) => {
                          const medication = medications?.find(m => m.id === item.medicationId);
                          if (!medication) return null;

                          return (
                            <div 
                              key={item.id} 
                              className="flex justify-between items-center text-sm"
                            >
                              <span>{medication.name}</span>
                              <Badge variant={item.quantity > 0 ? "default" : "secondary"}>
                                {item.quantity} in stock
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}