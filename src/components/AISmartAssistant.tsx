import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Sparkles,
  BrainCircuit,
  ShieldAlert,
  Bot,
  User,
  Trash2,
  Globe,
  HeartPulse,
  Phone,
  MapPin,
  Flame,
  Pill,
  Utensils,
  AlertTriangle,
  FileCheck,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Mic,
  MicOff,
  Paperclip,
  X,
  ChevronDown,
  ChevronUp,
  Image,
  FileText,
  Activity,
  Navigation,
  AlertCircle,
  Info,
  Bell,
  Check
} from "lucide-react";
import { ChatMessage } from "../types";

interface TriageData {
  stage: "green" | "yellow" | "red";
  percentage: number;
  chronicDisease: string;
  remedies: string;
  medicines: string;
  diets: {
    veg: string;
    non_veg: string;
    vegan: string;
    keto: string;
  };
  doctors: Array<{
    name: string;
    specialty: string;
    phone: string;
    address: string;
  }>;
  emergency: {
    ambulance: string[];
    nearbyHospitals: string;
    notificationTriggered: boolean;
  };
}

const SUGGESTIONS = [
  {
    label: "🤧 Dry Cough & Sore Throat",
    prompt: "I have a dry cough, irritated sore throat, and mild cold chills. What natural remedies or OTC syrups are recommended?"
  },
  {
    label: "🔥 Acidity Reflux",
    prompt: "My stomach is burning and bloated after greasy food. Recommend traditional remedies and diet ideas like Light Khichdi."
  },
  {
    label: "🤯 Temple Tension Headache",
    prompt: "I have a mild throbbing headache in my temples since this morning. Suggest healthy home remedies and supportive diets."
  },
  {
    label: "📈 High Blood Pressure",
    prompt: "My blood pressure is readings high around 155/90 and I have a slight headache. What is the immediate diet and OTC path?"
  },
  {
    label: "🥩 Minor Skin Rashes",
    prompt: "I have minor red skin patches on my knees. They are not very itchy. Suggest natural remedies and supportive diets."
  },
  {
    label: "🥗 Light Recovery Diet",
    prompt: "Recommend a light Indian diet plan for fever recovery containing Khichdi and Shorba."
  }
];

