import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  PhoneCall, 
  AlertOctagon, 
  RefreshCw, 
  XCircle, 
  Users, 
  Navigation, 
  MapPin, 
  Mail, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  MessageSquare 
} from "lucide-react";
import { EmergencyContact, HospitalResult } from "../types";

export default function EmergencySOS() {
  const [countdown, setCountdown] = useState(-1);
  const [sosState, setSosState] = useState<"idle" | "countdown" | "activated" | "cancelled">("idle");
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitalsFoundText, setHospitalsFoundText] = useState("");

  // Contact form state
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: ""
  });
  const [formError, setFormError] = useState("");

  // Dispatch live report feedback
  const [dispatchStatus, setDispatchStatus] = useState<{
    loading: boolean;
    success: boolean;
    dispatchLogs: any[];
    simulatedLogs: any[];
    isSimulated: boolean;
    messageContent?: string;
  } | null>(null);

  useEffect(() => {
    // Load emergency contacts from localstorage
    const saved = localStorage.getItem("pulsepoint_contacts");
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      const defaults: EmergencyContact[] = [
        { id: "1", name: "Sarah Jenkins", phone: "+91 9876543210", email: "family-relative@example.com", relationship: "Spouse" },
        { id: "2", name: "Dr. Alok Sen (Physician)", phone: "+91 8888877777", email: "sen.healthcard@example.com", relationship: "Doctor" },
      ];
      setContacts(defaults);
      localStorage.setItem("pulsepoint_contacts", JSON.stringify(defaults));
    }
  }, []);

  // Countdown timer trigger
  useEffect(() => {
    let timer: any;
    if (sosState === "countdown" && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((p) => p - 1);
      }, 1000);
    } else if (sosState === "countdown" && countdown === 0) {
      triggerSOSActivation();
    }
    return () => clearTimeout(timer);
  }, [sosState, countdown]);

  const initiateSOS = () => {
    setSosState("countdown");
    setCountdown(5); // 5 seconds safety gap to cancel accidental taps
  };

  const cancelSOS = () => {
    setSosState("cancelled");
    setCountdown(-1);
    setDispatchStatus(null);
    setTimeout(() => setSosState("idle"), 2000); // return to idle
  };

  const triggerSOSActivation = () => {
    setSosState("activated");
    setDispatchStatus({ loading: true, success: false, dispatchLogs: [], simulatedLogs: [], isSimulated: false });

    // Capture location coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          fetchNearbyHospitals(lat, lng);
          sendSOSAlertsToBackend(lat, lng);
        },
        (err) => {
          console.warn("GPS check blocked, proceeding with fallback location:", err);
          const lat = 28.6139; // default New Delhi
          const lng = 77.2090;
          setLocation({ lat, lng });
          fetchNearbyHospitals(lat, lng);
          sendSOSAlertsToBackend(lat, lng);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      const lat = 28.6139;
      const lng = 77.2090;
      setLocation({ lat, lng });
      fetchNearbyHospitals(lat, lng);
      sendSOSAlertsToBackend(lat, lng);
    }
  };

  const sendSOSAlertsToBackend = async (lat: number, lng: number) => {
    try {
      const res = await fetch("/api/send-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: contacts,
          location: { lat, lng },
          symptoms: "Critical heart rate fluctuation combined with somatic distress flags."
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchStatus({
          loading: false,
          success: true,
          dispatchLogs: data.dispatchLogs || [],
          simulatedLogs: data.simulatedLogs || [],
          isSimulated: data.isSimulated,
          messageContent: data.messageContent
        });
      } else {
        throw new Error(data.error || "Alert endpoint failed");
      }
    } catch (e: any) {
      console.error(e);
      setDispatchStatus({
        loading: false,
        success: false,
        dispatchLogs: [],
        simulatedLogs: [{ channel: "System Event log", error: e.message || "Failed to hit backend dispatcher" }],
        isSimulated: true
      });
    }
  };

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    setLoadingHospitals(true);
    try {
      const res = await fetch("/api/locate-hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      const data = await res.json();
      
      setHospitalsFoundText(data.reply);

      // Parse groundingChunks to map out the markers
      if (data.groundingChunks && Array.isArray(data.groundingChunks)) {
        const parsed: HospitalResult[] = data.groundingChunks.map((chunk: any) => {
          return {
            title: chunk.maps?.title || "Medical Center",
            uri: chunk.maps?.uri || "https://maps.google.com",
            address: chunk.maps?.address,
            latitude: chunk.maps?.latLng?.latitude,
            longitude: chunk.maps?.latLng?.longitude,
          };
        });
        setHospitals(parsed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHospitals(false);
    }
  };

  // Add Contact helper
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newContact.name.trim() || !newContact.relationship.trim() || !newContact.phone.trim()) {
      setFormError("Name, Relationship/Role, and Phone Number are required.");
      return;
    }

    const updated = [
      ...contacts,
      {
        id: Date.now().toString(),
        name: newContact.name,
        relationship: newContact.relationship,
        phone: newContact.phone,
        email: newContact.email || undefined
      }
    ];

    setContacts(updated);
    localStorage.setItem("pulsepoint_contacts", JSON.stringify(updated));
    setNewContact({ name: "", relationship: "", phone: "", email: "" });
  };

  // Delete Contact helper
  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem("pulsepoint_contacts", JSON.stringify(updated));
  };

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-4 md:px-6 py-6" id="sos-system">
      <div className="border-b border-white/5 pb-4 mb-6">
        <h1 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight flex items-center gap-2 justify-start">
          <ShieldAlert className="h-6 w-6 text-rose-500 animate-pulse" />
          PulsePoint SOS Emergency Response Command Center
        </h1>
        <p className="text-xs md:text-sm text-foreground/50 mt-1 text-left">
          Trigger active multi-channel alerts to pre-configured family contacts via Twilio SMS, WhatsApp, and Resend Email. Includes live hospital grounding locator.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left column: Quick SOS triggers and live feedback alerts */}
        <div className="lg:col-span-6 flex flex-col justify-start border border-white/5 bg-gray-950/25 backdrop-blur-xl rounded-2xl p-6 shadow-2xl relative min-h-[380px]">
          {sosState === "idle" && (
            <div className="text-center flex flex-col items-center my-auto">
              <p className="text-xs text-foreground/60 mb-6 max-w-md uppercase tracking-wide">
                ⚠️ Click the button to initiate a 5-second safety count. Dispatches actual messages to contacts immediately.
              </p>
              
              <button
                onClick={initiateSOS}
                className="h-44 w-44 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-500 text-white flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(244,63,94,0.3)] focus:outline-none"
              >
                <AlertOctagon className="h-14 w-14 text-white animate-pulse" />
                <span className="font-display font-black text-xl tracking-wider mt-2">
                  TRIGGER SOS
                </span>
              </button>
              
              <span className="text-[10px] text-rose-400 font-mono font-bold mt-8 tracking-widest uppercase bg-rose-950/20 border border-rose-900/30 px-3 py-1 rounded-full">
                🔴 CLINICAL SECURITY COOP ACTIVE
              </span>
            </div>
          )}

          {sosState === "countdown" && (
            <div className="text-center flex flex-col items-center my-auto">
              <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-widest animate-pulse">
                ⚠️ CONFIRMATION INTERCEPT ACTIVE
              </span>
              <div className="text-8xl font-black font-display text-white my-6 animate-pulse">
                {countdown}
              </div>
              <p className="text-xs text-foreground/40 max-w-xs mb-6">
                Broadcasting medical distress coordinates in {countdown}s. Hit "Abort Emergency Alarm" below if this is accidental.
              </p>
              <button
                onClick={cancelSOS}
                className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 rounded-full transition-all cursor-pointer font-semibold text-white"
              >
                <XCircle className="h-4 w-4 text-rose-500" />
                Abort Emergency Alarm
              </button>
            </div>
          )}

          {sosState === "cancelled" && (
            <div className="text-center flex flex-col items-center my-auto">
              <XCircle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-white">SOS Dispatch Cancelled</h3>
              <p className="text-xs text-foreground/40 mt-1">
                Message relays intercepted. System safety loop restored.
              </p>
            </div>
          )}

          {sosState === "activated" && (
            <div className="w-full flex-col flex gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-rose-700/20 flex items-center justify-center border border-rose-500 text-rose-400 shrink-0">
                  <ShieldAlert className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-400">SOS CHANNELS ENGAGED</h3>
                  <p className="text-[10px] text-zinc-400">Coordinates and vital signals dispatched.</p>
                </div>
              </div>

              {/* Real-time coordinates */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                <span className="text-[#a1a09e]">🛰️ GPS Location Stream:</span>
                <span className="font-mono font-extrabold text-[#f2f1ef]">
                  {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "RESOLVING POSITION..."}
                </span>
              </div>

              {/* Dispatch feedback log block */}
              <div className="flex-1 flex flex-col min-h-[180px] bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-3 overflow-hidden">
                <h4 className="text-[11px] font-mono font-bold text-violet-300 uppercase tracking-widest flex items-center justify-between border-b border-white/5 pb-1.5">
                  📁 Alerts Delivery Log
                  <span className="text-[10px] bg-violet-950/50 text-violet-300 border border-violet-800/40 px-2 py-0.5 rounded uppercase">
                    {dispatchStatus?.isSimulated ? "Simulated Sandboxed Feed" : "Live API Webhook Feed"}
                  </span>
                </h4>

                {dispatchStatus?.loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <RefreshCw className="h-5 w-5 text-violet-400 animate-spin mb-2" />
                    <span className="text-[11px] text-zinc-400 animate-pulse">Contacting cellular SMS & SMTP email towers...</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                    {/* Live actual dispatches */}
                    {dispatchStatus?.dispatchLogs && dispatchStatus.dispatchLogs.map((log, idx) => (
                      <div key={idx} className="bg-slate-900/40 p-2 border border-white/5 rounded-lg text-[11px] flex items-start justify-between">
                        <div>
                          <p className="text-white font-bold">{log.channel} Alert to {log.targetName}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">{log.destination}</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                          log.status === 'sent' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/55' : 'bg-rose-950/40 text-rose-400 border border-rose-900/55'
                        }`}>
                          {log.status?.toUpperCase() || "ERROR"}
                        </span>
                      </div>
                    ))}

                    {/* Simulated debug logs to show raw body template */}
                    {dispatchStatus?.simulatedLogs && dispatchStatus.simulatedLogs.map((log, idx) => (
                      <div key={idx} className="bg-zinc-950 p-2.5 border border-zinc-900 rounded-lg text-[11px] space-y-1 text-left">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-300 flex items-center gap-1">
                            ⚠️ {log.channel} Gateway
                          </span>
                          <span className="text-[8px] text-zinc-400 italic">Pre-Config Sandbox</span>
                        </div>
                        <p className="text-xs text-white">To: <span className="font-mono text-zinc-300 font-bold">{log.targetName}</span> ({log.destination})</p>
                        <div className="bg-black/40 p-1.5 rounded text-[10px] text-zinc-400 font-mono max-h-[60px] overflow-y-auto select-all leading-normal whitespace-pre-wrap">
                          {log.messageBody}
                        </div>
                        <p className="text-[9px] text-[#2ebd85] font-semibold bg-emerald-950/10 py-0.5 px-1.5 rounded inline-block">
                          ✓ Delivery Template Processed Successfully
                        </p>
                      </div>
                    ))}

                    {(!dispatchStatus?.dispatchLogs?.length && !dispatchStatus?.simulatedLogs?.length) && (
                      <p className="text-[11px] text-zinc-500 py-6 text-center">No alert channels selected. Configure and assign active phone numbers or emails below on the side panel.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSosState("idle")}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-rose-300 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-900/40 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset Emergency Suite
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Configurable Emergency Contacts Setup & Live Hospital Locator */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Contacts Management Panel */}
          <div className="border border-white/5 bg-gray-950/10 rounded-2xl p-4 shadow-lg text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-400" />
                Active Contact Circles
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">{contacts.length} Contacts Saved</span>
            </div>

            {/* List of Contacts */}
            <div className="space-y-2 mb-4 max-h-[190px] overflow-y-auto scrollbar-thin">
              {contacts.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl p-4 text-center text-xs text-foreground/40">
                  No emergency contacts configured yet. Please register at least one recipient below.
                </div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-white/[0.01] border border-white/5 rounded-xl text-xs hover:border-violet-500/20 transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-white truncate text-xs">{c.name}</p>
                        <span className="text-[9px] bg-violet-950/30 text-violet-300 border border-violet-900/45 px-1.5 py-0.2 rounded font-semibold font-sans">
                          {c.relationship}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-foreground/40 mt-1 flex-wrap font-mono">
                        {c.phone && <span className="flex items-center gap-0.5"><PhoneCall className="h-2.5 w-2.5" /> {c.phone}</span>}
                        {c.email && <span className="flex items-center gap-0.5"><Mail className="h-2.5 w-2.5" /> {c.email}</span>}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="h-7 w-7 text-zinc-500 hover:text-rose-400 bg-white/[0.02] hover:bg-rose-500/10 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/5"
                      title="Remove contact"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Expandable Quick Add Form */}
            <form onSubmit={handleAddContact} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-xs">
              <h4 className="text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Plus className="h-3.5 w-3.5 text-emerald-400" /> Add New Recipient
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Papa"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full bg-[#0b0821]/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Relation / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Parent, Spouse"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className="w-full bg-[#0b0821]/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Phone (SMS / WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+15550001111"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full bg-[#0b0821]/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 text-[11px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="relative@gmail.com"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full bg-[#0b0821]/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 text-[11px] font-mono"
                  />
                </div>
              </div>

              {formError && <p className="text-[10px] text-rose-400 font-bold font-mono">{formError}</p>}

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 py-1.5 rounded-lg text-white font-bold transition-all hover:shadow-lg hover:shadow-violet-600/15 cursor-pointer text-[11px]"
              >
                Add Member to SOS Emergency Circle
              </button>
            </form>
          </div>

          {/* Real-time Hospitals Found under search grounding */}
          <div className="border border-white/5 bg-gray-950/10 rounded-2xl p-4 flex-1 shadow-lg flex flex-col text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-rose-400" />
              Nearest Google Maps Grounded Hospitals
            </h3>

            {sosState !== "activated" ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/10 border border-dashed border-white/5 rounded-xl text-center min-h-[100px]">
                <MapPin className="h-6 w-6 text-foreground/20 mb-1.5" />
                <p className="text-[11px] text-foreground/45 max-w-sm">
                  Grounding lists are inactive. Activate the general SOS button above to pull live satellites mapping nearest clinical care coordinates automatically.
                </p>
              </div>
            ) : loadingHospitals ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-2 min-h-[100px]">
                <RefreshCw className="h-6 w-6 text-rose-500 animate-spin" />
                <p className="text-[11px] text-foreground/40 animate-pulse font-mono">
                  Querying closest hospital grids via Google Maps Live Grounding...
                </p>
              </div>
            ) : hospitals.length > 0 ? (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {hospitals.map((h, i) => (
                  <a
                    key={i}
                    href={h.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between p-2.5 bg-white/[0.01] border border-white/5 rounded-xl text-xs hover:bg-white/[0.03] hover:border-violet-500/30 transition-all cursor-pointer block text-left"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-bold text-white text-[12px] truncate hover:text-violet-400 transition-colors">
                        📍 {h.title}
                      </p>
                      {h.address && <p className="text-foreground/40 mt-0.5 font-mono text-[10px] truncate">{h.address}</p>}
                      <span className="text-[9px] text-amber-300 mt-1 inline-block font-mono bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30">
                        ⭐ Maps Grounding Active
                      </span>
                    </div>
                    <div className="shrink-0 bg-violet-600/20 border border-violet-500/30 h-7 w-7 rounded-lg flex items-center justify-center text-violet-300 hover:bg-violet-600 hover:text-white transition-colors">
                      🚀
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center min-h-[100px]">
                <p className="text-[11px] text-foreground/40">
                  No active coordinates returned yet or offline simulator was activated.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
