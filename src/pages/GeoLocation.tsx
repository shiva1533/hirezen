import { useState } from "react";
import { Search, School, Building2, MapPin } from "lucide-react";
import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Institution {
  name: string;
  type: "school" | "college";
  lat: number;
  lng: number;
  city: string;
  address: string;
}

interface SearchLocation {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

const GeoLocation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [filter, setFilter] = useState<"all" | "school" | "college">("all");
  const [searchedLocation, setSearchedLocation] = useState<SearchLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Sample data for schools and colleges in major Indian cities
  const institutions: Institution[] = [
    // Delhi
    { name: "Delhi University", type: "college", lat: 28.6906, lng: 77.2136, city: "Delhi", address: "University Rd, University Enclave" },
    { name: "IIT Delhi", type: "college", lat: 28.5450, lng: 77.1926, city: "Delhi", address: "Hauz Khas, New Delhi" },
    { name: "Jawaharlal Nehru University", type: "college", lat: 28.5428, lng: 77.1670, city: "Delhi", address: "New Mehrauli Road, Delhi" },
    { name: "DPS RK Puram", type: "school", lat: 28.5620, lng: 77.1760, city: "Delhi", address: "Sector 12, RK Puram" },
    { name: "Amity University", type: "college", lat: 28.5050, lng: 77.3151, city: "Delhi", address: "Noida, Delhi NCR" },
    
    // Mumbai
    { name: "IIT Bombay", type: "college", lat: 19.1334, lng: 72.9133, city: "Mumbai", address: "Powai, Mumbai" },
    { name: "Mumbai University", type: "college", lat: 18.9750, lng: 72.8258, city: "Mumbai", address: "Fort, Mumbai" },
    { name: "SNDT Women's University", type: "college", lat: 19.0176, lng: 72.8428, city: "Mumbai", address: "Churchgate, Mumbai" },
    { name: "Bombay Scottish School", type: "school", lat: 19.0760, lng: 72.8777, city: "Mumbai", address: "Mahim, Mumbai" },
    { name: "St. Xavier's College", type: "college", lat: 18.9488, lng: 72.8318, city: "Mumbai", address: "Mumbai Central, Mumbai" },
    
    // Bangalore
    { name: "IISc Bangalore", type: "college", lat: 13.0218, lng: 77.5671, city: "Bangalore", address: "CV Raman Nagar, Bangalore" },
    { name: "Bangalore University", type: "college", lat: 13.0034, lng: 77.5666, city: "Bangalore", address: "Jnana Bharathi, Bangalore" },
    { name: "Christ University", type: "college", lat: 12.9344, lng: 77.6061, city: "Bangalore", address: "Hosur Road, Bangalore" },
    { name: "Bishop Cotton Boys School", type: "school", lat: 12.9716, lng: 77.5946, city: "Bangalore", address: "St Marks Rd, Bangalore" },
    { name: "PESIT", type: "college", lat: 12.9349, lng: 77.5340, city: "Bangalore", address: "BSK Stage, Bangalore" },
    
    // Chennai
    { name: "IIT Madras", type: "college", lat: 12.9915, lng: 80.2337, city: "Chennai", address: "Sardar Patel Rd, Chennai" },
    { name: "Anna University", type: "college", lat: 13.0113, lng: 80.2329, city: "Chennai", address: "Guindy, Chennai" },
    { name: "Loyola College", type: "college", lat: 13.0619, lng: 80.2489, city: "Chennai", address: "Nungambakkam, Chennai" },
    { name: "DAV School Chennai", type: "school", lat: 13.0827, lng: 80.2707, city: "Chennai", address: "Mogappair, Chennai" },
    { name: "Madras Christian College", type: "college", lat: 12.9936, lng: 80.2481, city: "Chennai", address: "Tambaram, Chennai" },
    
    // Hyderabad
    { name: "University of Hyderabad", type: "college", lat: 17.4590, lng: 78.3260, city: "Hyderabad", address: "Gachibowli, Hyderabad" },
    { name: "BITS Pilani Hyderabad", type: "college", lat: 17.5449, lng: 78.5718, city: "Hyderabad", address: "Jawahar Nagar, Hyderabad" },
    { name: "Narayana College", type: "college", lat: 17.4381, lng: 78.4482, city: "Hyderabad", address: "Kukatpally, Hyderabad" },
    { name: "IIIT Hyderabad", type: "college", lat: 17.4453, lng: 78.3489, city: "Hyderabad", address: "Gachibowli, Hyderabad" },
    { name: "Osmania University", type: "college", lat: 17.4124, lng: 78.5291, city: "Hyderabad", address: "Amberpet, Hyderabad" },
    { name: "Oakridge International School", type: "school", lat: 17.4239, lng: 78.4738, city: "Hyderabad", address: "Bachupally, Hyderabad" },
    { name: "Narayana School", type: "school", lat: 17.4939, lng: 78.3943, city: "Hyderabad", address: "Madhapur, Hyderabad" },
    
    // Kolkata
    { name: "IIT Kharagpur", type: "college", lat: 22.3149, lng: 87.3105, city: "Kharagpur", address: "Kharagpur, West Bengal" },
    { name: "Jadavpur University", type: "college", lat: 22.4991, lng: 88.3715, city: "Kolkata", address: "Jadavpur, Kolkata" },
    { name: "Presidency University", type: "college", lat: 22.5743, lng: 88.3629, city: "Kolkata", address: "College Street, Kolkata" },
    { name: "La Martiniere School", type: "school", lat: 22.5431, lng: 88.3503, city: "Kolkata", address: "Loudon St, Kolkata" },
    { name: "St. Xavier's College Kolkata", type: "college", lat: 22.5481, lng: 88.3519, city: "Kolkata", address: "Park Street, Kolkata" },
    
    // Pune
    { name: "University of Pune", type: "college", lat: 18.5470, lng: 73.8267, city: "Pune", address: "Ganeshkhind, Pune" },
    { name: "COEP Pune", type: "college", lat: 18.5286, lng: 73.8670, city: "Pune", address: "Shivajinagar, Pune" },
    { name: "Symbiosis International University", type: "college", lat: 18.5089, lng: 73.8077, city: "Pune", address: "Senapati Bapat Road, Pune" },
    { name: "Bishop's School Pune", type: "school", lat: 18.5204, lng: 73.8567, city: "Pune", address: "Camp, Pune" },
    { name: "Fergusson College", type: "college", lat: 18.5196, lng: 73.8353, city: "Pune", address: "Shivajinagar, Pune" },
    
    // Ahmedabad
    { name: "IIT Gandhinagar", type: "college", lat: 23.2156, lng: 72.6369, city: "Gandhinagar", address: "Palaj, Gandhinagar" },
    { name: "Gujarat University", type: "college", lat: 23.0391, lng: 72.5066, city: "Ahmedabad", address: "Navrangpura, Ahmedabad" },
    { name: "CEPT University", type: "college", lat: 23.0349, lng: 72.5630, city: "Ahmedabad", address: "University Road, Ahmedabad" },
    { name: "Delhi Public School Ahmedabad", type: "school", lat: 23.0225, lng: 72.5714, city: "Ahmedabad", address: "Bopal, Ahmedabad" },
    { name: "Nirma University", type: "college", lat: 23.1268, lng: 72.5464, city: "Ahmedabad", address: "SG Highway, Ahmedabad" },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // First, try to find in existing institutions
    const found = institutions.find(
      (inst) =>
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setSelectedInstitution(found);
      setSearchedLocation(null);
      toast({
        title: "Institution found",
        description: `${found.name} in ${found.city}`,
      });
      return;
    }

    // If not found, use Nominatim geocoding API
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HireZen-GeoLocation'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const location: SearchLocation = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.name || searchQuery,
          address: result.display_name
        };