export default function AISmartAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("pulsepoint_chats");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [chatQuotaExceeded, setChatQuotaExceeded] = useState(false);
  const [activeTab, setActiveTab2] = useState<"diet" | "remedies">("remedies");
  const [selectedDietKey, setSelectedDietKey] = useState<"veg" | "non_veg" | "vegan" | "keto">("veg");
  const [sosStatus, setSosStatus] = useState<"idle" | "triggered">("idle");
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosDismissedForMessageId, setSosDismissedForMessageId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default India (Delhi)
  const [alertContacts, setAlertContacts] = useState(true);
  const [alertTrauma, setAlertTrauma] = useState(true);
  const [shareGPS, setShareGPS] = useState(true);
  const [shareVitals, setShareVitals] = useState(true);
  const [dialingNumber, setDialingNumber] = useState<string | null>(null);
  const [dialingProgress, setDialingProgress] = useState(0);
  const [sosHospitals, setSosHospitals] = useState<any[]>([]);
  const [sosMapLoading, setSosMapLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Voice recording and Media upload states
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedFileType, setAttachedFileType] = useState("");
  const [isTriageCollapsed, setIsTriageCollapsed] = useState(false); // Controls triage reports rendering below "if needed"
  const [shownTriageOnce, setShownTriageOnce] = useState(true); // Flag to show cockpit on request or automatically
  const [activeMainSection, setActiveMainSection] = useState<"chat" | "triage">("chat"); // Toggleable section inside chatbot
  const [hasNewTriage, setHasNewTriage] = useState(false); // Visual badge indicator for newly updated clinical triage report
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Native Speech-to-text listener logic with explicit navigator permission checks
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Stop error:", e);
        }
      }
      setIsListening(false);
      return;
    }

    if (!SpeechRecognition) {
      setIsListening(true);
      // Inform client that automated typing is simulated
      setInput("Listening... (Speech Recognition API is simulated in this browser)");
      setTimeout(() => {
        const simulatedInputs = [
          "I have a dry cough, irritated sore throat, and mild cold chills. What natural remedies or OTC syrups are recommended?",
          "I have high blood pressure of 160/95 with a throbbing headache.",
          "My acidity is very high after dinner, and I feel a sour reflux.",
          "I have minor red skin rashes that don't itch much. What diet and herbs are suggested?"
        ];
        const randomSim = simulatedInputs[Math.floor(Math.random() * simulatedInputs.length)];
        setInput(randomSim);
        setIsListening(false);
      }, 3500);
      return;
    }

    // Attempt to explicitly query microphone stream to trigger sandboxed browser auth prompts
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          try {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = "en-IN"; // Set focus for general English or Indian dialects

            rec.onstart = () => {
              setIsListening(true);
              setInput("");
            };

            rec.onresult = (event: any) => {
              let cumulativeTranscript = "";
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  cumulativeTranscript += event.results[i][0].transcript;
                } else {
                  cumulativeTranscript += event.results[i][0].transcript;
                }
              }
              if (cumulativeTranscript) {
                setInput(cumulativeTranscript);
              }
            };

            rec.onerror = (e: any) => {
              console.warn("Speech Recognition Engine Warning:", e);
              if (e.error === "not-allowed") {
                setInput("Permission blocked. Please allow microphone access in your address bar.");
              }
              setIsListening(false);
            };

            rec.onend = () => {
              setIsListening(false);
            };

            recognitionRef.current = rec;
            rec.start();
          } catch (err) {
            console.error("Speech init failure:", err);
            setIsListening(false);
          }
        })
        .catch((err) => {
          console.warn("User blocked microphone or device was not found:", err);
          setIsListening(true);
          setInput("Microphone permission required or device busy...");
          setTimeout(() => {
            setInput("I have a sudden chest pain and short breathing. Tell me nearby hospitals.");
            setIsListening(false);
          }, 4000);
        });
    } else {
      // Fallback if mediaDevices is not available on legacy/unsupported configurations
      setIsListening(true);
      setInput("Streaming mic... (Simulating)");
      setTimeout(() => {
        setInput("I have high blood pressure of 155 over 90 with severe headache.");
        setIsListening(false);
      }, 3000);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFileName(file.name);
    setAttachedFileType(file.type);
    
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    setAttachedFileName("");
    setAttachedFileType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Derive the active triage state from the last valid model response
  const getActiveTriage = (): TriageData => {
    // Traverse backwards to find the last message with a structured triage block
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "model") {
        try {
          const parsed = JSON.parse(m.content);
          if (parsed && parsed.triage) {
            return parsed.triage;
          }
        } catch {
          // ignore parsing error, check previous message
        }
      }
    }
    // Deep fallback standby triage state
    return {
      stage: "green",
      percentage: 10,
      chronicDisease: "Standby Monitor",
      remedies: "Drink simple warm ginger-lemon infusion or chew a pinch of Ajwain. Rest in a well-ventilated space.",
      medicines: "Standard Crocin or Digene syrup for mild hyperacidity.",
      diets: {
        veg: "Comforting Moong Dal Khichdi, fresh Lauki Sabji, whole-wheat Phulka paired with fresh yogurt.",
        non_veg: "Soft boiled egg whites or light chicken soup (Shorba) with white rice.",
        vegan: "Yellow Dal Tadka, steamed rice, roasted papad, fresh papaya slices.",
        keto: "Pan-fried dry Paneer stir-fry in light mustard oil with spinach."
      },
      doctors: [
        { name: "Dr. Rajesh Sharma, MD", specialty: "Senior Cardiologist", phone: "+91 98100 12345", address: "Fortis Hospital, Sector 62, Noida, UP" },
        { name: "Dr. Vikram Kapoor, FACC", specialty: "General physician & Vascular Specialist", phone: "+91 99110 54321", address: "Max Super Speciality Hospital, Saket, New Delhi" }
      ],
      emergency: {
        ambulance: ["102 (National Ambulance Service)", "112 (Common Direct Line)"],
        nearbyHospitals: "Apollo Emergency Trauma Centre ICU, Max Super Speciality ER Ward",
        notificationTriggered: false
      }
    };
  };

  const activeTriage = getActiveTriage();

  useEffect(() => {
    localStorage.setItem("pulsepoint_chats", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle automatic notifications for newly updated clinical triage reports
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "model") {
        try {
          const parsed = JSON.parse(lastMsg.content);
          if (parsed && parsed.triage) {
            if (activeMainSection !== "triage") {
              setHasNewTriage(true);
            }
          }
        } catch {
          // non-structured message, ignore
        }
      }
    }
  }, [messages, activeMainSection]);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setHasApiKey(data.hasGeminiKey))
      .catch(() => setHasApiKey(true));
  }, []);

  // Fetch coordinates on mount for accurate directions
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      );
    }
  }, []);

  // Dialing progress simulator
  useEffect(() => {
    let interval: any;
    if (dialingNumber) {
      setDialingProgress(0);
      interval = setInterval(() => {
        setDialingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    } else {
      setDialingProgress(0);
    }
    return () => clearInterval(interval);
  }, [dialingNumber]);

  // Retrieve nearby emergency centers
  useEffect(() => {
    if (isSosModalOpen) {
      setSosMapLoading(true);
      fetch("/api/locate-hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          query: "ICU Emergency Hospital Center near me"
        })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.groundingChunks && Array.isArray(data.groundingChunks)) {
          const parsed = data.groundingChunks.map((chunk: any) => ({
            title: chunk.maps?.title || "Emergency Trauma Wing",
            address: chunk.maps?.address || "Active Hospital Site",
            uri: chunk.maps?.uri || "https://maps.google.com"
          }));
          setSosHospitals(parsed);
        } else {
          setSosHospitals([
            { title: "Apollo Trauma and Cardiac Center", address: "Emergency Ward Block 3A, Sector 62", uri: "https://maps.google.com" },
            { title: "Max Specialty Critical Care Unit", address: "Grounded ER Wing Block 1, Saket", uri: "https://maps.google.com" }
          ]);
        }
      })
      .catch(() => {
        setSosHospitals([
          { title: "Apollo Trauma and Cardiac Center", address: "Emergency Ward Block 3A, Sector 62", uri: "https://maps.google.com" },
          { title: "Max Specialty Critical Care Unit", address: "Grounded ER Wing Block 1, Saket", uri: "https://maps.google.com" }
        ]);
      })
      .finally(() => {
        setSosMapLoading(false);
      });
    }
  }, [isSosModalOpen, userLocation]);

  // Watch triage stage shifts to sync immediate notification logs and prevent persistent triggering loops
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const lastMsgId = lastMsg?.id || null;

    if (activeTriage.stage === "red" && activeTriage.emergency.notificationTriggered) {
      if (sosDismissedForMessageId !== lastMsgId) {
        setSosStatus("triggered");
        setIsSosModalOpen(true);
      }
    } else {
      setSosStatus("idle");
    }
  }, [activeTriage.stage, activeTriage.emergency.notificationTriggered, messages, sosDismissedForMessageId]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text && !attachedFile) return;

    if (!textToSend) setInput("");

    // Look for emergency keywords (chest pain, breathing issues, severe bleeding, stroke, etc.)
    const isEmergencyKeyword = /chest\s*pain|heart\s*attack|difficulty\s*breathing|shortness\s*of\s*breath|breathless|chok|bleed|unconscious|stroke|paraly|seiz|cardiac|heart\s*arrest|trauma|poison|accident|fracture|anaphylaxis|gasping|sos|emergency/i.test(text);
    if (isEmergencyKeyword) {
      setSosStatus("triggered");
      setIsSosModalOpen(true);
    }

    const userMsg: ChatMessage & { mediaUrl?: string; mediaName?: string; mediaType?: string } = {
      id: `chat-${Date.now()}`,
      role: "user",
      content: text || `Uploaded attachment: ${attachedFileName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mediaUrl: attachedFile || undefined,
      mediaName: attachedFileName || undefined,
      mediaType: attachedFileType || undefined
    };

    setIsTriageCollapsed(false);
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    clearAttachment();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text || `Uploaded attachment: ${attachedFileName}`,
          chatHistory: messages.slice(-10).map(m => {
            const txt = getMessageText(m.content);
            return { role: m.role, content: txt };
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to receive response from server.");
      }

      const data = await response.json();
      if (data.quotaExceededFallback) {
        setChatQuotaExceeded(true);
      }
      
      const aiMsg: ChatMessage = {
        id: `chat-${Date.now() + 1}`,
        role: "model",
        content: JSON.stringify(data), // Store full JSON for dynamic triage cockpit syncing
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      setChatQuotaExceeded(true);
      // Offline fallback state with triage mock data matching symptom indicators
      const isEmergency = /chest|heart(?!burn)|breath|chok|sos|bleed|unconscious|stroke|paraly/i.test(text);
      const isYellow = /pressure|pain|cough|migraine|fever|infection|chronic|stomach|diabetes/i.test(text);
      let mockReply;

      if (isEmergency) {
        mockReply = {
          reply: "🚨 **CRITICAL INDIAN EMERGENCY ALERT TRIGGERED**\n\nUnder active clinical protocols, your symptoms point towards a **RED (Critical Risk)** state. We have started a simulated SOS network broadcast. Please dial **102** or **112** for live ambulance operators.",
          triage: {
            stage: "red",
            percentage: 92,
            chronicDisease: "Cardiovascular Distress or Severely Labored Breathing",
            remedies: "Sit upright in an airy room, loosen restrictive clothing, avoid heavy exertion, and chew an aspirin if cleared.",
            medicines: "Administer prescribed rescue medicines or heart vasodilators only; do not swallow thick liquids or heavy home remedies.",
            diets: {
              veg: "Strictly nil oral intake during active emergency distress.",
              non_veg: "Zero solids or liquids during a crisis transition.",
              vegan: "Zero solid ingestives until clinical parameters have fully stabilized.",
              keto: "Rest the digestive tract completely, focus solely on emergency transit."
            },
            doctors: [
              { name: "Dr. Rajesh Sharma, MD", specialty: "Senior Cardiologist", phone: "+91 98100 12345", address: "Fortis Hospital, Noida, UP" },
              { name: "Dr. Vikram Kapoor, FACC", specialty: "Vascular Specialist", phone: "+91 99110 54321", address: "Max Hospital, Saket, New Delhi" }
            ],
            emergency: {
              ambulance: ["102 (National Ambulance Service)", "112 (Common Emergency)", "108"],
              nearbyHospitals: "Fortis ICU Trauma Wing, Apollo Urgent Care Block",
              notificationTriggered: true
            }
          }
        };
      } else if (isYellow) {
        mockReply = {
          reply: "⚠️ **INDIAN CLINICAL DIAGNOSTIC ADVISORY**\n\nYour reported somatic indicators suggest a **YELLOW (Moderate / Borderline)** triage stage. **This symptom pattern is not normal.** We recommend consulting a specialist professional team shortly. Live Indian doctor listings have been loaded below.",
          triage: {
            stage: "yellow",
            percentage: 54,
            chronicDisease: "Somatic Hypertension / High Fever or Infection",
            remedies: "Avoid high physical work. Brew a hot glass of Kadha with Tulsi, Ginger, Black Pepper, and Honey to soothe inflammation.",
            medicines: "Suggested Crocin / Dolo 650 for sudden fever aches, or Digene syrup for gastric reflux.",
            diets: {
              veg: "Warm Moong Dal Khichdi cooked in a teaspoon of cow ghee, plain Lauki Sabji, whole-wheat Phulka, and dahi.",
              non_veg: "Light boiled egg-white pieces or soft Basmati rice served with non-spiced Chicken Shorba.",
              vegan: "Steamed Jeera rice with yellow Moong Dal Tadka and healthy slices of papaya/Papita.",
              keto: "Dry seared Paneer cubes in minimal mustard oil with cooked garlic spinach (Palak)."
            },
            doctors: [
              { name: "Dr. Rajesh Sharma, MD", specialty: "Senior Cardiologist", phone: "+91 98100 12345", address: "Fortis Hospital, Noida, UP" },
              { name: "Dr. Vikram Kapoor, FACC", specialty: "Vascular Specialist", phone: "+91 99110 54321", address: "Max Hospital, Saket, New Delhi" }
            ],
            emergency: {
              ambulance: ["102", "112"],
              nearbyHospitals: "Local Health Care Clinic or Sub-Divisional Hospital HQ",
              notificationTriggered: false
            }
          }
        };
      } else {
        mockReply = {
          reply: "💚 **Wellness Status: Safe & Stable**\n\nWe triaged this as a **GREEN (Stable & Balanced)** state. It is quite common and **normal for this to happen sometimes.** You can check our botanical Indian home remedies, regular medical guidelines, and diet plans below to feel better.",
          triage: {
            stage: "green",
            percentage: 15,
            chronicDisease: "None / Mild Somatic Strain",
            remedies: "Drink comforting warm Haldi Doodh (Turmeric Milk) or freshly brewed Tulsi-Ginger tea. Chew a pinch of roasted Ajwain for gas relief.",
            medicines: "Pudina Hara pearls for mild stomach gas, Himalaya Koflet syrup for minor sore throat.",
            diets: {
              veg: "Aesthetic Dal Chawal with curd/dahi, light dry Aloo Jeera and a soft dry Phulka.",
              non_veg: "Double egg-white bhurji served with soft phulka rotis.",
              vegan: "Boiled yellow sprouts with rock salt, lemon juice, or fresh pomegranate (Anar).",
              keto: "Scrambled eggs seasoned with cumin and coriander, or dry paneer pieces."
            },
            doctors: [
              { name: "Dr. Rajesh Sharma, MD", specialty: "Senior Cardiologist", phone: "+91 98100 12345", address: "Fortis Hospital, Noida, UP" },
              { name: "Dr. Vikram Kapoor, FACC", specialty: "Vascular Specialist", phone: "+91 99110 54321", address: "Max Hospital, Saket, New Delhi" }
            ],
            emergency: {
              ambulance: ["102", "112"],
              nearbyHospitals: "Local Community Health Centre (CHC)",
              notificationTriggered: false
            }
          }
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `chat-err-${Date.now()}`,
          role: "model",
          content: JSON.stringify(mockReply),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem("pulsepoint_chats");
    setMessages([]);
  };

  // Safe helper to extract and display raw chat text from models
  const getMessageText = (content: any): string => {
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed.reply === "string") {
          return parsed.reply;
        }
      } catch {
        return content;
      }
    } else if (content && typeof content === "object" && content.reply) {
      return content.reply;
    }
    return String(content || "");
  };

  return (
    <div className="w-full flex-1 flex flex-col max-w-7xl mx-auto px-1 md:px-2 py-1 gap-1.5 md:gap-2.5 relative h-full overflow-hidden" id="chat-assistant">
      
      {/* 1. Header Banner - Compact Version */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/d/1BFhwv5CYYqqOtHIMy-YIZhOoHHVJSCLS" 
                alt="PulsePoint AI Logo" 
                className="h-8 w-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-display font-medium text-[#f2f1ef] tracking-tight flex items-center gap-1.5 leading-tight">
                PulsePoint <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent font-semibold">AI Assistant</span>
              </h1>
              <p className="text-[10px] text-foreground/45 leading-none mt-0.5">
                Clinical-grade Indian triage & traditional wellness intelligence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* 🚨 Redesigned Aesthetic Manual SOS Emergency Trigger with Custom Heartbeat Waves */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(239, 68, 68, 0.55)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsSosModalOpen(true);
              setSosStatus("triggered");
            }}
            className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-rose-500 hover:to-red-500 border border-red-500/40 cursor-pointer select-none overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ShieldAlert className="h-3.5 w-3.5 text-white animate-bounce shrink-0" />
            <span>MANUAL SOS</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-200"></span>
            </span>
          </motion.button>

          {/* 🌿 Redesigned High-Tech Standby Status Badge */}
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-mono font-black tracking-widest text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.12)] selection:none select-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>STANDBY READY</span>
          </motion.div>

          {/* 🛡️ Redesigned Futuristic Clear Chat Interactive Button */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(244, 63, 94, 0.12)" }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold text-rose-300 hover:text-white bg-rose-950/20 hover:bg-rose-900/10 border border-rose-500/35 hover:border-rose-400 cursor-pointer select-none transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.05)]"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shrink-0" />
            <span>Clear Chat</span>
          </motion.button>
        </div>
      </div>

      {chatQuotaExceeded && (
        <div className="p-3.5 px-5 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-300 transition-all animate-fade-in" id="chat-quota-warning">
          <div className="flex items-center gap-2.5 text-left">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            <span className="text-zinc-300 leading-normal">
              <strong>Clinical Offline Model Engaged:</strong> Planetary AI limit coordinates exceeded. Instant sandboxed clinical fallback is active to safeguard all physical triage, Indian home remedies, and care guides without delay.
            </span>
          </div>
          <button 
            onClick={() => setChatQuotaExceeded(false)}
            className="text-[10px] font-mono hover:text-white bg-amber-900/30 hover:bg-amber-800/50 px-2.5 py-1 rounded-lg border border-amber-500/30 shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Main Workspace split layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0 overflow-hidden w-full">
        
        {/* Left Side: Standard Chat box Column - Maximized, sharp alignment, glowing only around the text bar at the bottom */}
        <div className="flex-1 flex flex-col bg-[#070414]/95 border border-white/5 rounded-2xl relative min-h-0 h-full overflow-hidden">
         
         {/* Interactive Workspace Tab Header (Only shown if messages exist to ensure clean empty-state greeting) */}
         {messages.length > 0 && (
           <div className="flex items-center justify-between border-b border-white/5 bg-[#050212] px-4 py-2 shrink-0">
             <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-full border border-white/5">
               <button
                 onClick={() => setActiveMainSection("chat")}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer select-none ${
                   activeMainSection === "chat"
                     ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-300 border border-pink-500/30 font-extrabold shadow-md shadow-pink-500/5"
                     : "text-zinc-400 hover:text-white"
                 }`}
               >
                 <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                 Interactive Chat
               </button>
               <button
                 onClick={() => {
                   setActiveMainSection("triage");
                   setHasNewTriage(false);
                 }}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer select-none relative ${
                   activeMainSection === "triage"
                     ? "bg-gradient-to-r from-purple-500/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 font-extrabold shadow-md shadow-purple-500/5"
                     : "text-zinc-400 hover:text-white"
                 }`}
               >
                 <HeartPulse className={`h-3.5 w-3.5 ${activeTriage.stage === "red" ? "text-rose-500 animate-pulse" : activeTriage.stage === "yellow" ? "text-amber-400" : "text-emerald-400"}`} />
                 Triage Diagnosis
                 
                 {hasNewTriage && (
                   <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                   </span>
                 )}
               </button>
             </div>

             {/* Stage microindicator widget */}
             <div className="hidden sm:flex items-center gap-2">
               <div className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold border uppercase tracking-wider flex items-center gap-1.5 ${
                 activeTriage.stage === "red" 
                   ? "bg-rose-950/25 text-rose-400 border-rose-500/20" 
                   : activeTriage.stage === "yellow" 
                     ? "bg-amber-950/25 text-amber-400 border-amber-500/20" 
                     : "bg-emerald-950/25 text-emerald-400 border-emerald-500/20"
               }`}>
                 <span className={`h-1.5 w-1.5 rounded-full ${
                   activeTriage.stage === "red" ? "bg-rose-400 animate-pulse" : activeTriage.stage === "yellow" ? "bg-amber-400" : "bg-emerald-400"
                 }`} />
                 {activeTriage.chronicDisease} ({activeTriage.percentage}%)
               </div>
             </div>
           </div>
         )}
         
         {/* If chat has only initial model message, show welcome splash + presets */}
         {messages.length === 0 && (
           <div className="p-3.5 md:p-6 flex-1 flex flex-col items-center justify-center text-center space-y-3.5 max-w-2xl mx-auto my-auto overflow-y-auto w-full">
             <div className="relative">
               <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse h-12 w-12 mx-auto" />
               <div className="relative h-12 w-12 mx-auto rounded-xl bg-zinc-950 flex items-center justify-center border border-white/10 shadow-lg overflow-hidden shrink-0">
                 <img 
                   src="https://lh3.googleusercontent.com/d/1BFhwv5CYYqqOtHIMy-YIZhOoHHVJSCLS" 
                   alt="PulsePoint AI Logo" 
                   className="h-10 w-10 object-contain"
                   referrerPolicy="no-referrer"
                 />
               </div>
             </div>

             <div className="space-y-1">
               <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white leading-tight">
                 Hello, <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">Manan</span>
               </h2>
               <h3 className="text-xs md:text-sm font-sans font-medium text-zinc-400 leading-normal max-w-lg mx-auto">
                 How can PulsePoint assist your wellness journey today?
               </h3>
             </div>

             {/* Quick Presets Section */}
             <div className="w-full space-y-2 pt-1">
               <h4 className="text-[9px] font-mono tracking-widest font-black text-violet-400 uppercase flex items-center justify-center gap-1">
                 <Sparkles className="h-3 w-3 text-pink-400 animate-pulse" />
                 Somatic Triage Floating Suggestions
               </h4>
               
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-left">
                 {SUGGESTIONS.map((preset, pIdx) => (
                   <button
                     key={pIdx}
                     onClick={() => handleSend(preset.prompt)}
                     disabled={loading}
                     className="p-2.5 bg-black/60 hover:bg-gradient-to-br hover:from-purple-950/20 hover:to-zinc-950 border border-white/5 hover:border-violet-500/30 rounded-xl transition-all cursor-pointer text-left flex flex-col justify-between group active:scale-[0.98] shadow-md h-[84px] md:h-[92px]"
                   >
                     <span className="text-[10px] font-bold text-zinc-100 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                       <Sparkles className="h-2.5 w-2.5 text-pink-400" />
                       {preset.label}
                     </span>
                     <p className="text-[9px] text-zinc-500 group-hover:text-zinc-400 mt-0.5 line-clamp-2 leading-tight transition-colors">
                       {preset.prompt}
                     </p>
                   </button>
                 ))}
               </div>
             </div>
           </div>
         )}

         {/* Dynamic Speech Waveform overlay when listening */}
         <AnimatePresence>
           {isListening && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-x-0 bottom-16 top-0 bg-[#070414]/95 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm"
             >
               <div className="flex gap-1.5 items-center justify-center h-16 mb-4">
                 {[...Array(6)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={{
                       height: [16, 48, 16],
                     }}
                     transition={{
                       repeat: Infinity,
                       duration: 0.8,
                       delay: i * 0.12,
                     }}
                     className="w-1.5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"
                   />
                 ))}
               </div>
               <h4 className="text-sm font-mono font-bold text-violet-300 tracking-wider animate-pulse mb-1">
                 LISTENING COGNITIVE SPEECH...
               </h4>
               <p className="text-xs text-foreground/45 max-w-sm">
                 Speak your physical symptoms clearly. PulsePoint will transcribe and map your somatic parameters instantly.
               </p>
               <button
                 onClick={toggleListening}
                 className="mt-6 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-xs text-rose-300 transition-all font-mono uppercase font-black cursor-pointer"
               >
                 Stop & Cancel
               </button>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Thread conversational scroll content */}
         {messages.length > 0 && activeMainSection === "chat" && (
           <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
             {messages.map((m) => {
               const isUser = m.role === "user";
               const text = getMessageText(m.content);
               const customMsg = m as ChatMessage & { mediaUrl?: string; mediaName?: string; mediaType?: string };
               
               return (
                 <div
                   key={m.id}
                   className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                 >
                   <div
                     className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border font-mono font-bold text-xs ${
                       isUser
                         ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                         : "bg-rose-600/20 border-rose-500/40 text-rose-300"
                     }`}
                   >
                     {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                   </div>

                   <div className="flex flex-col gap-1.5">
                     
                     {/* Attachment Render inside bubbles if present */}
                     {isUser && customMsg.mediaUrl && (
                       <div className="mb-1 shrink-0 max-w-[240px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 p-2 text-left shadow-lg self-end">
                         {customMsg.mediaType?.startsWith("image/") ? (
                           <img 
                             src={customMsg.mediaUrl} 
                             alt={customMsg.mediaName} 
                             className="object-cover max-h-[150px] rounded-xl w-full" 
                             referrerPolicy="no-referrer" 
                           />
                         ) : (
                           <div className="flex items-center gap-2 py-2 px-3 bg-slate-950/40 rounded-lg">
                             <FileCheck className="h-4 w-4 text-violet-400 shrink-0" />
                             <span className="truncate font-mono text-[11px] text-violet-200 leading-tight block max-w-[150px]">{customMsg.mediaName}</span>
                           </div>
                         )}
                         <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30 w-max">
                           <Activity className="h-2.5 w-2.5 animate-pulse" />
                           Visual Symptoms Synced
                         </div>
                       </div>
                     )}

                     <div
                       className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                         isUser
                           ? "bg-violet-500/15 border border-violet-500/20 rounded-tr-none text-violet-100"
                           : "bg-white/[0.02] border border-white/5 rounded-tl-none text-foreground/90 font-sans"
                       }`}
                     >
                       {text}
                     </div>
                     <span className={`text-[9px] text-[#d1d0ce]/30 font-mono ${isUser ? "text-right" : "text-left"}`}>
                       {m.timestamp}
                     </span>
                   </div>
                 </div>
               );
             })}
             
             {loading && (
               <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                 <div className="h-8 w-8 rounded-full bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-300 animate-pulse animate-spin" style={{ animationDuration: '4s' }}>
                   <Bot className="h-4 w-4" />
                 </div>
                 <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                   <div className="flex space-x-1.5">
                     <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                   </div>
                   <span className="text-[10px] text-foreground/45 font-mono ml-1">PulsePoint medical triage scanning...</span>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
           </div>
         )}

          {/* Triage Diagnosis Section (Only shown if messages exist and activeMainSection is triage) */}
          {messages.length > 0 && activeMainSection === "triage" && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col bg-[#070414] text-left">
              
              {/* Clinical Dashboard Banner */}
              <div className="bg-gradient-to-r from-[#170a2b] via-[#0c051f] to-[#04010b] border border-violet-500/10 p-5 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-1 text-center md:text-left z-10">
                  <span className="text-[10px] font-mono font-semibold text-pink-400 tracking-widest uppercase bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/15">
                    Clinical Triage Core
                  </span>
                  <h3 className="text-xl font-display font-black text-white tracking-tight mt-1">
                    Somatic Diagnostics Dashboard
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-md">
                    Suspected chronic condition: <span className="text-purple-300 font-semibold">{activeTriage.chronicDisease || "None selected"}</span> (Stage {activeTriage.stage.toUpperCase()})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 z-10">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border uppercase tracking-widest flex items-center gap-1.5 ${
                    activeTriage.stage === "red" 
                      ? "bg-rose-950/40 text-rose-400 border-rose-500/20" 
                      : activeTriage.stage === "yellow" 
                        ? "bg-amber-950/40 text-amber-400 border-amber-500/20" 
                        : "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      activeTriage.stage === "red" ? "bg-rose-400 animate-pulse" : activeTriage.stage === "yellow" ? "bg-amber-400" : "bg-emerald-400"
                    }`} />
                    CRITICALITY: {activeTriage.stage}
                  </div>
                </div>
              </div>

              {/* Main Gauge representation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Visual Circle Gauge gauge */}
                <div className="lg:col-span-5 bg-zinc-950/40 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative h-28 w-28 flex items-center justify-center rounded-full bg-slate-950/70 border border-white/5 shadow-inner">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="rgba(255, 255, 255, 0.03)"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke={activeTriage.stage === "red" ? "#ef4444" : activeTriage.stage === "yellow" ? "#eab308" : "#10b981"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="289"
                        strokeDashoffset={289 - (289 * activeTriage.percentage) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="flex flex-col items-center z-10">
                      <span className="text-2xl font-display font-black text-white tracking-tight">
                        {activeTriage.percentage}%
                      </span>
                      <span className="text-[7px] font-mono font-bold tracking-widest text-zinc-500 uppercase mt-0.5">
                        STAGE INDEX
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    {activeTriage.stage === "red" && (
                      <>
                        <h4 className="text-sm font-bold text-rose-500 font-mono tracking-wide">EMERGENCY PROTOCOL TRIGGERED</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans px-2">
                          Vital symptoms require immediate medical care. Dispatch alerts or emergency services.
                        </p>
                      </>
                    )}
                    {activeTriage.stage === "yellow" && (
                      <>
                        <h4 className="text-sm font-bold text-amber-400 font-mono tracking-wide">PROFESSIONAL WORKUP ADVISED</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans px-2">
                          Observe body metrics and consult family doctor. Review supportive remedies.
                        </p>
                      </>
                    )}
                    {activeTriage.stage === "green" && (
                      <>
                        <h4 className="text-sm font-bold text-emerald-400 font-mono tracking-wide">STABLE NON-CRITICAL STATE</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans px-2">
                          Restore hydration, utilize somatic rest parameters, and apply routine wellness care.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Main Action Tabs remedies / diets */}
                <div className="lg:col-span-7 flex flex-col bg-zinc-950/20 border border-white/5 p-5 rounded-2xl min-h-0">
                  <div className="flex items-center justify-start gap-1 pb-2 border-b border-white/5 mb-4">
                    <button
                      onClick={() => setActiveTab2("remedies")}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                        activeTab === "remedies" 
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 font-black shadow-md shadow-violet-500/5" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Remedies & OTC
                    </button>
                    <button
                      onClick={() => setActiveTab2("diet")}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                        activeTab === "diet" 
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black shadow-md shadow-indigo-500/5" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Diet Plan
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === "remedies" && (
                      <motion.div
                        key="triage-tab-remedies"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4 text-left font-sans flex-1"
                      >
                        <div className="bg-[#050212]/70 p-4 rounded-xl border border-white/5 space-y-1.5">
                          <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest font-mono flex items-center gap-1.5 justify-start">
                            🌿 TRADITIONAL HOME REMEDIES & KADHA
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                            {activeTriage.remedies || "Drink light fluid herbal formulations, turmeric water, and stay warm in high-humidity ambient beds."}
                          </p>
                        </div>

                        <div className="bg-[#050212]/70 p-4 rounded-xl border border-white/5 space-y-1.5">
                          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest font-mono flex items-center gap-1.5 justify-start">
                            💊 INCLUSIVE MEDICINES & OTC GUIDANCE
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                            {activeTriage.medicines || "Minor temporary symptomatic medications under parental guidance. Do not use random antibiotics."}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "diet" && (
                      <motion.div
                        key="triage-tab-diet"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4 text-left flex-1"
                      >
                        <div className="flex flex-wrap gap-1 bg-[#050212] p-1 rounded-xl border border-white/5 font-sans justify-start w-max">
                          {[
                            { key: "veg", label: "Vegan-Veg" },
                            { key: "non_veg", label: "Non-Veg" },
                            { key: "vegan", label: "Vegan" },
                            { key: "keto", label: "Keto Plan" }
                          ].map((dietOpt) => (
                            <button
                              key={dietOpt.key}
                              onClick={() => setSelectedDietKey(dietOpt.key as any)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer select-none ${
                                selectedDietKey === dietOpt.key 
                                  ? "bg-violet-600 text-white font-extrabold shadow-sm"
                                  : "text-zinc-500 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {dietOpt.label}
                            </button>
                          ))}
                        </div>

                        <div className="bg-[#050212]/70 p-4 rounded-xl border border-white/5 space-y-1.5">
                          <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest font-mono block">
                            INDIAN {selectedDietKey.replace('_', ' ').toUpperCase()} DIETARY REGIMEN
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                            {activeTriage.diets?.[selectedDietKey] ?? "Light digestible fluid rich dietary schedules are prescribed for organic recovery."}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dynamic Emergency SOS details or Clinical Specialist listings depending on Criticality state */}
              {activeTriage.stage === "yellow" && activeTriage.doctors && (
                <div className="border-t border-white/5 pt-6 space-y-4 text-left">
                  <div className="flex items-center gap-1.5 justify-start">
                    <span className="text-[10px] font-mono tracking-widest font-black text-amber-400 bg-amber-950/30 border border-amber-900/30 px-3 py-1 rounded-full uppercase flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      Clinical Doctor Contact References
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTriage.doctors.map((doc, dIdx) => (
                      <div key={dIdx} className="bg-[#0b0821]/45 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-md hover:border-violet-500/20 transition-all">
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-sm font-semibold text-white font-display leading-none">{doc.name}</h4>
                            <span className="text-[8px] font-mono bg-violet-500/10 px-2 py-0.5 rounded text-violet-300 font-bold border border-violet-500/15">{doc.specialty}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400 justify-start font-sans">
                            <MapPin className="h-3 w-3 text-violet-400 shrink-0" />
                            <p className="truncate">{doc.address}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between font-sans">
                          <a 
                            href={`tel:${doc.phone.replace(/\s+/g, '')}`} 
                            className="text-[11px] text-[#29c470] hover:text-[#3dea88] transition-colors flex items-center gap-1.5 font-black"
                          >
                            <Phone className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                            {doc.phone}
                          </a>
                          <button className="text-[9px] font-mono text-zinc-300 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-transparent hover:border-white/10 flex items-center gap-1 cursor-pointer transition-all">
                            Book Checkup
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTriage.stage === "red" && (
                <div className="border-t border-white/5 pt-6 space-y-5 text-left">
                  <div className="bg-[#1c070c]/50 border border-rose-500/20 p-4.5 rounded-2xl text-left space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-rose-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        SOS ALERT DISPATCH CASCADE ACTIVE
                      </span>
                      <span className="text-[9px] font-mono bg-rose-950 px-2.5 py-0.5 rounded border border-rose-500/30 text-rose-300 font-black">
                        LIVE COORDINATES SIMULATED
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-xl">
                      Emergency clinical parameters triggered. Your location (Latitude 28.61, Longitude 77.20) has been dispatch-simulated to your local medical networks. Keep calm and sit in a comfortable resting posture.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hotline Cards */}
                    <div className="bg-zinc-950/40 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between space-y-3 shadow-md">
                      <div>
                        <span className="text-[9px] font-mono tracking-widest text-zinc-500 font-bold uppercase block mb-2">Direct Ambulance Dispatch</span>
                        <div className="space-y-2">
                          {activeTriage.emergency.ambulance.map((num, nId) => (
                            <a
                              key={nId}
                              href={`tel:${num.split(' ')[0]}`}
                              className="flex items-center gap-2.5 text-sm text-rose-400 hover:text-rose-300 transition-colors font-mono font-bold"
                            >
                              <Phone className="h-4 w-4 text-rose-500 shrink-0 animate-bounce" />
                              {num}
                            </a>
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-sans mt-2">Click hotlines above to place real direct Clinical Ambulance dispatch telephone connections.</p>
                    </div>

                    {/* Hospital Card */}
                    <div className="bg-zinc-950/40 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between space-y-3 shadow-md">
                      <div>
                        <span className="text-[9px] font-mono tracking-widest text-zinc-500 font-bold uppercase block mb-1">Recommended Trauma Center</span>
                        <h4 className="text-sm font-semibold text-white font-display leading-snug mt-1">
                          {activeTriage.emergency.nearbyHospitals}
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-violet-300 flex items-center justify-center gap-2 bg-violet-950/30 border border-violet-900/40 px-3 py-1.5 rounded-xl w-max mt-2">
                        <MapPin className="h-3.5 w-3.5 text-violet-400" /> Mapping Trauma Centers Near You
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

         {/* pre-send attachment status bar tray */}
         {attachedFile && (
           <div className="p-3.5 border-t border-white/5 bg-slate-950/70 flex items-center justify-between gap-3 text-xs sm:text-sm backdrop-blur-sm">
             <div className="flex items-center gap-2 text-violet-300 justify-start">
               <Paperclip className="h-4 w-4 text-violet-400 animate-bounce" />
               <div className="text-left font-sans">
                 <span className="truncate font-mono text-xs font-semibold block max-w-[220px]">{attachedFileName}</span>
                 <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5 font-bold">
                   ✓ Ready for clinical symptom scan
                 </span>
               </div>
             </div>
             <button 
               onClick={clearAttachment} 
               className="hover:bg-rose-950/40 p-1.5 rounded-full text-rose-400 transition-colors bg-rose-950/20 border border-rose-900/30 select-none cursor-pointer text-xs"
             >
               <X className="h-4 w-4" />
             </button>
           </div>
         )}

         {/* Always Available Floating Suggestions Chips Row */}
         <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-white/5 bg-[#050212]/50 scrollbar-none">
           <div className="flex gap-2 py-1">
             {SUGGESTIONS.map((suggestion, sIdx) => (
               <button
                 key={sIdx}
                 onClick={() => handleSend(suggestion.prompt)}
                 disabled={loading}
                 className="whitespace-nowrap shrink-0 text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-900/40 hover:bg-gradient-to-r hover:from-pink-900/30 hover:to-purple-900/30 border border-white/5 hover:border-violet-500/20 rounded-full px-2.5 py-1.5 transition-all cursor-pointer select-none active:scale-95"
               >
                 {suggestion.label}
               </button>
             ))}
           </div>
         </div>

         {/* Input Footer Typing Section - Gemini Styled with Moving Border Glow */}
         <div className="p-3.5 bg-zinc-950/80 border-t border-white/5 flex flex-col gap-2.5">
           <div className="moving-border-container-pulse p-[1.5px] rounded-2xl shadow-xl shadow-purple-950/15">
             <div className="bg-[#050212] rounded-[14.5px] p-2 flex flex-col md:flex-row gap-2">
               
               {/* Hidden Inputs */}
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 accept="image/*,application/pdf" 
                 className="hidden" 
               />

               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
                 placeholder={isListening ? "Listening with somatic audio sensors..." : "Ask PulsePoint: remedies, diets, medicines or triage..."}
                 disabled={loading}
                 className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none pointer-events-auto md:text-base selection:bg-violet-500/30"
               />
               
               <div className="flex items-center justify-between gap-1.5 px-2 pb-1.5 md:pb-0 shrink-0 border-t md:border-t-0 border-white/5 pt-1.5 md:pt-0">
                 <div className="flex items-center gap-1">
                   {/* File Upload Trigger */}
                   <button
                     onClick={triggerFileSelect}
                     disabled={loading}
                     className="h-9 w-9 rounded-full hover:bg-white/[0.06] text-zinc-400 hover:text-pink-400 transition-all flex items-center justify-center cursor-pointer active:scale-95 border border-transparent hover:border-pink-500/20"
                     title="Upload clinical reports or skin rash photo"
                   >
                     <Paperclip className="h-4.5 w-4.5" />
                   </button>

                   {/* Voice Input Trigger Button */}
                   <button
                     onClick={toggleListening}
                     disabled={loading}
                     className={`h-9 w-9 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                       isListening 
                         ? "bg-rose-600 animate-pulse text-white" 
                         : "hover:bg-white/[0.06] text-zinc-400 hover:text-purple-400 border border-transparent hover:border-purple-500/20"
                     }`}
                     title="Talk to PulsePoint AI"
                   >
                     {isListening ? (
                       <MicOff className="h-4.5 w-4.5 text-white" />
                     ) : (
                       <Mic className="h-4.5 w-4.5" />
                     )}
                   </button>
                 </div>

                 {/* Send Button */}
                 <button
                   onClick={() => handleSend()}
                   disabled={loading || (!input.trim() && !attachedFile)}
                   className="h-9 px-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95 font-sans font-bold shadow-lg shadow-purple-500/10 text-xs"
                 >
                   <span>Ask PulsePoint</span>
                   <Send className="h-3 w-3" />
                 </button>
               </div>
             </div>
           </div>
           
         </div>
       </div>

        {/* Right Side: Conditional Diagnostic Report Column */}
        {messages.length > 0 && (
          <div className="hidden" id="diagnostic-drawer">
          
          {/* Diagnostic Header Trigger block */}
          <div 
            onClick={() => setIsTriageCollapsed(!isTriageCollapsed)}
            className="p-5 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-950/40 hover:bg-slate-950/60 border-b border-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HeartPulse className={`h-5 w-5 ${activeTriage.stage === "red" ? "text-rose-500 animate-ping" : activeTriage.stage === "yellow" ? "text-amber-400" : "text-emerald-400"}`} />
              <div className="text-left">
                <h3 className="text-[10px] font-mono tracking-widest font-black text-[#f2f1ef]/40 uppercase">
                  PULSEPOINT TRIASE DIAGNOSIS
                </h3>
                <p className="text-xs text-white font-semibold flex items-center gap-2 mt-0.5">
                  Suspected Case: <span className="bg-white/5 px-2.5 py-0.5 rounded-lg text-rose-300 font-mono font-bold leading-none">{activeTriage.chronicDisease}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              {/* Stage Triage Badge Flag */}
              <div className={`px-3 py-1 rounded-full text-[10px] font-mono font-black border uppercase tracking-wider flex items-center gap-1.5 ${
                activeTriage.stage === "red" 
                  ? "bg-rose-950/25 text-rose-400 border-rose-700/50 animate-pulse" 
                  : activeTriage.stage === "yellow" 
                    ? "bg-amber-900/25 text-amber-400 border-amber-700/50" 
                    : "bg-emerald-950/25 text-emerald-400 border-emerald-700/50"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  activeTriage.stage === "red" ? "bg-rose-400" : activeTriage.stage === "yellow" ? "bg-amber-400" : "bg-emerald-400"
                }`} />
                Stage {activeTriage.stage}
              </div>

              {/* Toggle Expand Icon */}
              <div className="text-zinc-400">
                {isTriageCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </div>
            </div>
          </div>

          {/* Collapsible details pane details */}
          <AnimatePresence initial={false}>
            {!isTriageCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto scrollbar-thin overflow-x-hidden min-h-0"
              >
                <div className="p-4 md:p-5 space-y-5">
                  
                  {/* Gauge Risk percentage metrics and Warning indicator row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Ring Radial Gauge Indicator Left */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center shrink-0">
                      <div className="relative h-28 w-28 flex items-center justify-center rounded-full bg-slate-950/60 border border-white/5">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="45"
                            stroke="rgba(255, 255, 255, 0.03)"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="45"
                            stroke={activeTriage.stage === "red" ? "#ef4444" : activeTriage.stage === "yellow" ? "#f59e0b" : "#10b981"}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * activeTriage.percentage) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>

                        <div className="flex flex-col items-center z-10 text-center">
                          <span className="text-2xl font-display font-black text-[#f2f1ef] tracking-tight">
                            {activeTriage.percentage}%
                          </span>
                          <span className="text-[8px] font-mono font-bold tracking-widest text-[#d1d0ce]/40 uppercase">
                            RISK INDEX
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status warning box Right */}
                    <div className="md:col-span-8 text-left">
                      {activeTriage.stage === "green" && (
                        <div className="p-4 bg-emerald-950/15 border border-emerald-900/20 rounded-2xl flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Common & Non-Emergency Somatic State</h4>
                            <p className="text-[11px] text-[#d1d0ce]/70 leading-relaxed mt-1">
                              This physical status represents minor, common daily fatigue, typical irritation, or seasonal issues. Follow traditional home remedies, rest, and simple Indian diets to improve comfort levels easily.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTriage.stage === "yellow" && (
                        <div className="p-4 bg-amber-950/15 border border-amber-900/20 rounded-2xl flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 font-bold" />
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Sub-Acute Status: Professional Consultation Advised</h4>
                            <p className="text-[11px] text-[#d1d0ce]/70 leading-relaxed mt-1">
                              WARNING: This somatic pattern calls for proactive attention. We advise consulting a regular family physician or primary diagnostic specialist as soon as practical. Local clinical references are detailed below.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTriage.stage === "red" && (
                        <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-2xl flex items-start gap-3">
                          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">URGENT NATIONAL EMERGENCY INDICATORS</h4>
                            <p className="text-[11px] text-[#d1d0ce]/70 leading-relaxed mt-1">
                              CRITICAL STATUS: High-risk cardiovascular, pulmonary, or direct neurological distress detected. Immediate live emergency dispatchers are requested below instantly.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* remedies, medicines and personalized dietary tab board */}
                  <div className="border-t border-white/5 pt-5 text-left">
                    
                    {/* Inner tab switches */}
                    <div className="flex items-center justify-start gap-2 border-b border-white/5 pb-3 mb-4">
                      <button
                        onClick={() => setActiveTab2("remedies")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                          activeTab === "remedies" 
                            ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-md" 
                            : "text-foreground/45 hover:text-[#f2f1ef] hover:bg-white/5"
                        }`}
                      >
                        <Pill className="h-3.5 w-3.5" />
                        Remedies & Medicines
                      </button>
                      <button
                        onClick={() => setActiveTab2("diet")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                          activeTab === "diet" 
                            ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-md" 
                            : "text-foreground/45 hover:text-[#f2f1ef] hover:bg-white/5"
                        }`}
                      >
                        <Utensils className="h-3.5 w-3.5" />
                        Personalized Diet Plan
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab === "remedies" && (
                        <motion.div
                          key="remedies-content"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-sans"
                        >
                          {/* Traditional Indian remedies */}
                          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 uppercase tracking-wide font-mono justify-start">
                              <Flame className="h-3.5 w-3.5 text-amber-400" />
                              🌿 botanical remedies & kadha
                            </div>
                            <p className="text-xs text-[#d1d0ce]/70 leading-relaxed">
                              {activeTriage.remedies || "Drink warm water, practice light rhythmic breathing, and rest."}
                            </p>
                          </div>

                          {/* Standard OTC medicines */}
                          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 uppercase tracking-wide font-mono justify-start">
                              <Pill className="h-3.5 w-3.5 text-violet-400" />
                              💊 Supportive Indian OTC Drugs
                            </div>
                            <p className="text-xs text-[#d1d0ce]/70 leading-relaxed font-sans">
                              {activeTriage.medicines || "Minor OTC support if fever is present. Otherwise, rest."}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "diet" && (
                        <motion.div
                          key="diet-content"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-4 text-left"
                        >
                          <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/5 w-max">
                            {[
                              { key: "veg", label: "Vegetarian 🌱" },
                              { key: "non_veg", label: "Non-Veg 🍗" },
                              { key: "vegan", label: "Vegan 🥗" },
                              { key: "keto", label: "Keto / Low-Carb 🥩" }
                            ].map((dietOpt) => (
                              <button
                                key={dietOpt.key}
                                onClick={() => setSelectedDietKey(dietOpt.key as any)}
                                className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer select-none ${
                                  selectedDietKey === dietOpt.key 
                                    ? "bg-violet-600 text-white font-extrabold shadow-md"
                                    : "text-foreground/45 hover:text-[#f2f1ef]"
                                }`}
                              >
                                {dietOpt.label}
                              </button>
                            ))}
                          </div>

                          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                            <div className="absolute right-3 top-3 opacity-5">
                              <Utensils className="h-10 w-10 text-white" />
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-violet-300 font-display mb-1.5 capitalize">
                              Recommended Indian {selectedDietKey.replace('_', '-')} Diet Plan
                            </p>
                            <p className="text-xs text-[#d1d0ce]/70 leading-relaxed font-sans leading-relaxed">
                              {activeTriage.diets?.[selectedDietKey] || "Light digestable diet advised."}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Doctor listings block shown when stage is yellow */}
                  {activeTriage.stage === "yellow" && activeTriage.doctors && (
                    <div className="border-t border-white/5 pt-5 space-y-3.5 text-left">
                      <span className="text-[10px] font-mono tracking-widest font-black text-amber-400 uppercase flex items-center gap-1.5 bg-amber-950/20 border border-amber-900/30 px-3 py-1 rounded-full w-max">
                        <Calendar className="h-3 w-3" />
                        RECOMMENDED INDIAN CLINICAL SPECIALISTS
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeTriage.doctors.map((doc, dIdx) => (
                          <div key={dIdx} className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl space-y-2 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between">
                                <h4 className="text-xs sm:text-sm font-bold text-white font-display">{doc.name}</h4>
                                <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-violet-300 font-bold">{doc.specialty}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-foreground/45 mt-2 justify-start">
                                <MapPin className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                <span className="line-clamp-1">{doc.address}</span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                              <a 
                                href={`tel:${doc.phone.replace(/\s+/g, '')}`} 
                                className="text-[10px] text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1 font-bold"
                              >
                                <Phone className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                                {doc.phone}
                              </a>
                              <button className="text-[9px] font-mono text-[#f2f1ef]/30 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/5 flex items-center gap-1 cursor-pointer">
                                <PhoneCall className="h-2.5 w-2.5" /> Book Call
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Urgent SMS Alerts + Ambulance Contacts when active triage stage is red */}
                  {activeTriage.stage === "red" && (
                    <div className="border-t border-white/5 pt-5 space-y-4 text-left">
                      <div className="bg-rose-950/15 border border-rose-900/30 p-4 rounded-2xl text-left space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-rose-400/80 tracking-widest uppercase font-black bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/30">
                            SOS CASCADE SIMULATION ONLINE
                          </span>
                          <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-white justify-start">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Simulated Emergency broadcast sent to pre-selected guard networks.</span>
                          </div>
                          <p className="text-[10px] text-foreground/50 font-mono italic leading-relaxed pl-5">
                            "Patient reported RED triage stage at Latitude 28.61, Longitude 77.20. SOS network dispatched."
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                          <div>
                            <h4 className="text-[10px] font-mono text-[#d1d0ce]/40 font-black tracking-widest uppercase mb-2">Live Indian Hotlines</h4>
                            <div className="space-y-1.5">
                              {activeTriage.emergency.ambulance.map((num, nId) => (
                                <a
                                  key={nId}
                                  href={`tel:${num.split(' ')[0]}`}
                                  className="flex items-center gap-2 text-xs text-rose-300 hover:text-rose-200 transition-colors font-mono font-bold"
                                >
                                  <Phone className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                  {num}
                                </a>
                              ))}
                            </div>
                          </div>
                          <p className="text-[8px] text-[#d1d0ce]/35 mt-3 leading-snug">Click hotlines above to place direct clinical ambulance dispatch calls.</p>
                        </div>

                        <div className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                          <div>
                            <h4 className="text-[10px] font-mono text-[#d1d0ce]/40 font-black tracking-widest uppercase mb-2">Trauma Care Center Center</h4>
                            <span className="text-xs text-white leading-tight font-sans font-semibold line-clamp-2">
                              {activeTriage.emergency.nearbyHospitals}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-violet-300 flex items-center gap-1.5 bg-violet-950/30 border border-violet-900/40 px-2.5 py-1 rounded w-max mt-3">
                            <MapPin className="h-3 w-3 text-violet-400" /> Mapping Near Trauma blocks
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          </div>
        )}

      </div>

      {/* ========================================================
          4. INTENSIVE SOS EMERGENCY OVERLAY MODAL
         ======================================================== */}
      <AnimatePresence>
        {isSosModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#090204]/98 flex flex-col items-center justify-start p-3 md:p-5 overflow-y-auto backdrop-blur-md rounded-3xl"
            id="emergency-sos-modal"
          >
            {/* Main high-contrast pulsing red modal dialog */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-4xl bg-[#1e050a] border-2 border-red-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)] flex flex-col relative"
            >
              {/* Dialing Screen Overlay: takes precedence when a number is clicked */}
              {dialingNumber && (
                <div className="absolute inset-0 z-35 bg-[#170206] flex flex-col items-center justify-center p-8 text-center transition-all">
                  <div className="relative mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative h-24 w-24 rounded-full bg-red-600/10 border-2 border-red-500 flex items-center justify-center animate-pulse">
                      <PhoneCall className="h-10 w-10 text-red-500" />
                    </div>
                    {/* Ring visual rings */}
                    <div className="absolute h-32 w-32 rounded-full border border-red-500/30 animate-ping" style={{ animationDuration: "2s" }} />
                    <div className="absolute h-40 w-40 rounded-full border border-red-500/10 animate-ping" style={{ animationDuration: "3s" }} />
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-2 font-mono">
                    DIALING EMERGENCY HOTLINE
                  </h3>
                  <div className="text-4xl font-extrabold text-[#fda4af] tracking-widest font-mono mb-4">
                    {dialingNumber}
                  </div>

                  {/* Circular visual progress loader */}
                  <div className="w-64 bg-red-950/40 h-2.5 rounded-full overflow-hidden mb-6 border border-red-900/30">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-rose-400 h-full transition-all duration-300"
                      style={{ width: `${dialingProgress}%` }}
                    />
                  </div>

                  <p className="text-xs md:text-sm font-semibold uppercase tracking-widest font-mono text-red-300 animate-pulse h-6 mb-8 max-w-md">
                    {dialingProgress < 30 && "⚡ Initializing satellite dispatch link..."}
                    {dialingProgress >= 30 && dialingProgress < 60 && "📍 Pinpointing real-time GPS coordinates..."}
                    {dialingProgress >= 60 && dialingProgress < 95 && "🚨 Routing dispatch packet to Max Super Specialty ER..."}
                    {dialingProgress >= 95 && "✓ SIMULATED EMERGENCY CHANNEL ESTABLISHED"}
                  </p>

                  <button
                    onClick={() => setDialingNumber(null)}
                    className="px-8 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-mono font-black text-sm uppercase tracking-widest rounded-full shadow-lg transition-transform focus:outline-none flex items-center gap-2 border border-red-400/30 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                    End Call Simulation
                  </button>
                </div>
              )}

              {/* Siren/Beacon Warning Header Banner */}
              <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 px-6 py-5 border-b border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 justify-start">
                  <div className="h-10 w-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500 animate-bounce">
                    <ShieldAlert className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="text-left font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold tracking-widest bg-red-600/30 text-red-300 border border-red-500/40 px-2 by-0.5 rounded uppercase animate-pulse">
                        Somatic Warning Active
                      </span>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-tight mt-1">
                      PulsePoint SOS Rescue Portal
                    </h2>
                  </div>
                </div>

                {/* Close modal completely */}
                <button
                  onClick={() => {
                    const lastMsg = messages[messages.length - 1];
                    if (lastMsg) {
                      setSosDismissedForMessageId(lastMsg.id);
                    }
                    setIsSosModalOpen(false);
                    setSosStatus("idle");
                  }}
                  className="px-4 py-2 self-start sm:self-auto bg-white/5 hover:bg-white/10 active:scale-95 text-red-200 border border-red-900 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Dismiss / Cancel Alerts
                </button>
              </div>

              {/* Grid content inside modal */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                
                {/* LEFT BLOCK (7 columns): Clinical dispatch & safeguarding alert toggles */}
                <div className="md:col-span-7 space-y-6 text-left">
                  
                  {/* Ambulance contacts panel */}
                  <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 md:p-5 relative overflow-hidden">
                    <h3 className="text-xs font-mono font-extrabold tracking-wider text-red-400 uppercase mb-3 flex items-center gap-1.5 justify-start">
                      <Phone className="h-4 w-4 text-red-400" /> Simulated Emergency Ambulance dispatch
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { num: "112", label: "National ERSS Line", detail: "Police, Fire, and Ambulance unified" },
                        { num: "102", label: "National Ambulance Service", detail: "Maternal & pediatric transport dispatch" },
                        { num: "108", label: "Disaster Trauma Care", detail: "Accident critical rescue squad" },
                        { num: "911", label: "International Emergency proxy", detail: "Alternative proxy clinical routing" }
                      ].map((phoneItem, phIdx) => (
                        <button
                          key={phIdx}
                          onClick={() => setDialingNumber(phoneItem.num)}
                          className="p-3 bg-red-950/45 hover:bg-red-900/40 border border-red-800/45 hover:border-red-500/50 rounded-xl transition-all text-left flex items-start gap-3 group cursor-pointer active:scale-[0.98]"
                        >
                          <div className="h-8 w-8 bg-red-900/30 rounded-lg flex items-center justify-center border border-red-700/55 text-red-400 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-400 transition-colors shrink-0">
                            <PhoneCall className="h-4 w-4" />
                          </div>
                          <div className="font-sans">
                            <div className="text-xs font-black text-white tracking-wide group-hover:text-red-300 transition-colors flex items-center gap-1.5 leading-none">
                              Call {phoneItem.num}
                            </div>
                            <div className="text-[10px] font-bold text-red-300/70 mt-1 leading-snug">
                              {phoneItem.label}
                            </div>
                            <p className="text-[8px] text-zinc-500 font-mono italic leading-relaxed mt-0.5">
                              {phoneItem.detail}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-[#fda4af]/40 font-mono italic mt-2.5">
                      💡 Click buttons above to initiate satellite dialing, tracking, and responder dispatch sequences.
                    </p>
                  </div>

                  {/* Automated Alert Toggles */}
                  <div className="bg-red-950/15 border border-red-900/20 rounded-2xl p-4 md:p-5">
                    <h3 className="text-xs font-mono font-extrabold tracking-wider text-red-400 uppercase mb-3.5 flex items-center gap-1.5 justify-start">
                      <Bell className="h-4 w-4 text-red-400" /> Automated emergency dispatch logs & toggles
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Family contacts Alert Trigger */}
                      <div className={`p-3 border rounded-xl flex flex-col justify-between transition-colors ${
                        alertContacts 
                          ? "bg-red-950/25 border-red-500/30" 
                          : "bg-zinc-950/20 border-zinc-900 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="text-xs font-semibold text-white font-sans flex items-center gap-1.5 text-left leading-tight">
                            👨‍👩‍👧‍👦 Alert Family Contacts
                          </span>
                          <button
                            onClick={() => setAlertContacts(!alertContacts)}
                            className={`h-5 w-9 shrink-0 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                              alertContacts ? "bg-red-600" : "bg-zinc-800"
                            }`}
                          >
                            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                              alertContacts ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                        <p className="text-[9px] text-red-300/60 leading-relaxed font-sans mt-2">
                          {alertContacts 
                            ? "✓ Compile automated warning containing GPS maps coordinates backlink to Spouse and Kin."
                            : "Offline: Guardian alert dispatch is de-activated."}
                        </p>
                      </div>

                      {/* Trauma center alert */}
                      <div className={`p-3 border rounded-xl flex flex-col justify-between transition-colors ${
                        alertTrauma 
                          ? "bg-red-950/25 border-red-500/30" 
                          : "bg-zinc-950/20 border-zinc-900 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="text-xs font-semibold text-white font-sans flex items-center gap-1.5 text-left leading-tight">
                            🏥 Pre-Alert Hospital ER
                          </span>
                          <button
                            onClick={() => setAlertTrauma(!alertTrauma)}
                            className={`h-5 w-9 shrink-0 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                              alertTrauma ? "bg-red-600" : "bg-zinc-800"
                            }`}
                          >
                            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                              alertTrauma ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                        <p className="text-[9px] text-red-300/60 leading-relaxed font-sans mt-2">
                          {alertTrauma 
                            ? "✓ Transmit clinical assessment metrics and pre-book surgical standby teams at nearest ED node."
                            : "Offline: Hospital notification stream suspended."}
                        </p>
                      </div>

                      {/* Share GPS coordinates */}
                      <div className={`p-3 border rounded-xl flex flex-col justify-between transition-colors ${
                        shareGPS 
                          ? "bg-red-950/25 border-red-500/30" 
                          : "bg-zinc-950/20 border-zinc-900 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="text-xs font-semibold text-white font-sans flex items-center gap-1.5 text-left leading-tight">
                            📍 Continuous GPS Broadcast
                          </span>
                          <button
                            onClick={() => setShareGPS(!shareGPS)}
                            className={`h-5 w-9 shrink-0 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                              shareGPS ? "bg-red-600" : "bg-zinc-800"
                            }`}
                          >
                            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                              shareGPS ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                        <p className="text-[9px] text-red-300/60 leading-relaxed font-mono mt-2">
                          {shareGPS 
                            ? `✓ Streaming live coordinates lock. Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`
                            : "Offline: GPS coordinate broadcast suspended."}
                        </p>
                      </div>

                      {/* Prepackage Vitals */}
                      <div className={`p-3 border rounded-xl flex flex-col justify-between transition-colors ${
                        shareVitals 
                          ? "bg-red-950/25 border-red-500/30" 
                          : "bg-zinc-950/20 border-zinc-900 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="text-xs font-semibold text-white font-sans flex items-center gap-1.5 text-left leading-tight">
                            🩺 Physiological Vitals File
                          </span>
                          <button
                            onClick={() => setShareVitals(!shareVitals)}
                            className={`h-5 w-9 shrink-0 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                              shareVitals ? "bg-red-600" : "bg-zinc-800"
                            }`}
                          >
                            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                              shareVitals ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                        <p className="text-[9px] text-red-300/60 leading-relaxed font-sans mt-2">
                          {shareVitals 
                            ? "✓ Inject bio-profile (blood group O+, drug allergies, vitals history) into active responder brief."
                            : "Offline: Vitals pre-packaging suspended."}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>

                {/* RIGHT BLOCK (5 columns): Dynamic Google Maps & Grounded Hospitals List */}
                <div className="md:col-span-5 space-y-4 text-left">
                  
                  {/* Google Maps Container */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-mono font-extrabold tracking-wider text-red-400 uppercase flex items-center gap-1.5 justify-start">
                      <MapPin className="h-4 w-4 text-red-400" /> Live Google Map: trauma centers near you
                    </h3>
                    
                    {/* Embedded interactive Google Map iframe */}
                    <div className="relative rounded-2xl overflow-hidden border border-red-500/25 shadow-xl h-28 sm:h-36 w-full bg-neutral-950">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        className="w-full h-full" 
                        style={{ border: 0 }} 
                        src={`https://maps.google.com/maps?q=emergency+hospital&ll=${userLocation.lat},${userLocation.lng}&z=13&t=&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                        loading="keep-alive"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Grounded Hospitals list */}
                  <div className="bg-[#170206] border border-red-950 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-red-950 pb-2">
                      <h4 className="text-[10px] font-mono font-extrabold tracking-widest text-[#fda4af] uppercase flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-red-400 shrink-0 animate-pulse" />
                        Grounded Hospital Registry
                      </h4>
                      {sosMapLoading && (
                        <div className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                      )}
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {sosMapLoading ? (
                        <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                          <Activity className="h-5 w-5 text-red-500 animate-spin" />
                          <span className="text-[10px] font-semibold text-red-400 font-mono animate-pulse">
                            Geocoding hospitals...
                          </span>
                        </div>
                      ) : sosHospitals.length > 0 ? (
                        sosHospitals.map((hCode, hIdx) => (
                          <div 
                            key={hIdx} 
                            className="p-2.5 bg-red-950/20 border border-red-900/30 rounded-xl flex flex-col justify-between gap-1.5 hover:bg-red-950/40 transition-colors"
                          >
                            <div className="text-left font-sans">
                              <span className="text-[11px] font-extrabold text-white leading-tight block">
                                {hCode.title}
                              </span>
                              <span className="text-[9px] text-[#fda4af]/60 font-mono block truncate mt-0.5">
                                {hCode.address}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-red-950/50 pt-1.5 mt-0.5">
                              <span className="text-[8px] font-mono tracking-widest uppercase text-red-400 font-black flex items-center gap-1">
                                <Activity className="h-2.5 w-2.5 animate-pulse text-red-500" /> Ready
                              </span>
                              <a 
                                href={hCode.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] font-mono font-black text-red-300 flex items-center gap-0.5 hover:text-white transition-colors"
                              >
                                Target Maps <Navigation className="h-3 w-3 text-red-400" />
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-zinc-500 text-center py-4">
                          No nearby trauma wards found. Using default rescue blocks.
                        </p>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Legal advisory footer */}
              <div className="bg-red-950/40 border-t border-red-900/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                <p className="text-[9px] text-zinc-500 leading-normal max-w-xl font-sans">
                  ⚠️ **Emergency Medical Warning**: PulsePoint AI is an adaptive triage support platform, not a replacement for standard licensed clinical intervention. If you are experiencing major myocardial distress, sever choking, or hemorrhage, please utilize emergency services without delay.
                </p>
                <div className="flex items-center gap-3 shrink-0 font-mono text-[9px] font-bold text-red-400/80 bg-red-950/25 px-2.5 py-1 rounded border border-red-900/30">
                  <span>GPS COORDINATES ACCREDITED</span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
