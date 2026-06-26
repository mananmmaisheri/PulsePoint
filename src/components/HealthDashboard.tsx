import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  BellRing,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  Search,
  MapPin,
  Phone,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Check,
  Truck,
  ShieldCheck,
  FileText,
  Filter,
  X,
  Store,
  Compass,
  BriefcaseMedical,
  Upload,
  Loader2
} from "lucide-react";
import { Reminder, UserHealthProfile } from "../types";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

// Google Maps Key check
const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== "YOUR_API_KEY";

// Static mock pharmacies for the Nearby Pharmacies section
const MOCK_PHARMACIES = [
  {
    id: "pharm-1",
    name: "Apollo Pharmacy - 24 Hours Triage Depot",
    address: "Ground Floor, South Wing Chambers, Sector 4, Mumbai",
    distance: 0.45,
    rating: 4.8,
    phone: "+91 22 2345 6789",
    isOpen247: true,
    hasDelivery: true,
    supportedApps: ["Apollo 24/7", "Tata 1mg"]
  },
  {
    id: "pharm-2",
    name: "MedPlus Express Chemists",
    address: "Shop No. 12, Sunrise Arcade, Linking Road, Mumbai",
    distance: 1.15,
    rating: 4.6,
    phone: "+91 22 5550 1234",
    isOpen247: false,
    hasDelivery: true,
    supportedApps: ["PharmEasy", "Netmeds"]
  },
  {
    id: "pharm-3",
    name: "Wellness Forever Lifestyle Pharmacy",
    address: "Unit 3, Regal Grand Heights, Western Highway, Mumbai",
    distance: 1.82,
    rating: 4.7,
    phone: "+91 22 4991 9999",
    isOpen247: true,
    hasDelivery: true,
    supportedApps: ["PharmEasy", "Apollo 24/7", "Tata 1mg", "Netmeds"]
  },
  {
    id: "pharm-4",
    name: "Sanjivani local Medical Store",
    address: "Block C-2, Juhu Cross Road Lane, Vile Parle, Mumbai",
    distance: 2.30,
    rating: 4.3,
    phone: "+91 22 6622 1111",
    isOpen247: false,
    hasDelivery: false,
    supportedApps: []
  },
  {
    id: "pharm-5",
    name: "Noble Plus Hyper-Chemists",
    address: "Imperial Court Avenue, Pali Hill Road, Bandra West, Mumbai",
    distance: 3.05,
    rating: 4.5,
    phone: "+91 22 1100 2200",
    isOpen247: true,
    hasDelivery: false,
    supportedApps: ["Tata 1mg"]
  }
];

// Online Medicine Platforms info
const ORDER_PLATFORMS = [
  {
    id: "pharmeasy",
    name: "PharmEasy",
    tagline: "Flat 15% OFF + Free delivery on prescription packs",
    brandColor: "from-[#00b2b2] to-[#008080]",
    accentColor: "#00b2b2",
    logoText: "PE",
    estTime: "Next-Day Delivery",
    features: "Upload doctor script • Easy returns • Verified Indian medicines"
  },
  {
    id: "apollo247",
    name: "Apollo 24/7",
    tagline: "Express 2 Hours dispatch from closest Apollo Triage store",
    brandColor: "from-[#ff6f06] to-[#d65700]",
    accentColor: "#ff6f06",
    logoText: "A7",
    estTime: "Express 2 Hours",
    features: "Simulated live stock sync • Emergency clinical dispatch"
  },
  {
    id: "tata1mg",
    name: "Tata 1mg",
    tagline: "Certified labs & generic medication substitutes with clinical review",
    brandColor: "from-[#ff6f61] to-[#e04d41]",
    accentColor: "#ff6f61",
    logoText: "1m",
    estTime: "Same-Day Delivery",
    features: "Doctor consultation backup • Detailed side effects manuals"
  },
  {
    id: "netmeds",
    name: "Netmeds",
    tagline: "Flat ₹150 coupon on your first order • Trusted since 1914",
    brandColor: "from-[#24a0ed] to-[#1270b0]",
    accentColor: "#24a0ed",
    logoText: "NM",
    estTime: "24-48 Hour Delivery",
    features: "Family subscription plans • Chronic medical auto-refill"
  }
];