        setSearchedLocation(location);
        setSelectedInstitution(null);
        toast({
          title: "Location found",
          description: location.name,
        });
      } else {
        toast({
          title: "No results",
          description: "Location not found. Please try a different search.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Filter institutions based on selected filter
  const filteredInstitutions = institutions.filter((inst) => {
    if (filter === "all") return true;
    return inst.type === filter;
  });

  // Determine what location to display on the map
  const currentLocation = searchedLocation 
    ? searchedLocation 
    : selectedInstitution 
    ? selectedInstitution 
    : filteredInstitutions[0] || institutions[0];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Geo-location
                </h1>
                <p className="text-muted-foreground mt-1">
                  Schools and colleges across India
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Search bar */}
              <Card className="p-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search institution, city, or any place name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !isSearching && handleSearch()}
                      className="pl-9"
                      disabled={isSearching}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={!searchQuery || isSearching}>
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </Card>

              {/* Filter Toggles */}
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Filter:</span>
                    <div className="flex gap-2">
                      <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                      >
                        All ({institutions.length})
                      </Button>
                      <Button
                        variant={filter === "school" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("school")}
                        className={filter === "school" ? "" : "hover:bg-primary/10"}
                      >
                        <School className="h-4 w-4 mr-1" />
                        Schools ({institutions.filter(i => i.type === "school").length})
                      </Button>
                      <Button
                        variant={filter === "college" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("college")}
                        className={filter === "college" ? "" : "hover:bg-green-500/10"}
                      >
                        <Building2 className="h-4 w-4 mr-1" />
                        Colleges ({institutions.filter(i => i.type === "college").length})
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Showing: {filteredInstitutions.length} institution{filteredInstitutions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </Card>

              {/* Current Location Display */}
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  {searchedLocation ? (
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                  ) : selectedInstitution ? (
                    <div className={`p-2 rounded-lg ${selectedInstitution.type === "school" ? "bg-primary/10" : "bg-green-500/10"}`}>
                      {selectedInstitution.type === "school" ? (
                        <School className="h-5 w-5 text-primary" />
                      ) : (
                        <Building2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ) : (
                    <div className={`p-2 rounded-lg ${(filteredInstitutions[0] || institutions[0])?.type === "school" ? "bg-primary/10" : "bg-green-500/10"}`}>
                      {(filteredInstitutions[0] || institutions[0])?.type === "school" ? (
                        <School className="h-5 w-5 text-primary" />
                      ) : (
                        <Building2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{currentLocation.name}</h3>
                    {searchedLocation ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        Search Result
                      </p>
                    ) : selectedInstitution ? (
                      <p className="text-sm text-muted-foreground capitalize mt-1">
                        {selectedInstitution.type} - {selectedInstitution.city}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground capitalize mt-1">
                        {(filteredInstitutions[0] || institutions[0])?.type} - {(filteredInstitutions[0] || institutions[0])?.city}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {currentLocation.address}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Google Maps Embed */}
              <Card className="p-0 overflow-hidden">
                <div className="rounded-lg overflow-hidden">
                  <MapContainer
                    key={`${currentLocation.lat},${currentLocation.lng}`}
                    center={[currentLocation.lat, currentLocation.lng]}
                    zoom={14}
                    className="w-full"
                    style={{ height: 600 }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[currentLocation.lat, currentLocation.lng]}
                      radius={10}
                      pathOptions={{ 
                        color: searchedLocation ? 'hsl(217, 91%, 60%)' : 'hsl(var(--primary))', 
                        fillColor: searchedLocation ? 'hsl(217, 91%, 60%)' : 'hsl(var(--primary))', 
                        fillOpacity: 0.2 
                      }}
                    >
                      <Popup>
                        <div>
                          <div className="font-semibold">{currentLocation.name}</div>
                          {searchedLocation ? (
                            <div className="text-xs text-muted-foreground mt-1">Search Result</div>
                          ) : selectedInstitution ? (
                            <div className="text-xs text-muted-foreground">{selectedInstitution.city}</div>
                          ) : null}
                          <div className="text-xs text-muted-foreground mt-1">{currentLocation.address}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
              </Card>

              {/* Institutions List */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">
                  {filter === "all" ? "All Institutions" : filter === "school" ? "Schools" : "Colleges"}
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredInstitutions.map((inst, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedInstitution(inst);
                        toast({
                          title: "Selected",
                          description: inst.name,
                        });
                      }}
                      className={`p-3 rounded-lg border transition-colors text-left ${
                        selectedInstitution?.name === inst.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {inst.type === "school" ? (
                          <School className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        ) : (
                          <Building2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{inst.name}</p>
                          <p className="text-xs text-muted-foreground">{inst.city}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GeoLocation;
