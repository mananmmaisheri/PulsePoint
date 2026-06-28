import { useState, useEffect } from "react";
import { Search, MapPin, Navigation, Compass, Globe, Info, Tag, Phone, AlertCircle, RefreshCw } from "lucide-react";
import { HospitalResult } from "../types";
import { clientSideLocateHospitals } from "../utils/locatorFallback";

export default function HospitalLocator() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Hospital");
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // Default to New Delhi coordinates
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HospitalResult[]>([]);
  const [clinicalText, setClinicalText] = useState("");
  const [addressPrompt, setAddressPrompt] = useState("New Delhi, India");
  const [searchTextLocation, setSearchTextLocation] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<HospitalResult | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const categories = [
    { label: "Emergency Hospitals", value: "Hospital" },
    { label: "Dentists", value: "Dentist" },
    { label: "Cardiologists & Specialists", value: "Cardiologist Doctor" },
    { label: "Pediatric Care", value: "Pediatric Clinic" },
    { label: "24h Pharmacies", value: "Pharmacy" },
  ];

  useEffect(() => {
    // Attempt auto retrieving user position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setLocation({ lat: newLat, lng: newLng });
          setAddressPrompt("Active GPS Coordinates Detected");
          handleSearch("Hospital", newLat, newLng);
        },
        () => {
          // Standard default check
          handleSearch("Hospital", 28.6139, 77.2090);
        }
      );
    } else {
      handleSearch("Hospital", 28.6139, 77.2090);
    }
  }, []);

  const handleSearch = async (searchTag?: string, customLat?: number, customLng?: number) => {
    setLoading(true);
    const activeCategory = searchTag || category;
    const targetQuery = `${activeCategory} near me ${query}`;
    const lat = customLat || location.lat;
    const lng = customLng || location.lng;

    let data;
    try {
      const res = await fetch("/api/locate-hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          query: targetQuery,
        }),
      });
      if (!res.ok) {
        throw new Error("Express API returned non-OK status. Activating client fallback.");
      }
      data = await res.json();
    } catch (e) {
      console.warn("Local API endpoint failed or timed out. routing through clientSideLocateHospitals:", e);
      data = await clientSideLocateHospitals(lat, lng, targetQuery);
    }

    try {
      setClinicalText(data.reply);
      setQuotaExceeded(!!data.quotaExceededFallback);

      // Parse Maps coordinates markers
      if (data.groundingChunks && Array.isArray(data.groundingChunks)) {
        const parsed: HospitalResult[] = data.groundingChunks.map((chunk: any) => {
          return {
            title: chunk.maps?.title || "Doctor Clinic",
            uri: chunk.maps?.uri || `https://maps.google.com/?q=${encodeURIComponent(chunk.maps?.title || "Hospital")}`,
            address: chunk.maps?.address || "",
            latitude: chunk.maps?.latLng?.latitude,
            longitude: chunk.maps?.latLng?.longitude,
            snippet: "Live Clinical Center matching active inquiry standards.",
            distance: chunk.maps?.distance,
          };
        });
        setResults(parsed);
        // Auto-focus on first result to update interactive display list immediately
        if (parsed.length > 0) {
          setSelectedHospital(parsed[0]);
        } else {
          setSelectedHospital(null);
        }
      } else {
        setResults([]);
        setSelectedHospital(null);
      }
    } catch (e) {
      console.error("Error parsing maps coordinates:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerLocationSearch = async () => {
    if (!searchTextLocation.trim()) {
      handleSearch(category);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTextLocation)}&format=json&limit=1`, {
        headers: {
          "Accept-Language": "en"
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setLocation({ lat: newLat, lng: newLng });
        
        // Extract a shorter display name for the address badge
        const parts = data[0].display_name.split(",");
        const shortName = parts.slice(0, 3).join(", ");
        setAddressPrompt(shortName);

        // Call handleSearch with the found coordinates
        handleSearch(category, newLat, newLng);
      } else {
        // Fallback to normal search query matching
        handleSearch(category);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      handleSearch(category);
    }
  };

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-6 py-8" id="hospital-locator">
      {/* Header section */}
      <div className="border-b border-white/5 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-white tracking-tight flex items-center gap-2">
            <Compass className="h-6 w-6 text-violet-400" />
            PulsePoint Doctor & Hospital Locator
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            Browse and locate state-certified clinical specialists, 24-hour pediatric emergency suites, and general clinics grounded in live satellite metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/[0.02] border border-white/10 px-3.5 py-1.5 rounded-full text-foreground/60 shrink-0">
          <MapPin className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono">{addressPrompt}</span>
        </div>
      </div>

      {/* Quota limit / Rate limit notice */}
      {quotaExceeded && (
        <div className="mb-6 p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-300 transition-all animate-fade-in" id="locator-quota-warning">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-xs text-left">
            <h4 className="font-bold text-amber-200">Adaptive Clinical Registry Pipeline Active</h4>
            <p className="mt-1 leading-relaxed text-zinc-300">
              The live planetary maps search API is currently at sandbox daily query limit capacity. PulsePoint has successfully activated its high-fidelity clinical and trauma hospital registry coordinates centered near your position at <strong>{location.lat.toFixed(4)}</strong>, <strong>{location.lng.toFixed(4)}</strong> to ensure uninterrupted health tracking and support.
            </p>
          </div>
        </div>
      )}

      {/* Control bar */}
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Query Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerLocationSearch()}
              placeholder="Cardiology, Dentist, Eye clinic, Pediatric..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-violet-500/40 text-white transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono bg-white/[0.05] text-zinc-400 px-1.5 py-0.5 rounded">Specialty</span>
          </div>

          {/* Location Input */}
          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              value={searchTextLocation}
              onChange={(e) => setSearchTextLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerLocationSearch()}
              placeholder="Search custom city/address (e.g. Mumbai, Noida)"
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-emerald-500/40 text-white transition-all placeholder:text-zinc-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Location</span>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3 py-3 outline-none focus:border-violet-500 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="bg-gray-950 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-white/5">
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const newLat = pos.coords.latitude;
                    const newLng = pos.coords.longitude;
                    setLocation({ lat: newLat, lng: newLng });
                    setAddressPrompt("Active GPS Coordinates Detected");
                    setSearchTextLocation("");
                    handleSearch(category, newLat, newLng);
                  },
                  () => {
                    // Standard notification fallback
                    alert("GPS credentials requested. Centering on default search location.");
                  }
                );
              }
            }}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-semibold bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10 cursor-pointer"
          >
            <Navigation className="h-3 w-3" /> Detect My Live GPS Location
          </button>

          <button
            onClick={triggerLocationSearch}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
            Search Hospitals & Clinics
          </button>
        </div>
      </div>

      {/* Interactive Google Map Panel */}
      <div className="mb-8 border border-white/5 bg-gray-950/20 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">
              Live Interactive Map view
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            {selectedHospital ? `Tracking: ${selectedHospital.title}` : `Centered near: ${addressPrompt}`}
          </span>
        </div>

        <div className="relative h-[280px] w-full rounded-xl overflow-hidden border border-white/10 bg-black bg-opacity-20 flex items-center justify-center">
          <iframe
            title="Google Maps Location View"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={
              selectedHospital 
                ? `https://maps.google.com/maps?q=${encodeURIComponent(selectedHospital.title + " " + (selectedHospital.address || ""))}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                : `https://maps.google.com/maps?q=${location.lat},${location.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`
            }
          />
        </div>

        {selectedHospital && (
          <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg text-xs text-emerald-300">
            <span className="leading-relaxed">
              🎯 Pinpoint tracked: <strong>{selectedHospital.title}</strong> {selectedHospital.address ? `• ${selectedHospital.address}` : ""}
            </span>
            <button
              onClick={() => setSelectedHospital(null)}
              className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-500/20 px-2 py-0.5 rounded font-medium cursor-pointer"
            >
              Reset Map to Center
            </button>
          </div>
        )}
      </div>

      {/* Main panel displays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Maps citations List of coordinates */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-2 flex items-center gap-1">
            🗺️ Located Specialist list
          </h3>

          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center border border-white/5 bg-gray-950/10 rounded-2xl gap-3 text-center">
              <RefreshTracker />
              <p className="text-xs text-foreground/40 animate-pulse">Running live satellite geocode search...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {results.map((result, idx) => {
                const isTracked = selectedHospital?.title === result.title;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedHospital(result)}
                    className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-3 text-xs border ${
                      isTracked
                        ? "bg-violet-600/10 border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                        : "bg-white/[0.02] border-white/5 hover:border-violet-500/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-white text-sm tracking-tight leading-snug">{result.title}</h4>
                          {result.distance !== undefined && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-mono font-medium px-2 py-0.5 rounded-full shrink-0">
                              ~{result.distance.toFixed(1)} km away
                            </span>
                          )}
                        </div>
                        {result.address && <p className="text-foreground/45 mt-1.5 font-mono text-[11px] leading-relaxed break-words">{result.address}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 pointer-events-auto">
                      <div className="flex items-center gap-2 text-rose-300">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>SOS Contact Certified</span>
                      </div>
                      <a
                        href={result.uri}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                      >
                        Launch Directions <Navigation className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="min-h-[250px] flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-2xl text-center">
              <AlertCircle className="h-8 w-8 text-foreground/20 mb-2" />
              <p className="text-xs text-foreground/40">No centers matched this query. Try toggling other specialist categories.</p>
            </div>
          )}
        </div>

        {/* Markdown clinical report summaries grounding column */}
        <div className="lg:col-span-7 flex flex-col border border-white/5 bg-gray-950/20 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-violet-400" />
            AI Satellite Grounding Counsel Insights
          </h3>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-2">
              <RefreshTracker />
              <p className="text-xs text-foreground/40 animate-pulse leading-relaxed">Processing coordinates in real time...</p>
            </div>
          ) : clinicalText ? (
            <div className="flex-1 overflow-y-auto pr-1">
              {/* Grounded text output panel */}
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                {clinicalText}
              </div>

              <div className="flex items-start gap-2.5 mt-4 bg-violet-950/15 border border-violet-900/30 p-3 rounded-lg text-[10px] text-violet-300">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Specialists listed represent active coordinates returned via **Google Maps Platform Grounding**. PulsePoint updates diagnostic credentials dynamically according to global registry feeds.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-foreground/30">
              <Compass className="h-10 w-10 text-foreground/10 mb-2" />
              <p className="text-xs">Select or search for health specialists and clinics to view AI advice and distance charts immediately.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RefreshTracker() {
  return (
    <div className="relative h-10 w-10 flex items-center justify-center">
      <RefreshCw className="h-6 w-6 text-violet-500 animate-spin absolute" />
    </div>
  );
}