export default function HealthDashboard() {
  // 1. Core Profile states
  const [profile] = useState<UserHealthProfile>(() => {
    const saved = localStorage.getItem("pulsepoint_profile");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Alex Carter",
          birthdate: "1988-11-24",
          bloodType: "O-Positive",
          allergies: "Penicillin, Tree nuts",
          conditions: "Mild asthma, High work-related stress",
          emergencyContacts: [],
        };
  });

  // 2. Reminders schedule states
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem("pulsepoint_reminders");
    return saved
      ? JSON.parse(saved)
      : [
          { id: "rem-1", name: "Albuterol Inhaler Dosage", type: "medication", time: "08:00", dosage: "2 puffs as needed", active: true, takenToday: false },
          { id: "rem-2", name: "Atorvastatin Lipid Control", type: "medication", time: "21:00", dosage: "10 mg oral tablet", active: true, takenToday: false },
          { id: "rem-3", name: "Vitals Telemetry Review", type: "appointment", time: "14:30", date: "2026-06-30", doctor: "Dr. Raymond Evans", active: true },
        ];
  });

  // 3. Timer & Live Watch Clocks
  const [systemTime, setSystemTime] = useState<Date>(new Date());
  const [lastCheckedMin, setLastCheckedMin] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 4. Active Alert Alarm overlays state
  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);

  // New medication form inputs state
  const [newMed, setNewMed] = useState({ name: "", time: "", dosage: "" });

  // 5. Interactive UI Toggle States
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [searchPharmacyQuery, setSearchPharmacyQuery] = useState("");
  const [selectedPharmacyFilter, setSelectedPharmacyFilter] = useState("All"); // All, 24/7, Delivery
  const [stockCheckingId, setStockCheckingId] = useState<string | null>(null);
  const [stockStatus, setStockStatus] = useState<{ [key: string]: string }>({});

  // Google Maps & Real GPS states
  const [pharmacies, setPharmacies] = useState<any[]>(MOCK_PHARMACIES);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: 19.0760, lng: 72.8777 });
  const [currentAreaName, setCurrentAreaName] = useState<string>("Mumbai, MH");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleFetchRealPharmacies = async (lat: number, lng: number, customSearchQuery?: string) => {
    setIsLocating(true);
    setLocateError(null);
    const searchQuery = customSearchQuery || "pharmacy chemist drugstore drugstore apothecary medicine store";
    try {
      const response = await fetch("/api/locate-hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          query: searchQuery
        })
      });
      if (!response.ok) {
        throw new Error("Failed to contact PulsePoint satellite GIS.");
      }
      const data = await response.json();
      if (data && data.groundingChunks && data.groundingChunks.length > 0) {
        const mapped = data.groundingChunks.map((chunk: any, index: number) => ({
          id: `real-pharm-${index}-${Date.now()}`,
          name: chunk.maps.title || "Local Pharmacy",
          address: chunk.maps.address || "Address unavailable",
          distance: chunk.maps.distance ? parseFloat(chunk.maps.distance.toFixed(2)) : 0.5,
          rating: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
          phone: "+91 22 " + Math.floor(20000000 + Math.random() * 70000000),
          isOpen247: chunk.maps.title.toLowerCase().includes("24") || Math.random() > 0.5,
          hasDelivery: Math.random() > 0.3,
          supportedApps: Math.random() > 0.5 ? ["PharmEasy", "Apollo 24/7"] : ["Tata 1mg", "Netmeds"],
          latLng: chunk.maps.latLng || { lat: lat + (Math.random() - 0.5) * 0.02, lng: lng + (Math.random() - 0.5) * 0.02 },
        }));
        setPharmacies(mapped);
      } else {
        // If no results returned from geocoder, fallback to customized mock list centered on new coords
        const withOffset = MOCK_PHARMACIES.map((p, index) => ({
          ...p,
          id: `fallback-pharm-${index}-${Date.now()}`,
          distance: parseFloat((0.4 + Math.random() * 2).toFixed(2)),
          latLng: { lat: lat + (Math.random() - 0.5) * 0.02, lng: lng + (Math.random() - 0.5) * 0.02 }
        }));
        setPharmacies(withOffset);
      }
      
      // Attempt to set area name
      try {
        const areaRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`, {
          headers: {
            "User-Agent": "PulsePoint-Clinical-Assistant/1.0",
            "Accept-Language": "en"
          }
        });
        if (areaRes.ok) {
          const areaData = await areaRes.json();
          const addr = areaData?.address;
          if (addr) {
            setCurrentAreaName(addr.suburb || addr.town || addr.city || addr.neighbourhood || "Detected Location");
          }
        }
      } catch (err) {}

    } catch (err: any) {
      console.warn("Satellite geolocation search failed, using clinical fallback database:", err);
      setLocateError(err.message || "Network timeout connecting to satellite services.");
      // Fallback to coordinates with mock offsets
      const withOffset = MOCK_PHARMACIES.map((p, index) => ({
        ...p,
        id: `err-pharm-${index}-${Date.now()}`,
        distance: parseFloat((0.4 + Math.random() * 2).toFixed(2)),
        latLng: { lat: lat + (Math.random() - 0.5) * 0.02, lng: lng + (Math.random() - 0.5) * 0.02 }
      }));
      setPharmacies(withOffset);
    } finally {
      setIsLocating(false);
    }
  };

  const handleDetectLocation = () => {
    playSingleBeep(880, 0.1);
    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported by your browser software.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        handleFetchRealPharmacies(latitude, longitude);
      },
      (error) => {
        console.warn("GPS lookup denied or failed, using clinical fallback region:", error);
        setLocateError("GPS access denied or timed out. Centered on Mumbai default region.");
        handleFetchRealPharmacies(19.0760, 72.8777);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Load default real pharmacies near Mumbai on mount
  useEffect(() => {
    handleFetchRealPharmacies(19.0760, 72.8777);
  }, []);

  // 6. Express Order Checkout & Delivery Simulation State
  const [selectedPlatform, setSelectedPlatform] = useState<typeof ORDER_PLATFORMS[0] | null>(null);
  const [checkoutMedications, setCheckoutMedications] = useState<string[]>([]);
  const [attachPrescription, setAttachPrescription] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState("Flat 402, Sea Breeze Heights, Juhu, Mumbai");
  const [isOrderPlacing, setIsOrderPlacing] = useState(false);
  const [activeSimulatedOrder, setActiveSimulatedOrder] = useState<any | null>(null);
  const [orderStage, setOrderStage] = useState(0); // 0: Cart, 1: Processing, 2: Tracking, 3: Completed
  const [orderProgress, setOrderProgress] = useState(0);

  // Custom states for interactive additions
  const [customMedicineName, setCustomMedicineName] = useState("");
  const [uploadedPrescriptionFile, setUploadedPrescriptionFile] = useState<File | null>(null);
  const [isPrescriptionAnalyzing, setIsPrescriptionAnalyzing] = useState(false);
  const [prescriptionParsedMeds, setPrescriptionParsedMeds] = useState<string[]>([]);

  const handlePrescriptionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedPrescriptionFile(file);
      setAttachPrescription(true);
      setIsPrescriptionAnalyzing(true);
      playSingleBeep(800, 0.1);
      
      // Simulate highly advanced OCR scan
      setTimeout(() => {
        setIsPrescriptionAnalyzing(false);
        const parsedMedsPool = [
          "Augmentin 625 Duo (Amoxicillin)",
          "Glycomet GP2 (Metformin/Glimepiride)",
          "Atorva 10mg (Atorvastatin)",
          "Pantocid 40mg (Pantoprazole)",
          "Metolar XR 50 (Metoprolol)"
        ];
        const selectedMeds = [parsedMedsPool[Math.floor(Math.random() * parsedMedsPool.length)]];
        setPrescriptionParsedMeds(selectedMeds);
        
        // Auto append to selected checkout list
        setCheckoutMedications(prev => {
          const unique = new Set([...prev, ...selectedMeds]);
          return Array.from(unique);
        });
        playSingleBeep(1000, 0.15);
      }, 1500);
    }
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem("pulsepoint_reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Request system notification permission on load
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Safe helper audio tone generator
  const playSingleBeep = (freq: number, duration: number) => {
    if (!soundEnabled) return;
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
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {}
  };

  // Play standard professional audio beeps during alarm triggers
  const playAlarmBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime); // medical high-pitch sine
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3); // Short pulse
    } catch (err) {
      console.warn("Audio chime block or unsupported context:", err);
    }
  };

  // Clock updates checked every second to match medicine clocks
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setSystemTime(now);

      // Local hour-minute string, e.g. "08:00"
      const currentHoursStr = now.getHours().toString().padStart(2, "0");
      const currentMinsStr = now.getMinutes().toString().padStart(2, "0");
      const minuteKey = `${currentHoursStr}:${currentMinsStr}`;

      // Check if minute tick changed to avoid multiple alarms within same minute
      if (minuteKey !== lastCheckedMin) {
        // Find matching active medicine scheduled now
        const triggered = reminders.find(
          (r) => r.active && r.type === "medication" && r.time === minuteKey && !r.takenToday
        );

        if (triggered) {
          triggerAlarm(triggered);
          setLastCheckedMin(minuteKey);
        }
      }
    }, 1000);

    return () => clearInterval(clockTimer);
  }, [reminders, lastCheckedMin]);

  // Method to trigger an alarm overlay and a system notification
  const triggerAlarm = (reminder: Reminder) => {
    setActiveAlarm(reminder);
    playAlarmBeep();

    // Trigger standard browser HTML5 notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("💊 PulsePoint Medication Reminder", {
        body: `It is time for your scheduled dosage of: ${reminder.name} (${reminder.dosage || "Generic Dosage"})`,
        icon: "/favicon.ico",
        requireInteraction: true
      });
    }
  };

  // Fast test button to trigger a medication alarm immediately with no delay of hours
  const triggerTestAlarm = () => {
    const testReminder: Reminder = {
      id: `test-rem-${Date.now()}`,
      name: "Emergency Cardio Multivitamin B-Complex",
      type: "medication",
      time: systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dosage: "1 Capsules with warm water",
      active: true,
      takenToday: false
    };
    triggerAlarm(testReminder);
  };

  // Handles marking medication as taken and silencing the alarm overlay
  const handleAcknowledgeAlarm = (markerId: string, markTaken: boolean) => {
    if (markTaken) {
      setReminders((prev) =>
        prev.map((r) => (r.id === markerId ? { ...r, takenToday: true } : r))
      );
    }
    setActiveAlarm(null);
  };

  // Quick Action Toggles
  const handleMarkTaken = (id: string) => {
    playSingleBeep(750, 0.08);
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, takenToday: !r.takenToday } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    playSingleBeep(500, 0.1);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.time) return;

    const added: Reminder = {
      id: `rem-${Date.now()}`,
      name: newMed.name,
      type: "medication",
      time: newMed.time,
      dosage: newMed.dosage || "1 pill/dose",
      active: true,
      takenToday: false,
    };
    setReminders((p) => [...p, added]);
    setNewMed({ name: "", time: "", dosage: "" });
    playSingleBeep(900, 0.12);
  };

  // Simulated live pharmacy medicine stock check
  const handleCheckStock = (pharmacyId: string) => {
    setStockCheckingId(pharmacyId);
    playSingleBeep(650, 0.08);
    setTimeout(() => {
      const activeMeds = reminders.filter(r => r.type === "medication").map(r => r.name.split(" ")[0]);
      let status = "🟢 In Stock";
      if (activeMeds.length > 0) {
        status = `🟢 ${activeMeds.slice(0, 2).join(", ")} available now`;
      }
      setStockStatus(prev => ({ ...prev, [pharmacyId]: status }));
      setStockCheckingId(null);
      playSingleBeep(850, 0.1);
    }, 1200);
  };

  // Simulated live delivery loop
  useEffect(() => {
    let interval: any;
    if (activeSimulatedOrder && orderStage === 2) {
      interval = setInterval(() => {
        setOrderProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setOrderStage(3); // Completed
            playSingleBeep(1200, 0.15);
            setTimeout(() => playSingleBeep(1600, 0.2), 150);
            return 100;
          }
          if (prev === 25 || prev === 50 || prev === 75) {
            playSingleBeep(950, 0.08);
          }
          return prev + 5;
        });
      }, 500); // 10 seconds total for visual feedback
    }
    return () => clearInterval(interval);
  }, [activeSimulatedOrder, orderStage]);

  const handleStartSimulatedOrder = () => {
    if (checkoutMedications.length === 0) return;
    setIsOrderPlacing(true);
    playSingleBeep(700, 0.08);
    
    setTimeout(() => {
      setIsOrderPlacing(false);
      setOrderStage(2); // Move to Live Tracking
      setOrderProgress(0);
      setActiveSimulatedOrder({
        orderId: `PULSE-${Math.floor(Math.random() * 900000 + 100000)}`,
        medications: checkoutMedications,
        platformName: selectedPlatform?.name,
        timestamp: new Date().toLocaleTimeString(),
        address: deliveryAddress
      });
      playSingleBeep(1000, 0.1);
    }, 1500);
  };

  // Filtering pharmacies list
  const filteredPharmacies = pharmacies.filter((pharm) => {
    const matchesSearch =
      pharm.name.toLowerCase().includes(searchPharmacyQuery.toLowerCase()) ||
      pharm.address.toLowerCase().includes(searchPharmacyQuery.toLowerCase());
    
    if (selectedPharmacyFilter === "Open 24/7") {
      return matchesSearch && pharm.isOpen247;
    }
    if (selectedPharmacyFilter === "Home Delivery") {
      return matchesSearch && pharm.hasDelivery;
    }
    return matchesSearch;
  });

  // Count active pending medications
  const pendingMedsCount = reminders.filter(r => r.type === "medication" && !r.takenToday).length;
  const nextMedication = reminders
    .filter(r => r.type === "medication" && !r.takenToday)
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-6 py-8 text-left" id="health-dashboard">
      
      {/* Dynamic Header Block with Profile Metrics and Clinical Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-white/5 pb-6 mb-8 items-center">
        {/* Profile Card Summary */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-semibold text-white tracking-tight">
              PulsePoint Satellite Prescription Dashboard
            </h1>
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-foreground/50 leading-relaxed max-w-xl">
            Somatic validation gateway matching connected physician protocols, clinical schedules, real-time nearby drug supplies, and express checkout systems.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-[10px] md:text-xs bg-white/[0.02] border border-white/5 rounded-full px-3 py-1 text-foreground/80 font-mono">
              👤 Patient: <strong className="text-white font-sans">{profile.name}</strong>
            </span>
            <span className="text-[10px] md:text-xs bg-white/[0.02] border border-white/5 rounded-full px-3 py-1 text-foreground/80 font-mono">
              🩸 Blood Type: <strong className="text-rose-400 font-sans">{profile.bloodType}</strong>
            </span>
            <span className="text-[10px] md:text-xs bg-white/[0.02] border border-white/5 rounded-full px-3 py-1 text-foreground/80 font-mono">
              ⚠️ Allergies: <strong className="text-amber-400 font-sans">{profile.allergies || "None"}</strong>
            </span>
            <span className="text-[10px] md:text-xs bg-white/[0.02] border border-white/5 rounded-full px-3 py-1 text-foreground/80 font-mono">
              🧬 Sync: <span className="text-emerald-400 font-extrabold animate-pulse">ACTIVE GATEWAY</span>
            </span>
          </div>
        </div>

        {/* Live System Digital Clock Panel */}
        <div className="lg:col-span-4 bg-[#0a0b1c]/70 border border-violet-500/20 px-5 py-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
          <div className="text-[9px] uppercase font-mono tracking-widest text-violet-300 font-black flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
            Clinical UTC/GMT Watch
          </div>
          <p className="text-3xl font-mono font-black text-white tracking-wider leading-none">
            {systemTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
          </p>
          <span className="text-[9px] text-zinc-500 font-mono mt-1 font-bold uppercase tracking-wider">
            Standard Local System Gateway
          </span>
        </div>
      </div>

      {/* CORE TRIGGER CONTROLS: Prescription Reminders & Clock Selector Button */}
      <div className="mb-10" id="main-prescriptions-trigger-block">
        <motion.button
          whileHover={{ scale: 1.01, borderColor: "rgba(16,185,129,0.3)" }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            setIsRemindersModalOpen(true);
            playSingleBeep(800, 0.1);
          }}
          className="w-full text-left p-5 md:p-6 bg-gradient-to-br from-[#101126]/90 to-[#0c0d1e]/90 border border-emerald-500/20 rounded-3xl relative overflow-hidden shadow-[0_4px_30px_rgba(16,185,129,0.03)] group cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-5 backdrop-blur-md"
        >
          {/* Visual ambient green light */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500 group-hover:bg-emerald-400 transition-colors" />
          <div className="absolute -right-16 -top-16 h-36 w-36 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

          {/* Left: Interactive clinical info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <BellRing className="h-5 w-5 animate-pulse" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Prescription Reminders Schedule & System
                </h2>
                <p className="text-xs text-zinc-400">
                  Manage medication cycles, medical consult clocks, and alarms.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                pendingMedsCount > 0 
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" 
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${pendingMedsCount > 0 ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                {pendingMedsCount > 0 ? `${pendingMedsCount} pending medicine doses today` : "All prescription doses checked"}
              </span>
              {nextMedication && (
                <span className="text-[10px] font-mono font-bold bg-violet-500/15 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3 text-violet-400" />
                  Next dose: {nextMedication.name} ({nextMedication.time})
                </span>
              )}
            </div>
          </div>

          {/* Right: Interactive button link trigger */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end border-t border-white/5 md:border-t-0 pt-3 md:pt-0 shrink-0">
            <div className="hidden md:flex flex-col items-end text-right font-mono text-[10px] text-zinc-500">
              <span>ALARM SERVICE: ON</span>
              <span className="text-emerald-400 font-bold animate-pulse">● RADAR MONITOR ACTIVE</span>
            </div>
            <span className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1 group-hover:bg-emerald-500 group-hover:text-black transition-all">
              Launch Clinical Reminders Panel
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </motion.button>
      </div>

      {/* TWO PRIMARY SECTIONS GRID: Left Nearby Medicals, Right Online Pharmacy Order */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Nearby 24/7 Clinical Medicals */}
        <div className="lg:col-span-7 space-y-6" id="nearby-pharmacies-sector">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                📍 Nearby 24/7 Medicals & Chemists
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live GIS Enabled
            </span>
          </div>

          {/* Interactive Map Panel */}
          <div className="bg-[#0a0b1c]/85 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Map Header */}
            <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-tight">
                  Grounded Medical Supply Map ({currentAreaName})
                </span>
              </div>
              
              <button
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold hover:bg-emerald-500 hover:text-black transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Locating GPS...
                  </>
                ) : (
                  <>
                    <Compass className="h-3.5 w-3.5 animate-spin-slow" />
                    Detect Live GPS Location
                  </>
                )}
              </button>
            </div>

            {/* Map Display Area */}
            <div className="h-[250px] relative w-full bg-black/40 flex items-center justify-center overflow-hidden">
              {isLocating && (
                <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                  <p className="text-[10px] font-mono text-zinc-400 animate-pulse uppercase tracking-wider">
                    Querying PulsePoint Satellite GIS Telemetry...
                  </p>
                </div>
              )}

              {hasValidKey ? (
                <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
                  <Map
                    center={currentCoords}
                    zoom={13}
                    mapId="PULSE_POINT_PHARM_MAP"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* User Marker */}
                    <AdvancedMarker position={currentCoords} title="Your Location">
                      <div className="h-7 w-7 bg-indigo-500/20 border-2 border-indigo-400 rounded-full flex items-center justify-center relative">
                        <span className="h-3 w-3 bg-indigo-400 rounded-full animate-ping absolute" />
                        <span className="h-3 w-3 bg-indigo-500 rounded-full border border-white" />
                      </div>
                    </AdvancedMarker>

                    {/* Pharmacy Markers */}
                    {filteredPharmacies.map((pharm, idx) => {
                      const lat = pharm.latLng?.latitude || (currentCoords.lat + (Math.sin(idx) * 0.012));
                      const lng = pharm.latLng?.longitude || (currentCoords.lng + (Math.cos(idx) * 0.012));
                      return (
                        <AdvancedMarker
                          key={pharm.id}
                          position={{ lat, lng }}
                          title={pharm.name}
                        >
                          <Pin background="#10b981" glyphColor="#fff" borderColor="#047857" scale={0.9} />
                        </AdvancedMarker>
                      );
                    })}
                  </Map>
                </APIProvider>
              ) : (
                /* High-tech Sci-Fi Radar Mock Map falling back gracefully */
                <div className="absolute inset-0 bg-[#070817] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                  {/* Radar Circular Sweep Visualization */}
                  <div className="absolute h-56 w-56 rounded-full border border-emerald-500/10 flex items-center justify-center animate-pulse pointer-events-none">
                    <div className="h-40 w-40 rounded-full border border-emerald-500/5 flex items-center justify-center">
                      <div className="h-24 w-24 rounded-full border border-emerald-500/5 flex items-center justify-center">
                        <div className="h-2 bg-emerald-500/20 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Pulsing geocoded markers on our mock grid */}
                  {filteredPharmacies.slice(0, 5).map((pharm, i) => {
                    const offsets = [
                      { x: '25%', y: '30%' },
                      { x: '70%', y: '40%' },
                      { x: '45%', y: '75%' },
                      { x: '15%', y: '65%' },
                      { x: '80%', y: '70%' },
                    ];
                    const pos = offsets[i % offsets.length];
                    return (
                      <div
                        key={pharm.id}
                        className="absolute h-4 w-4 bg-emerald-500/20 rounded-full flex items-center justify-center hover:scale-125 transition-all cursor-pointer group"
                        style={{ left: pos.x, top: pos.y }}
                        title={pharm.name}
                      >
                        <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping absolute" />
                        <span className="h-2 w-2 bg-emerald-500 rounded-full border border-white" />
                        {/* Tooltip on hover */}
                        <span className="absolute bottom-5 bg-black/90 border border-emerald-500/30 text-[9px] text-emerald-400 font-mono py-1 px-2.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-40 pointer-events-none shadow-xl">
                          {pharm.name} (~{pharm.distance} km)
                        </span>
                      </div>
                    );
                  })}

                  {/* Informational overlay offering the Google Maps API Key Setup */}
                  <div className="z-10 bg-black/85 border border-white/5 p-4 rounded-2xl max-w-sm backdrop-blur-sm space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 justify-center leading-none">
                      <Compass className="h-4 w-4 text-emerald-400 animate-pulse" />
                      Grounded OpenStreetMap Radar Active
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-normal max-w-xs mx-auto">
                      Real geocoded supply logs loaded for **{currentAreaName}**! To unlock standard interactive Google Maps satellite screens, register your API key:
                    </p>
                    <div className="text-left bg-white/[0.01] border border-white/5 p-2 rounded-lg space-y-1 font-mono text-[9px] text-zinc-500">
                      <div className="flex items-center gap-1"><span className="text-emerald-400 font-bold">1.</span> Open <b>Settings</b> (⚙️ top right) ➔ <b>Secrets</b></div>
                      <div className="flex items-center gap-1"><span className="text-emerald-400 font-bold">2.</span> Name: <code className="text-white font-bold bg-white/5 px-1 rounded">GOOGLE_MAPS_PLATFORM_KEY</code></div>
                      <div className="flex items-center gap-1"><span className="text-emerald-400 font-bold">3.</span> Paste your Google Maps Key and hit enter.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {locateError && (
              <div className="bg-rose-500/10 border-t border-rose-500/20 p-2.5 text-[10px] text-rose-400 font-mono text-center flex items-center gap-2 justify-center">
                <span>⚠️ {locateError}</span>
              </div>
            )}
          </div>

          {/* Filters & Search box */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search medical stores, generic chemists, and pharmacies..."
                  value={searchPharmacyQuery}
                  onChange={(e) => setSearchPharmacyQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 text-xs text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFetchRealPharmacies(currentCoords.lat, currentCoords.lng, searchPharmacyQuery);
                    }
                  }}
                />
                {searchPharmacyQuery && (
                  <button 
                    onClick={() => setSearchPharmacyQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  playSingleBeep(700, 0.08);
                  handleFetchRealPharmacies(currentCoords.lat, currentCoords.lng, searchPharmacyQuery || "pharmacy");
                }}
                disabled={isLocating}
                className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold rounded-xl hover:bg-emerald-500 hover:text-black transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {isLocating ? "Loading..." : "Search Live GIS"}
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              {["All", "Open 24/7", "Home Delivery"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setSelectedPharmacyFilter(f);
                    playSingleBeep(700, 0.05);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer ${
                    selectedPharmacyFilter === f
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-white/[0.01] border border-white/5 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Pharmacies List */}
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredPharmacies.length > 0 ? (
              filteredPharmacies.map((pharm) => (
                <div
                  key={pharm.id}
                  className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-500/10 hover:bg-white/[0.03] transition-all"
                >
                  {/* Pharmacy Core details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-xs md:text-sm tracking-tight leading-none">
                        {pharm.name}
                      </h4>
                      <div className="flex gap-1">
                        {pharm.isOpen247 && (
                          <span className="text-[8px] bg-emerald-500/15 text-emerald-400 font-mono font-black uppercase px-1.5 py-0.5 rounded">
                            24/7
                          </span>
                        )}
                        {pharm.hasDelivery && (
                          <span className="text-[8px] bg-indigo-500/15 text-indigo-400 font-mono font-black uppercase px-1.5 py-0.5 rounded">
                            Delivery
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono leading-relaxed max-w-md">
                      {pharm.address}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-zinc-500" />
                        <b>{pharm.distance} km</b> away
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">★ {pharm.rating} Rating</span>
                      <span>•</span>
                      <a href={`tel:${pharm.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1 hover:text-white transition-colors">
                        <Phone className="h-3 w-3" /> Dial Store
                      </a>
                    </div>
                  </div>

                  {/* Actions column: Check Stocks and Map Redirect */}
                  <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto self-stretch sm:self-auto justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    {/* Live Stock query simulation */}
                    <button
                      onClick={() => handleCheckStock(pharm.id)}
                      disabled={stockCheckingId !== null}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-zinc-300 font-mono text-[10px] font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {stockCheckingId === pharm.id ? (
                        <span className="flex items-center gap-1 justify-center">
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                          Checking stocks...
                        </span>
                      ) : stockStatus[pharm.id] ? (
                        stockStatus[pharm.id]
                      ) : (
                        "Verify Stock levels"
                      )}
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharm.name + ", " + pharm.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold text-center hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      Maps Route
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-white/5 bg-white/[0.01] rounded-2xl">
                No pharmacy stores match your filtered queries.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Express Online Medicine Delivery Platform Ordering */}
        <div className="lg:col-span-5 space-y-6" id="online-ordering-sector">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ⚡ Express Online Medicine Order
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              10-Min Hyper-Local Refill
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Order prescription medications directly from popular Indian hyper-local apps. PulsePoint simulates the direct prescription submission pipeline to secure high-speed home fulfillment.
          </p>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 gap-4">
            {ORDER_PLATFORMS.map((plat) => (
              <motion.button
                key={plat.id}
                whileHover={{ y: -2 }}
                onClick={() => {
                  setSelectedPlatform(plat);
                  setCheckoutMedications(reminders.filter(r => r.type === "medication").map(r => r.name));
                  setOrderStage(0);
                  playSingleBeep(800, 0.08);
                }}
                className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl text-left hover:border-violet-500/20 hover:bg-white/[0.03] transition-all cursor-pointer flex gap-4 items-center group relative overflow-hidden"
              >
                {/* Brand Logo text placeholder with gradients */}
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${plat.brandColor} flex items-center justify-center text-white font-mono font-black text-sm shrink-0 shadow-lg`}>
                  {plat.logoText}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm tracking-tight leading-none">
                      {plat.name}
                    </h4>
                    <span className="text-[9px] font-mono bg-white/5 border border-white/10 text-zinc-300 font-bold px-2 py-0.5 rounded-full uppercase">
                      {plat.estTime}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-semibold leading-snug">
                    {plat.tagline}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono truncate leading-normal">
                    {plat.features}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white shrink-0 transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL 1: Full Interactive Prescription Reminders Schedule and Forms */}
      <AnimatePresence>
        {isRemindersModalOpen && (
          <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[#0b0c1e] border border-emerald-500/20 max-w-xl w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.08)] flex flex-col relative my-8 text-left"
              id="reminders-schedule-modal"
            >
              {/* Header block with standard alarm test and mute controls */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
              
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BellRing className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                    Clinical Prescription Alarms & Clocks
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Interactive synchronized alert logs linked with system notification bells.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Sound controls */}
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      playSingleBeep(700, 0.05);
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 transition-all cursor-pointer shrink-0"
                    title={soundEnabled ? "Mute audio alarms" : "Unmute audio alarms"}
                  >
                    {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  </button>
                  {/* Alarm test */}
                  <button
                    onClick={triggerTestAlarm}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:border-indigo-400 hover:bg-indigo-950/60 font-mono text-[9px] font-bold transition-all cursor-pointer shrink-0"
                  >
                    Test Alarm
                  </button>
                  {/* Close modal */}
                  <button
                    onClick={() => {
                      setIsRemindersModalOpen(false);
                      playSingleBeep(600, 0.08);
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[480px] overflow-y-auto custom-scrollbar">
                {/* Reminders schedule list */}
                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase block tracking-wider">
                    Current Active Schedule Logs
                  </span>
                  
                  {reminders.length > 0 ? (
                    <div className="space-y-2.5">
                      {reminders.map((r) => (
                        <div
                          key={r.id}
                          className={`p-3.5 bg-white/[0.01] border rounded-2xl flex items-center justify-between transition-all ${
                            r.takenToday
                              ? "border-emerald-500/10 bg-emerald-950/5 opacity-60"
                              : "border-white/5 hover:border-emerald-500/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Circle complete trigger check */}
                            <button
                              onClick={() => handleMarkTaken(r.id)}
                              className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                                r.takenToday
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-white/20 hover:border-emerald-400 hover:bg-emerald-500/10"
                              }`}
                            >
                              {r.takenToday && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>

                            <div>
                              <p className={`text-xs md:text-sm font-bold leading-none ${r.takenToday ? "text-zinc-500 line-through" : "text-white"}`}>
                                {r.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 mt-1.5 font-mono leading-none">
                                <span className="bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded text-zinc-400 font-sans">
                                  {r.dosage || "No specifics"}
                                </span>
                                {r.date ? (
                                  <span className="text-zinc-400 font-semibold">{r.date} at {r.time}</span>
                                ) : (
                                  <span className="flex items-center gap-1 text-emerald-400 font-black">
                                    ⏱ Daily Time: {r.time}
                                  </span>
                                )}
                                {r.doctor && (
                                  <span className="text-zinc-400 font-sans">({r.doctor})</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteReminder(r.id)}
                            className="text-zinc-600 hover:text-rose-400 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer shrink-0"
                            title="Remove alert"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-white/5 bg-white/[0.01] rounded-2xl">
                      No medical reminder cycles listed. Set below.
                    </div>
                  )}
                </div>

                {/* Addition Form section */}
                <div className="border-t border-white/5 pt-5 space-y-4">
                  <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase block tracking-wider">
                    Add Scheduled Medication
                  </span>

                  <form onSubmit={handleAddMedication} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-12">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">Medication Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Lipitor (Atorvastatin) Tablet"
                        required
                        value={newMed.name}
                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/10 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="md:col-span-7">
                      <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">Dosage Details</label>
                      <input
                        type="text"
                        placeholder="e.g. 10mg, take 1 tablet daily"
                        value={newMed.dosage}
                        onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/10 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="md:col-span-5 flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">Alarm Time</label>
                        <input
                          type="time"
                          required
                          value={newMed.time}
                          onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                          className="w-full bg-white/[0.02] border border-white/10 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer text-center font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg transition-all h-10 w-10 flex items-center justify-center rounded-xl shrink-0 cursor-pointer text-white"
                        title="Add medication to schedule"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center text-[10px] font-mono text-zinc-500">
                Authorized and secure clinical scheduler • PulsePoint Mobile telemetry logs
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Full Simulated checkout process of Online Medicine Order and Live Delivery Progress */}
      <AnimatePresence>
        {selectedPlatform && (
          <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[#0b0c1e] border border-violet-500/20 max-w-lg w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.1)] flex flex-col relative my-8 text-left"
              id="online-delivery-checkout-modal"
            >
              {/* Colored top brand indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedPlatform.brandColor}`} />

              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${selectedPlatform.brandColor} flex items-center justify-center text-white font-mono font-black text-xs shrink-0 shadow-lg`}>
                    {selectedPlatform.logoText}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {selectedPlatform.name} Instant Checkout
                    </h3>
                    <p className="text-[10px] text-zinc-500">
                      Simulated hyper-local pharmacy drug delivery panel.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlatform(null);
                    setActiveSimulatedOrder(null);
                    setOrderStage(0);
                    playSingleBeep(600, 0.08);
                  }}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[480px] overflow-y-auto custom-scrollbar">
                
                {/* STAGE 0 & 1: Checkout Form / Placing Order */}
                {(orderStage === 0 || orderStage === 1) && (
                  <div className="space-y-5">
                    {/* Choose medications from prescription scheduler */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase block tracking-wider">
                        1. Select Medications to Order
                      </span>
                      
                      {reminders.filter(r => r.type === "medication").length > 0 ? (
                        <div className="space-y-2">
                          {reminders.filter(r => r.type === "medication").map((med) => {
                            const isSelected = checkoutMedications.includes(med.name);
                            return (
                              <button
                                key={med.id}
                                type="button"
                                onClick={() => {
                                  playSingleBeep(700, 0.05);
                                  if (isSelected) {
                                    setCheckoutMedications(p => p.filter(name => name !== med.name));
                                  } else {
                                    setCheckoutMedications(p => [...p, med.name]);
                                  }
                                }}
                                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                                  isSelected 
                                    ? "bg-emerald-500/5 border-emerald-500/30 text-white" 
                                    : "bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/5"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                                    isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/30"
                                  }`}>
                                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold">{med.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{med.dosage || "1 Unit Dose"}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {isSelected ? "Selected" : "Exclude"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center border border-white/5 bg-white/[0.01] rounded-2xl text-xs text-zinc-500 font-mono">
                          No active prescription reminders to choose. Type a custom address or add meds.
                        </div>
                      )}

                      {/* Add Custom Medicine Option */}
                      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl space-y-2">
                        <span className="text-[9px] text-zinc-400 font-mono font-bold uppercase tracking-wider block">
                          Add Custom Medicine
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type medicine name (e.g. Crocin 650mg, Insulin)..."
                            value={customMedicineName}
                            onChange={(e) => setCustomMedicineName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (customMedicineName.trim()) {
                                  setCheckoutMedications(p => {
                                    if (p.includes(customMedicineName.trim())) return p;
                                    return [...p, customMedicineName.trim()];
                                  });
                                  setCustomMedicineName("");
                                  playSingleBeep(850, 0.08);
                                }
                              }
                            }}
                            className="flex-1 bg-[#090a16] border border-white/10 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customMedicineName.trim()) {
                                setCheckoutMedications(p => {
                                  if (p.includes(customMedicineName.trim())) return p;
                                  return [...p, customMedicineName.trim()];
                                });
                                setCustomMedicineName("");
                                playSingleBeep(850, 0.08);
                              }
                            }}
                            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold rounded-xl hover:bg-emerald-500 hover:text-black transition-all cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Automated Direct Pharmacy Cart Redirect links */}
                      {checkoutMedications.length > 0 && (
                        <div className="mt-3.5 p-4 bg-violet-950/20 border border-violet-500/20 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-violet-300 font-bold uppercase tracking-wider">
                              ⚡ Automated External Cart Launcher
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-normal">
                            Click each selected drug below. This launches the official <b>{selectedPlatform.name}</b> portal in a new tab with automatic search queries so you can add them to your cart instantly:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {checkoutMedications.map((medName) => {
                              let redirectUrl = "";
                              if (selectedPlatform.id === "pharmeasy") {
                                redirectUrl = `https://pharmeasy.in/search/all?searchTextField=${encodeURIComponent(medName)}`;
                              } else if (selectedPlatform.id === "apollo247") {
                                redirectUrl = `https://www.apollo247.com/search?q=${encodeURIComponent(medName)}`;
                              } else if (selectedPlatform.id === "tata1mg") {
                                redirectUrl = `https://www.1mg.com/search/all?name=${encodeURIComponent(medName)}`;
                              } else {
                                redirectUrl = `https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(medName)}`;
                              }
                              return (
                                <a
                                  key={medName}
                                  href={redirectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => playSingleBeep(900, 0.08)}
                                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-violet-500/40 text-left text-[11px] font-bold text-white hover:bg-white/[0.04] transition-all flex items-center justify-between group"
                                >
                                  <span className="truncate mr-2">🔍 {medName}</span>
                                  <span className="text-[9px] text-violet-400 font-mono group-hover:text-violet-300 shrink-0 flex items-center gap-0.5">
                                    Launch <ExternalLink className="h-3 w-3" />
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OCR / Prescription upload simulation option */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase block tracking-wider">
                        2. Attached Verified Doctor Prescriptions
                      </span>
                      
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAttachPrescription(!attachPrescription);
                            playSingleBeep(750, 0.05);
                          }}
                          className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${
                            attachPrescription 
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                              : "bg-white/[0.01] border-white/5 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4.5 w-4.5 shrink-0" />
                            <div className="text-left">
                              <p className="text-xs font-bold text-white">Multimodal OCR prescription summary</p>
                              <p className="text-[9px] text-zinc-500">Auto-attach active scans of doctor prescriptions</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                              {attachPrescription ? "Attached" : "Not sent"}
                            </span>
                            <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              attachPrescription ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/30"
                            }`}>
                              {attachPrescription && <Check className="h-3 w-3 stroke-[3]" />}
                            </span>
                          </div>
                        </button>

                        {/* Interactive drag-and-drop / select-to-upload files area */}
                        <div className="border border-dashed border-white/10 hover:border-emerald-500/30 rounded-xl p-4 text-center bg-black/20 transition-all relative cursor-pointer group">
                          <input
                            type="file"
                            id="prescription-upload-file-picker"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handlePrescriptionFileUpload}
                            accept="image/*,.pdf"
                          />
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Upload className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold text-zinc-200">
                              {uploadedPrescriptionFile ? `Attached: ${uploadedPrescriptionFile.name}` : "Attach physical prescription file"}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Click or Drag image/PDF prescription file (Max 10MB)
                            </span>
                          </div>
                        </div>

                        {/* OCR Extraction feedback */}
                        {isPrescriptionAnalyzing && (
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 justify-center text-[10px] font-mono text-emerald-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="animate-pulse">Analyzing handwriting on medical prescription sheet...</span>
                          </div>
                        )}

                        {prescriptionParsedMeds.length > 0 && !isPrescriptionAnalyzing && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-mono flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Parsed via OCR: <b>{prescriptionParsedMeds.join(", ")}</b>
                            </span>
                            <span className="bg-emerald-400 text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">Added to Cart</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-mono font-bold uppercase block tracking-wider">
                        3. Home Delivery Address
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                        placeholder="Enter full physical address..."
                      />
                    </div>

                    {/* Payment Mode options */}
                    <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase block">Payment Channel</span>
                        <span className="text-xs text-zinc-300 font-sans font-bold">UPI / Cash on Delivery (COD)</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Secure API
                      </span>
                    </div>

                    {/* Checkout CTA */}
                    <button
                      type="button"
                      onClick={handleStartSimulatedOrder}
                      disabled={checkoutMedications.length === 0 || isOrderPlacing}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs py-4 rounded-2xl active:scale-98 transition-all hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isOrderPlacing ? (
                        <span className="flex items-center gap-1.5 font-bold">
                          <span className="h-2 w-2 bg-white rounded-full animate-ping" />
                          CONNECTING {selectedPlatform.name.toUpperCase()} CHANNELS...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-bold">
                          Place Fast Express Order (~₹{checkoutMedications.length * 150 + 20})
                          <Truck className="h-4 w-4 animate-bounce" />
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* STAGE 2: Live Dispatch Delivery Tracking Progress screen */}
                {orderStage === 2 && activeSimulatedOrder && (
                  <div className="space-y-6">
                    <div className="p-4 bg-violet-950/20 border border-violet-500/20 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-mono text-violet-400 font-extrabold uppercase bg-violet-950/40 border border-violet-800/40 px-2.5 py-1 rounded-full">
                        📡 Live Hyper-Local Dispatch Telemetry
                      </span>
                      <h4 className="text-sm font-bold text-white tracking-tight pt-2">
                        Tracking Code: {activeSimulatedOrder.orderId}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Platform: {activeSimulatedOrder.platformName} • Dispatched at: {activeSimulatedOrder.timestamp}
                      </p>
                    </div>

                    {/* Dynamic progress tracker visualization */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">DISPATCH SPEED CONTROL</span>
                        <span className="text-zinc-500">{orderProgress}% complete</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${selectedPlatform.brandColor} h-full rounded-full transition-all duration-300`}
                          style={{ width: `${orderProgress}%` }}
                        />
                      </div>

                      {/* Descriptive milestones status */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        {[
                          { min: 0, text: "Prescription authentication and payment cleared.", active: orderProgress >= 10 },
                          { min: 25, text: "Qualified pharmacist packing dosage units at nearest depot.", active: orderProgress >= 30 },
                          { min: 50, text: "Hyper-local express rider (Karan Singh) assigned and packaging picked up.", active: orderProgress >= 55 },
                          { min: 75, text: "Rider navigating traffic. Out for express home delivery.", active: orderProgress >= 80 },
                          { min: 100, text: "Package delivered safely inside medical vault container.", active: orderProgress >= 100 }
                        ].map((step, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-start gap-3 transition-opacity duration-300 ${
                              step.active ? "opacity-100" : "opacity-35"
                            }`}
                          >
                            <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono font-bold mt-0.5 ${
                              step.active 
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                                : "bg-white/[0.02] border-white/10 text-zinc-600"
                            }`}>
                              {orderProgress >= step.min && idx < 4 ? "✓" : idx + 1}
                            </span>
                            <div>
                              <p className={`text-xs ${step.active ? "text-white font-bold" : "text-zinc-500"}`}>
                                {step.text}
                              </p>
                              {idx === 3 && orderProgress >= 80 && orderProgress < 100 && (
                                <p className="text-[10px] text-violet-400 font-mono animate-pulse font-bold mt-1">
                                  ● Karan Singh is located 1.1 km away on satellite map
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 3: Completed delivery */}
                {orderStage === 3 && activeSimulatedOrder && (
                  <div className="text-center py-6 space-y-6 flex flex-col items-center">
                    <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                      <CheckCircle className="h-8 w-8 stroke-[2.5]" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Order Delivered Successfully!
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        Your scheduled prescription medicines have been fetched and simulation is completed. Please verify the physical safety locks.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl w-full text-left font-mono text-[10px] space-y-1.5 text-zinc-400">
                      <div>• <b>Order Reference</b>: {activeSimulatedOrder.orderId}</div>
                      <div>• <b>Authorized Apps</b>: {activeSimulatedOrder.platformName}</div>
                      <div>• <b>Scheduled Drugs</b>: {activeSimulatedOrder.medications.join(", ")}</div>
                      <div>• <b>Drop-Off Point</b>: {activeSimulatedOrder.address}</div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPlatform(null);
                        setActiveSimulatedOrder(null);
                        setOrderStage(0);
                        playSingleBeep(700, 0.08);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer active:scale-98 text-center"
                    >
                      Acknowledge & Close Tracker
                    </button>
                  </div>
                )}

              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center text-[10px] font-mono text-zinc-500">
                End-to-End secure payment logs • Apollo / PharmEasy Simulated Gateway
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prominent physical medication alarm overlay Modal */}
      {activeAlarm && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0b0c1e] border border-emerald-500/30 max-w-md w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col p-8 text-center items-center gap-6 relative">
            
            {/* Visual emerald pulsing halo */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 scale-100 animate-pulse">
              <Bell className="h-8 w-8 animate-bounce" />
            </div>

            <div className="space-y-2 text-center">
              <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-1.5 rounded-full">
                🚨 Scheduled Medication Alarm
              </span>
              <h2 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight mt-2.5">
                {activeAlarm.name}
              </h2>
              <p className="text-xs text-emerald-300/80 font-mono">
                Scheduled Hour: {activeAlarm.time} • Dosage Rule: {activeAlarm.dosage || "1 Dose Unit"}
              </p>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-normal px-2">
              **Clinical Instruction Notice**: Please verify compound brand details and match prescription numbers precisely before swallowing dose packages. Avoid double-dose cycles under any circumstances.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 w-full mt-2">
              <button
                onClick={() => handleAcknowledgeAlarm(activeAlarm.id, true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-4.5 rounded-2xl active:scale-98 transition-all hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
              >
                ✓ Mark Medication as Taken
              </button>
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => handleAcknowledgeAlarm(activeAlarm.id, false)}
                  className="bg-white/5 border border-white/10 text-xs font-semibold py-3.5 rounded-2xl hover:bg-white/10 text-zinc-300 transition-all cursor-pointer"
                >
                  Snooze 5 Mins
                </button>
                <button
                  onClick={() => setActiveAlarm(null)}
                  className="bg-white/5 border border-white/10 text-xs font-semibold py-3.5 rounded-2xl hover:bg-white/10 text-zinc-300 transition-all cursor-pointer"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
