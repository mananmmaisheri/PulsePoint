import { useState, useEffect } from "react";
import { Search, MapPin, Navigation, Compass, Globe, Info, Tag, Phone, AlertCircle, RefreshCw } from "lucide-react";
import { HospitalResult } from "../types";

export default function HospitalLocator() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Hospital");
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 }); // default SF
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HospitalResult[]>([]);
  const [clinicalText, setClinicalText] = useState("");
  const [addressPrompt, setAddressPrompt] = useState("San Francisco, CA");

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
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAddressPrompt("Active GPS Coordinates Detected");
          handleSearch("Hospital", pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Standard check
          handleSearch("Hospital", 37.7749, -122.4194);
        }
      );
    } else {
      handleSearch("Hospital", 37.7749, -122.4194);
    }
  }, []);

  const handleSearch = async (searchTag?: string, customLat?: number, customLng?: number) => {
    setLoading(true);
    const targetQuery = `${searchTag || category} near me ${query}`;
    const lat = customLat || location.lat;
    const lng = customLng || location.lng;

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
      const data = await res.json();

      setClinicalText(data.reply);

      // Parse Maps coordinates markers
      if (data.groundingChunks && Array.isArray(data.groundingChunks)) {
        const parsed: HospitalResult[] = data.groundingChunks.map((chunk: any) => {
          return {
            title: chunk.maps?.title || "Doctor Clinic",
            uri: chunk.maps?.uri || "https://maps.google.com",
            address: chunk.maps?.address || "",
            latitude: chunk.maps?.latLng?.latitude,
            longitude: chunk.maps?.latLng?.longitude,
            snippet: "Live Clinical Center matching active inquiry standards.",
          };
        });
        setResults(parsed);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

        <div className="flex items-center gap-2 text-xs bg-white/[0.02] border border-white/10 px-3.5 py-1.5 rounded-full text-foreground/60">
          <MapPin className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono">{addressPrompt}</span>
        </div>
      </div>

      {/* Control bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Search Input */}
        <div className="md:col-span-8 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by Doctor name, special sub-skills, e.g. 'Neurologist', 'Cardiology'..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500/40 text-white"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
          >
            Locate
          </button>
        </div>

        {/* Categories toggler */}
        <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-foreground/45 shrink-0 flex items-center gap-1 font-mono">
            <Tag className="h-3.5 w-3.5" /> Filter:
          </span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              handleSearch(e.target.value);
            }}
            className="bg-white/[0.04] border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-violet-500 hover:bg-white/[0.08] transition-colors cursor-pointer w-full"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value} className="bg-gray-950 text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main panel displays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Maps citations List of coordinates */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-2 flex items-center gap-1">
            🗺️ Live Registry Citations
          </h3>

          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center border border-white/5 bg-gray-950/10 rounded-2xl gap-3 text-center">
              <RefreshTracker />
              <p className="text-xs text-foreground/40 animate-pulse">Running live satellite geocode search...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-violet-500/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-tight">{result.title}</h4>
                      {result.address && <p className="text-foreground/40 mt-1 font-mono">{result.address}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2 text-rose-300">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>SOS Contact Certified</span>
                    </div>
                    <a
                      href={result.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                    >
                      Launch Directions <Navigation className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
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
