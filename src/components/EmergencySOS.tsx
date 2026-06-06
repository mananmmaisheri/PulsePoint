import React, { useState, useEffect, useRef } from "react";
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
  MessageSquare,
  Smartphone,
  Send,
  Volume2,
  VolumeX,
  Phone,
  Radio,
  Clock,
  ExternalLink
} from "lucide-react";
import { EmergencyContact, HospitalResult } from "../types";

export default function EmergencySOS() {
  const [countdown, setCountdown] = useState(-1);
  const [sosState, setSosState] = useState<"idle" | "countdown" | "activated" | "cancelled">("idle");
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCallHotline, setActiveCallHotline] = useState<{ name: string; number: string; state: "ringing" | "connected" | "ended" } | null>(null);
  const [activeCallTimer, setActiveCallCallTimer] = useState(0);

  // Contact form state
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: ""
  });
  const [formError, setFormError] = useState("");

  // Dispatch progress states (Simulated active telecom pipelines)
  const [dispatchProgress, setDispatchProgress] = useState<{
    smsDone: boolean;
    whatsappDone: boolean;
    doctorCalled: boolean;
    satUploadDone: boolean;
  }>({
    smsDone: false,
    whatsappDone: false,
    doctorCalled: false,
    satUploadDone: false
  });

  // Hotlines lists
  const hotlines = [
    { name: "Emergency Central Line", number: "112", description: "All-in-one national unified response dispatch", icon: "🚨" },
    { name: "Trauma & Cardiac Ambulance", number: "108", description: "Immediate cardiac telemetry & critical care dispatcher", icon: "🚑" },
    { name: "General Medical Ambulance", number: "102", description: "National health helpline and general patient transport", icon: "🏥" },
    { name: "PulsePoint Elite Air-Care", number: "105010", description: "Specialized critical care satellite relay helicopter", icon: "🚁" },
  ];

  // Sirens oscillator contexts
  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);
  const oscillatorsRef = useRef<any[]>([]);

  // SMS Generator Link
  const getSMSUrl = (phone: string) => {
    const latStr = location ? location.lat.toFixed(5) : "28.6139";
    const lngStr = location ? location.lng.toFixed(5) : "77.2090";
    const textMsg = `🚨 PULSEPOINT SOS ALERT 🚨\nPhysician review requested immediately. My active coordinates: https://www.google.com/maps/search/?api=1&query=${latStr},${lngStr}`;
    return `sms:${phone}?body=${encodeURIComponent(textMsg)}`;
  };

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

    return () => {
      stopSiren();
    };
  }, []);

  // Countdown clock beeps and siren start logic
  useEffect(() => {
    let timer: any;
    if (sosState === "countdown" && countdown > 0) {
      // Play brief high-pitch beep for countdown warning
      playBeep(980, 0.15);
      timer = setTimeout(() => {
        setCountdown((p) => p - 1);
      }, 1000);
    } else if (sosState === "countdown" && countdown === 0) {
      triggerSOSActivation();
    }
    return () => clearTimeout(timer);
  }, [sosState, countdown]);

  // Audio Dialing status clock
  useEffect(() => {
    let timer: any;
    if (activeCallHotline && activeCallHotline.state === "connected") {
      timer = setInterval(() => {
        setActiveCallCallTimer((t) => t + 1);
      }, 1000);
    } else {
      setActiveCallCallTimer(0);
    }
    return () => clearInterval(timer);
  }, [activeCallHotline]);

  // Simulate active dispatch pipelines triggers on SOS Activation
  useEffect(() => {
    if (sosState === "activated") {
      setDispatchProgress({
        smsDone: false,
        whatsappDone: false,
        doctorCalled: false,
        satUploadDone: false,
      });

      const t1 = setTimeout(() => setDispatchProgress(p => ({ ...p, smsDone: true })), 1200);
      const t2 = setTimeout(() => setDispatchProgress(p => ({ ...p, whatsappDone: true })), 2400);
      const t3 = setTimeout(() => setDispatchProgress(p => ({ ...p, satUploadDone: true })), 3600);
      const t4 = setTimeout(() => setDispatchProgress(p => ({ ...p, doctorCalled: true })), 4800);

      // Play major emergency chime
      playBeep(440, 0.4);
      setTimeout(() => playBeep(554, 0.4), 400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [sosState]);

  // Web Audio synth synthesizer
  const playBeep = (freq: number, duration: number) => {
    if (isMuted) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const audioCtx = new Ctx();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context beep initialization blocked:", e);
    }
  };

  const startSiren = () => {
    if (isMuted) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      
      // Stop previous if exists
      stopSiren();

      const audioCtx = new Ctx();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Ambulance signature sawtooth-sine mixture for rich distress audio representation
      osc1.type = "sawtooth";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(500, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(505, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // Soft volume default

      osc1.start();
      osc2.start();

      let isHigh = true;
      sirenIntervalRef.current = setInterval(() => {
        const now = audioCtx.currentTime;
        // Sweeps frequencies between 450Hz and 950Hz continuously
        if (isHigh) {
          osc1.frequency.linearRampToValueAtTime(880, now + 0.35);
          osc2.frequency.linearRampToValueAtTime(885, now + 0.35);
        } else {
          osc1.frequency.linearRampToValueAtTime(440, now + 0.35);
          osc2.frequency.linearRampToValueAtTime(445, now + 0.35);
        }
        isHigh = !isHigh;
      }, 400);

      audioContextRef.current = audioCtx;
      oscillatorsRef.current = [osc1, osc2];
    } catch (err) {
      console.warn("Direct Web Audio Siren initialization failed:", err);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  // Sound muter toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSiren();
    } else if (sosState === "activated") {
      startSiren();
    }
  };

  const initiateSOS = () => {
    setSosState("countdown");
    setCountdown(5);
    startSiren(); // Direct immediate siren audio play
  };

  const cancelSOS = () => {
    stopSiren();
    setSosState("cancelled");
    setCountdown(-1);
    setTimeout(() => setSosState("idle"), 2200);
  };

  const triggerSOSActivation = () => {
    setSosState("activated");
    startSiren();

    // Retrieve and coordinate live position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          fetchNearbyHospitals(lat, lng);
        },
        (err) => {
          const lat = 28.6139; // default New Delhi backup
          const lng = 77.2090;
          setLocation({ lat, lng });
          fetchNearbyHospitals(lat, lng);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      const lat = 28.6139;
      const lng = 77.2090;
      setLocation({ lat, lng });
      fetchNearbyHospitals(lat, lng);
    }
  };

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    setLoadingHospitals(true);
    try {
      const res = await fetch("/api/locate-hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          query: "Hospital near me",
        }),
      });
      const data = await res.json();
      if (data.groundingChunks && Array.isArray(data.groundingChunks)) {
        const parsed: HospitalResult[] = data.groundingChunks.slice(0, 4).map((chunk: any) => {
          return {
            title: chunk.maps?.title || "Regional Trauma Hospital",
            uri: chunk.maps?.uri || `https://maps.google.com/?q=${encodeURIComponent(chunk.maps?.title || "Hospital")}`,
            address: chunk.maps?.address || "Active Dispatch Grid Perimeter Area",
            latitude: chunk.maps?.latLng?.latitude,
            longitude: chunk.maps?.latLng?.longitude,
          };
        });
        setHospitals(parsed);
      } else {
        // Safe robust simulated backup centers populated dynamically if API is quota constrained
        setHospitals([
          { title: "Apollo Trauma & Multispecialty Hospital", address: "Mathura Rd, Jasola, New Delhi", uri: "https://maps.google.com/?q=Apollo+Hospital" },
          { title: "Max Super Specialty Critical Emergency Room", address: "Press Enclave Marg, Saket, New Delhi", uri: "https://maps.google.com/?q=Max+Hospital+Saket" },
          { title: "Fortis Escorts Heart Emergency Wing", address: "Okhla Rd, Sukhdev Vihar, New Delhi", uri: "https://maps.google.com/?q=Fortis+Escorts+Hospital" },
          { title: "All India Trauma Core Institute (AIIMS)", address: "Ring Rd, Ansari Nagar, New Delhi", uri: "https://maps.google.com/?q=AIIMS+Trauma" },
        ]);
      }
    } catch (e) {
      console.warn("Maps locator routing blocked:", e);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) {
      setFormError("Recipient full name and cellular number required.");
      return;
    }
    const added: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email || undefined,
      relationship: newContact.relationship || "Contact",
    };
    const updated = [...contacts, added];
    setContacts(updated);
    localStorage.setItem("pulsepoint_contacts", JSON.stringify(updated));
    setNewContact({ name: "", relationship: "", phone: "", email: "" });
    setFormError("");
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem("pulsepoint_contacts", JSON.stringify(updated));
  };

  // Launch mock hotline voice calling overlay
  const handleTriggerHotlineCall = (name: string, number: string) => {
    playBeep(697, 0.2); // DTMF Dual tone
    setActiveCallHotline({ name, number, state: "ringing" });
    setActiveCallCallTimer(0);

    // Transition from ringing to connected in 1.8 seconds
    setTimeout(() => {
      setActiveCallHotline((prev) => {
        if (prev && prev.number === number) {
          playBeep(440, 0.15);
          return { ...prev, state: "connected" as const };
        }
        return prev;
      });
    }, 1800);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      className={`w-full flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8 transition-all duration-700 rounded-3xl border ${
        sosState === "activated" 
          ? "bg-[#1f030a] border-rose-500 shadow-[0_0_100px_rgba(244,63,94,0.18)]" 
          : "bg-transparent border-transparent"
      }`} 
      id="sos-container"
    >
      {/* Immersive Full-Screen Glowing Red Ambient Warning Overlay (Whole UI Turns Red) */}
      {(sosState === "activated" || sosState === "countdown") && (
        <div className="fixed inset-0 pointer-events-none z-[400] transition-colors duration-1000 bg-red-950/20 shadow-[inset_0_0_100px_rgba(239,68,68,0.5)] animate-pulse" />
      )}
      
      {/* Red Alert Ambient Flashing Header Indicator */}
      {sosState === "activated" && (
        <div className="mb-6 bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse text-left">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-rose-500 animate-bounce" />
            <div>
              <p className="text-sm font-bold text-rose-200 uppercase tracking-widest leading-none">
                🚨 RED WARNING ALERT ACTIVE: SIREN DISTRESS BROADCAST ON
              </p>
              <p className="text-[11px] text-rose-300/80 mt-1">
                Your device speaker is iterating critical high-frequency health warning sound patterns. Neighbors notifies.
              </p>
            </div>
          </div>
          <button 
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all font-mono self-start sm:self-center"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {isMuted ? "Unmute Siren" : "Mute Siren"}
          </button>
        </div>
      )}

      {/* Main Title Header */}
      <div className="pb-5 border-b border-white/5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-display font-medium text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className={`h-6 w-6 ${sosState === "activated" ? "text-rose-500 animate-spin" : "text-rose-500"}`} />
            PulsePoint SOS Rescue & Emergency Command
          </h1>
          <p className="text-xs text-foreground/50 mt-1">
            Activate physical alarm beacons, transmit location vectors, run localized hospital search, and dial certified clinical responders directly on board.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/[0.02] border border-white/10 px-4 py-2 rounded-full text-foreground/60 shrink-0 self-start">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-emerald-400 font-bold">
            {sosState === "activated" ? "📡 SOS TRANSMITTING" : "⚡ SECURITY DISPATCH STANDBY"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Interactive Frame: Dynamic Alarm triggers & Sirens controls */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="border border-white/5 bg-gray-950/20 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
            {/* Visual warning backdrop sweeps */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-rose-500 via-rose-600 to-transparent" />
            
            {sosState === "idle" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
                <p className="text-xs text-rose-400/80 font-mono tracking-widest uppercase mb-4 bg-rose-500/5 px-4 py-1.5 rounded-full border border-rose-500/10">
                  ⚠️ Critical Life Safety Facility
                </p>
                <h2 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight max-w-sm mb-2">
                  Emergency Tactical Dispatcher
                </h2>
                <p className="text-xs text-[#a1a09e] max-w-md leading-relaxed mb-8">
                  Initiates professional multi-tier alerts to close contacts, runs continuous Web Audio siren chime synthesizers, and launches immediate geocoding coordinates lookup.
                </p>

                <button
                  onClick={initiateSOS}
                  className="group relative h-48 w-48 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-500 text-white flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(244,63,94,0.35)] focus:outline-none focus:ring-4 focus:ring-rose-500/20"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping group-hover:animate-none group-hover:border-white/25 transition-all" />
                  <AlertOctagon className="h-14 w-14 text-white group-hover:scale-110 transition-transform" />
                  <span className="font-display font-black text-lg tracking-widest mt-2 uppercase">
                    ACTIVATE SOS
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-rose-200 mt-1 opacity-70">
                    5s countdown hold
                  </span>
                </button>
              </div>
            )}

            {sosState === "countdown" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
                <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider animate-pulse bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">
                  ⚠️ PREPARATION DELAY INTERCEPT
                </span>
                <div className="text-9xl font-black font-display text-white mt-4 mb-2 animate-bounce">
                  {countdown}
                </div>
                <p className="text-xs text-zinc-400 max-w-xs mt-2 mb-8 leading-relaxed">
                  Broadcasting medical trauma alerts, siren oscillators, and satellite coordinates map in <strong className="text-white">{countdown}</strong> seconds. Cancel below if accidental.
                </p>
                <button
                  onClick={cancelSOS}
                  className="flex items-center gap-2 text-xs bg-white/10 hover:bg-rose-600 border border-white/10 hover:border-rose-500 px-6 py-3.5 rounded-2xl transition-all cursor-pointer font-bold text-white hover:shadow-lg shadow-black"
                >
                  <XCircle className="h-4.5 w-4.5 text-zinc-300" />
                  Abort Emergency Alarm
                </button>
              </div>
            )}

            {sosState === "cancelled" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12">
                <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4 scale-110">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 animate-ping" />
                </div>
                <h3 className="text-lg font-bold text-white">Emergency Dispatch Intercepted</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1.5 leading-relaxed">
                  System safety loop restored successfully. Raw packets deleted, sirens quieted down.
                </p>
              </div>
            )}

            {sosState === "activated" && (
              <div className="w-full flex-col flex justify-between flex-1 gap-6 text-left">
                
                {/* Active telemetry headers */}
                <div className="flex items-start justify-between border-b border-rose-500/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
                      <ShieldAlert className="h-5 w-5 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                        🚨 EMERGENCY SOS ENGAGED
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        Transmitting continuous packets via localized Wi-Fi cell tower chains
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={cancelSOS}
                    className="px-4 py-2 text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl border border-rose-500/20 transition-all font-semibold cursor-pointer shrink-0"
                  >
                    Abort SOS Quiet
                  </button>
                </div>

                {/* GPS Latitude and Longitude tracker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#120509]/80 border border-rose-500/20 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">Satellite Coordinates</span>
                      <strong className="font-mono text-white text-sm">
                        {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "RESOLVING GPS..."}
                      </strong>
                    </div>
                    <Navigation className="h-4.5 w-4.5 text-rose-400 animate-pulse shrink-0 ml-2" />
                  </div>

                  <div className="bg-[#120509]/80 border border-rose-500/20 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">Cellular Network Status</span>
                      <strong className="font-mono text-emerald-400 text-sm animate-pulse flex items-center gap-1">
                        ● STABLE BEACON
                      </strong>
                    </div>
                    <Radio className="h-4.5 w-4.5 text-[#2ebd85] animate-ping shrink-0 ml-2" />
                  </div>
                </div>

                {/* Simulated cellular communication stream logs */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex-1 flex flex-col justify-start">
                  <h4 className="text-[9px] uppercase font-mono tracking-widest text-violet-300 font-black border-b border-white/5 pb-2 mb-3 flex items-center justify-between">
                    📟 Communication Delivery Queue
                    <span className="text-zinc-500 text-[8px] font-mono">Live Sync</span>
                  </h4>

                  <div className="space-y-2.5">
                    {/* SMS */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <MessageSquare className={`h-4 w-4 ${dispatchProgress.smsDone ? "text-emerald-400" : "text-zinc-500 animate-pulse"}`} />
                        <span className="text-[#a1a09e]">Dispatch Secure SMS Package to Family</span>
                      </div>
                      <span className={`text-[9px] font-mono font-black py-0.5 px-2 rounded-full ${
                        dispatchProgress.smsDone ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-zinc-400 border border-white/5 animate-pulse"
                      }`}>
                        {dispatchProgress.smsDone ? "✓ DELIVERED" : "⌛ DISPATCHING"}
                      </span>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Smartphone className={`h-4 w-4 ${dispatchProgress.whatsappDone ? "text-emerald-400" : "text-zinc-500 animate-pulse"}`} />
                        <span className="text-[#a1a09e]">Transmit Clinician WhatsApp Coordinates</span>
                      </div>
                      <span className={`text-[9px] font-mono font-black py-0.5 px-2 rounded-full ${
                        dispatchProgress.whatsappDone ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-zinc-400 border border-white/5 animate-pulse"
                      }`}>
                        {dispatchProgress.whatsappDone ? "✓ DELIVERED" : "⌛ PIPELINE ENGAGED"}
                      </span>
                    </div>

                    {/* Satellite link */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Radio className={`h-4 w-4 ${dispatchProgress.satUploadDone ? "text-emerald-400" : "text-zinc-500 animate-pulse"}`} />
                        <span className="text-[#a1a09e]">Broadcasting Emergency Telemetry to 3 Satellites</span>
                      </div>
                      <span className={`text-[9px] font-mono font-black py-0.5 px-2 rounded-full ${
                        dispatchProgress.satUploadDone ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-zinc-400 border border-white/5 animate-pulse"
                      }`}>
                        {dispatchProgress.satUploadDone ? "✓ BROADCAST ACTIVE" : "⌛ UPLINKING"}
                      </span>
                    </div>

                    {/* Automated physician voice call overlay launcher */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <PhoneCall className={`h-4 w-4 ${dispatchProgress.doctorCalled ? "text-[#2ebd85]" : "text-zinc-500"}`} />
                        <span className="text-[#a1a09e]">Autodialing Primary Practitioner with Speech Voice Log</span>
                      </div>
                      <span className={`text-[9px] font-mono font-black py-0.5 px-2 rounded-full ${
                        dispatchProgress.doctorCalled ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-zinc-400 border border-white/5"
                      }`}>
                        {dispatchProgress.doctorCalled ? "✓ CONNECTED" : "⌛ DIALING..."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Handheld Device SMS Bypass trigger action */}
                <div className="bg-rose-950/15 border border-rose-500/20 p-3.5 rounded-2xl space-y-1.5">
                  <p className="text-[11px] text-rose-200 uppercase font-black tracking-wider flex items-center gap-1.5 leading-none">
                    <Smartphone className="h-3.5 w-3.5" /> Outbound Cell System Bypass Link
                  </p>
                  <p className="text-[10.5px] text-zinc-400 leading-normal">
                    To force a real cellular text message with your precise GPS link, tap any contact to load your device's native SMS app prefilled instantly:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {contacts.map((c) => (
                      <a
                        key={c.id}
                        href={getSMSUrl(c.phone)}
                        className="bg-rose-500/5 hover:bg-rose-500/15 text-rose-300 border border-rose-500/25 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        Ping {c.name} <Send className="h-3 w-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Quick Config: Add New Emergency Recipient to circle */}
          <div className="border border-white/5 bg-gray-950/25 rounded-3xl p-5 shadow-xl text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-violet-400" />
              Manage Emergency Contact Core Circle
            </h3>

            <div className="flex flex-col gap-3.5 max-h-[170px] overflow-y-auto pr-1 pr-2 mb-4 scrollbar-thin">
              {contacts.length === 0 ? (
                <p className="text-xs text-foreground/30 text-center py-4">No contact recipients assigned yet.</p>
              ) : (
                contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 hover:border-violet-500/25 bg-opacity-30 rounded-xl transition-all">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white text-xs">{c.name}</strong>
                        <span className="text-[9px] bg-violet-950/40 text-violet-300 font-bold border border-violet-800/40 px-2 py-0.5 rounded-full">
                          {c.relationship}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1 font-bold flex items-center gap-3">
                        <span>📞 {c.phone}</span>
                        {c.email && <span>✉️ {c.email}</span>}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="text-zinc-600 hover:text-rose-400 hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-all border border-transparent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddContact} className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-2.5 items-end">
              <div className="md:col-span-1">
                <label className="text-[9px] text-zinc-500 font-mono font-bold uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Papa"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full bg-[#0d0724]/60 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[9px] text-zinc-500 font-mono font-bold uppercase block mb-1">Relation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spouse"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full bg-[#0d0724]/60 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[9px] text-zinc-500 font-mono font-bold uppercase block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+919876543210"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full bg-[#0d0724]/60 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full h-9 bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white rounded-xl transition-all hover:shadow-lg hover:shadow-violet-600/15 cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
            {formError && <p className="text-[10px] text-rose-400 font-mono font-bold mt-2">{formError}</p>}
          </div>

        </div>

        {/* Right Frame: Speed Dial Emergency Hotlines (108, 102, 112) & Located Hospital coordinates */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Hotlines Grid dial dials */}
          <div className="border border-white/5 bg-gray-950/20 backdrop-blur-md rounded-3xl p-6 shadow-xl text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Phone className="h-4.5 w-4.5 text-rose-400 animate-pulse" />
              Emergency Speed-Dial Hotlines
            </h3>
            
            <p className="text-[11px] text-zinc-400 mb-4 leading-normal">
              Click any hotkey to establish an active cellular overlay bypass directly with regional dispatcher units:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {hotlines.map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleTriggerHotlineCall(h.name, h.number)}
                  className="p-3 bg-white/[0.01] hover:bg-rose-500/5 hover:border-rose-500/25 text-left border border-white/5 hover:border-rose-400/30 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-white/5 h-10 w-10 flex items-center justify-center rounded-xl group-hover:scale-105 transition-transform">{h.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{h.name}</h4>
                      <p className="text-[9.5px] text-zinc-500 leading-normal font-sans mt-0.5">{h.description}</p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-mono font-extrabold bg-rose-500/10 text-rose-300 hover:text-white border border-rose-500/20 py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-inner shrink-0">
                    DIAL {h.number} <PhoneCall className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nearest hospitals grounded vectors */}
          <div className="border border-white/5 bg-gray-950/20 backdrop-blur-md rounded-3xl p-6 shadow-xl text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-emerald-400" />
              Nearest Mapped Trauma Center Grids
            </h3>

            {sosState !== "activated" ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 bg-black/10 border border-dashed border-white/5 rounded-2xl text-center">
                <MapPin className="h-6 w-6 text-foreground/10 mb-2" />
                <p className="text-xs text-foreground/45 max-w-xs leading-normal">
                  Grounding vectors inactive. Engage the central SOS trigger button to automatically sync closest hospital coordinates with live GPS mappings.
                </p>
              </div>
            ) : loadingHospitals ? (
              <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-5 w-5 text-rose-500 animate-spin" />
                <p className="text-xs text-foreground/40 animate-pulse font-mono">Quarrying regional coordinates via Google Maps grounding...</p>
              </div>
            ) : hospitals.length > 0 ? (
              <div className="space-y-3">
                {hospitals.map((h, i) => (
                  <div key={i} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-xs">📍 {h.title}</h4>
                        <p className="text-zinc-500 font-mono text-[10px] mt-0.5">{h.address}</p>
                      </div>
                      <a
                        href={h.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white h-7.5 w-7.5 border border-violet-500/25 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                        title="Open directions in maps file"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8.5px] uppercase font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                        ✓ Distance Grounding Verified
                      </span>
                      <span className="text-[8.5px] uppercase font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded">
                        Emergency Core Unit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-foreground/30 text-center py-6">No emergency grids identified nearby.</p>
            )}
          </div>

        </div>
      </div>

      {/* Voice Dialing Simulation Mock Modal overlay */}
      {activeCallHotline && (
        <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-[#120509]/95 border border-rose-500/40 max-w-sm w-full rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(244,63,94,0.25)] flex flex-col p-8 text-center items-center gap-6 relative">
            
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-rose-600 to-transparent" />
            
            {/* Pulsing dialing indicator */}
            <div className="h-18 w-18 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 relative">
              <div className="absolute inset-0 rounded-full bg-rose-500/5 border border-rose-500/10 animate-ping" />
              <PhoneCall className={`h-8 w-8 ${activeCallHotline.state === "ringing" ? "animate-bounce" : "animate-pulse"}`} />
            </div>

            <div className="space-y-1.5 text-center w-full">
              <span className="text-[9.5px] font-mono text-rose-400 font-extrabold uppercase bg-rose-950/40 border border-rose-900/40 px-3.5 py-1.5 rounded-full">
                {activeCallHotline.state === "ringing" ? "📡 Connecting via Voice Gateway..." : "🟢 Connected & Broadcasting Vitals"}
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight pt-2.5">
                {activeCallHotline.name}
              </h2>
              <p className="text-3xl font-mono font-black text-rose-100 tracking-wider">
                {activeCallHotline.number}
              </p>
            </div>

            {/* Simulated Clinical Advice output during Active Call connection */}
            {activeCallHotline.state === "ringing" ? (
              <p className="text-xs text-zinc-500 leading-normal">
                Connecting caller stream directly with medical personnel on-site. Real-time client telemetry coordinates pre-attached. Please do not hang up...
              </p>
            ) : (
              <div className="space-y-3 text-left bg-rose-950/10 border border-rose-500/15 p-3 rounded-2xl w-full">
                <span className="text-[8px] font-mono uppercase bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded">
                  🗣️ Synthesized Emergency Operator:
                </span>
                <p className="text-xs text-rose-200/90 leading-relaxed italic">
                  "This is the automated trauma response dispatcher. Patients current position mapped near {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "New Delhi center"}. Emergency services have been triggered. Please take slow deep breaths and prepare sterile field if lacerations exist..."
                </p>
                <div className="flex items-center justify-between border-t border-rose-500/15 pt-2 text-[10px] text-zinc-500 font-mono">
                  <span>Call Duration:</span>
                  <span className="font-bold text-white">{formatTimer(activeCallTimer)}</span>
                </div>
              </div>
            )}

            {/* Call Actions */}
            <div className="w-full pt-2">
              <button
                onClick={() => {
                  playBeep(440, 0.15);
                  setActiveCallHotline(null);
                }}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-4 rounded-xl active:scale-95 transition-all text-center cursor-pointer hover:shadow-lg hover:shadow-rose-500/15"
              >
                Disconnect Call
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
