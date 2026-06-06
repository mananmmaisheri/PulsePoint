import React, { useState, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  ShieldAlert,
  Compass,
  FileText,
  Presentation,
  CheckCircle2,
  Cpu,
  Sparkles,
  ArrowRight,
  Activity,
  Zap,
  Layers,
  Heart,
  Radar,
  FolderLock,
  LineChart,
  Grid
} from "lucide-react";

// Import live functional sub-systems
import HealthDashboard from "./HealthDashboard";
import EmergencySOS from "./EmergencySOS";
import HospitalLocator from "./HospitalLocator";
import HackathonPresentation from "./HackathonPresentation";

interface FeatureCard {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  icon: React.ReactNode;
  colorClass: string;
  activeColorClass: string;
  glowColor: string;
  accentHex: string;
  techStack: string[];
  status: string;
}

export default function FeaturesHub() {
  const [selectedFeature, setSelectedFeature] = useState<string>("dashboard");
  const [tickerBpm, setTickerBpm] = useState(72);
  const [radarDegrees, setRadarDegrees] = useState(0);

  // Micro-simulation loops for the inside-card high-fidelity visual representations
  useEffect(() => {
    const bpmLog = setInterval(() => {
      setTickerBpm((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const net = prev + delta;
        return net >= 68 && net <= 76 ? net : prev;
      });
    }, 1500);

    const radarAngle = setInterval(() => {
      setRadarDegrees((prev) => (prev + 5) % 360);
    }, 50);

    return () => {
      clearInterval(bpmLog);
      clearInterval(radarAngle);
    };
  }, []);

  const cards: FeatureCard[] = [
    {
      id: "dashboard",
      title: "Biosensor Cockpit",
      category: "WEARABLE TELEMETRY",
      shortDesc: "Real-time biometric data-mesh showing human telemetry and heart cycles.",
      longDesc: "Monitors daily step metrics, customized water intake alarms, Sleep Quality indexes, and wearable heartbeat telemetry connected securely with local persistency.",
      icon: <LayoutDashboard className="h-5 w-5" />,
      colorClass: "border-amber-500/10 text-amber-400 hover:border-amber-500/30",
      activeColorClass: "border-amber-500/50 bg-amber-950/20 shadow-amber-500/10 ring-amber-500/20",
      glowColor: "rgba(245, 158, 11, 0.12)",
      accentHex: "#f59e0b",
      techStack: ["BPM Tracker Core", "Local Storage Core", "ECG Simulators"],
      status: "Telemetry Active"
    },
    {
      id: "sos",
      title: "Emergency SOS Rescuer",
      category: "AUTOMATED ALERTS",
      shortDesc: "Instant unified dispatch conveying precise coordinate broadcasts.",
      longDesc: "Under acute trauma or cardiac events, user triggers a rapid satellite countdown capturing GPS positioning, vital history payloads, and pre-alerting nearest EDs.",
      icon: <ShieldAlert className="h-5 w-5 animate-pulse" />,
      colorClass: "border-rose-500/10 text-rose-400 hover:border-rose-500/30",
      activeColorClass: "border-rose-500/50 bg-rose-950/20 shadow-rose-500/10 ring-rose-500/20",
      glowColor: "rgba(239, 68, 68, 0.12)",
      accentHex: "#ef4444",
      techStack: ["GPS Satellite API", "112 Emergency proxy", "SMS Dispatch"],
      status: "Resilient Link"
    },
    {
      id: "locator",
      title: "Clinic Finder",
      category: "GEOLOCATION ENGINE",
      shortDesc: "Interactive Google Maps grounding to discover near-me trauma wards.",
      longDesc: "Identifies regional clinical providers, round-the-clock intensive care nodes, and open specialist wings mapped cleanly against live patient location strings.",
      icon: <Compass className="h-5 w-5" />,
      colorClass: "border-sky-500/10 text-sky-400 hover:border-sky-500/30",
      activeColorClass: "border-sky-500/50 bg-sky-950/20 shadow-sky-500/10 ring-sky-500/20",
      glowColor: "rgba(14, 165, 233, 0.12)",
      accentHex: "#0ea5e9",
      techStack: ["Maps GIS APIs", "Clinics geocoding", "AI search grounding"],
      status: "Satellite Sync"
    },
    {
      id: "records",
      title: "AI Medical Vault",
      category: "VISION EXAMINER",
      shortDesc: "Multimodal scanner translating physical medical reports in one swipe.",
      longDesc: "Processes uploaded diagnostic paper logs, lab blood charts, or medicine bills to extract secure dosing summaries, avoiding manual scheduling friction.",
      icon: <FileText className="h-5 w-5" />,
      colorClass: "border-emerald-500/10 text-emerald-400 hover:border-emerald-500/30",
      activeColorClass: "border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/10 ring-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.12)",
      accentHex: "#10b981",
      techStack: ["Gemini Vision API", "OCR Text Extraction", "Secure Decryption"],
      status: "HIPAA Compliant"
    },
    {
      id: "pitch",
      title: "Investor Pitch Deck",
      category: "MARKET RESEARCH",
      shortDesc: "Strategic roadmap, corporate presentation, and monetization models.",
      longDesc: "Presents structured demographic slide components, milestones, B2B SaaS target audiences, and deep clinical addressing trends suited for capital boards.",
      icon: <Presentation className="h-5 w-5" />,
      colorClass: "border-violet-500/10 text-violet-400 hover:border-violet-500/30",
      activeColorClass: "border-violet-500/50 bg-violet-950/20 shadow-violet-500/10 ring-violet-500/20",
      glowColor: "rgba(139, 92, 246, 0.12)",
      accentHex: "#8b5cf6",
      techStack: ["B2B SaaS Models", "Corporate planning", "Milestone Index"],
      status: "Board Approved"
    }
  ];

  // Transition variants
  const parentStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.02
      }
    }
  };

  const cardSlideIn = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 18 }
    }
  };

  return (
    <div className="w-full flex-1 max-w-7xl mx-auto px-4 md:px-8 py-12" id="solutions-suite-hub">
      
      {/* 1. Header Hero with premium scroll reveals */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.6 }}
        className="pb-8 mb-10 border-b border-white/5 flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div className="space-y-4 text-left max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-violet-300 bg-violet-950/50 border border-violet-800/30 px-3 py-1.5 rounded-full flex items-center gap-2.5">
              <img 
                src="https://lh3.googleusercontent.com/d/1BFhwv5CYYqqOtHIMy-YIZhOoHHVJSCLS" 
                alt="PulsePoint AI Logo" 
                className="h-6 w-6 object-contain rounded-md"
                referrerPolicy="no-referrer"
              />
              PulsePoint Portal Suite
            </span>
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
              ALL SCHEMAS FUNCTIONAL
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-medium text-white tracking-tight leading-tight">
            Advanced Clinical Solution Suites
          </h2>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-sans mt-2.5">
            Select an active clinical engine block below to operate live, real-time medical simulation metrics, satellite rescue channels, and intelligent AI OCR document vaults in the console frame.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-5 py-3.5 rounded-2xl w-fit self-start lg:self-auto shrink-0 shadow-lg backdrop-blur-md">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5 text-violet-400 animate-pulse" style={{ animationDuration: "2.5s" }} />
          </div>
          <div className="text-left font-sans">
            <p className="text-[9px] font-mono tracking-widest text-[#d1d0ce]/40 leading-none uppercase font-extrabold">EMULATOR LATENCY</p>
            <p className="text-xs font-black text-rose-300 mt-1 font-mono">0.02s System Latency</p>
          </div>
        </div>
      </motion.div>

      {/* 2. Bento Interactive Grid Cards Section */}
      <motion.div
        variants={parentStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10"
      >
        {cards.map((card) => {
          const isSelected = selectedFeature === card.id || (card.id === "records" && selectedFeature === "records");
          return (
            <motion.button
              key={card.id}
              variants={cardSlideIn}
              onClick={() => {
                startTransition(() => {
                  setSelectedFeature(card.id);
                });
              }}
              whileHover={{
                y: -6,
                borderColor: card.accentHex,
                boxShadow: `0 15px 35px ${card.glowColor}`,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all outline-none cursor-pointer relative overflow-hidden backdrop-blur-md min-h-[290px] ${
                isSelected
                  ? `bg-[#0e0a29]/60 border-[1.5px] ${card.activeColorClass} shadow-2xl`
                  : "bg-slate-950/20 border-white/5 hover:bg-[#0c0823]/40"
              }`}
            >
              {/* Dynamic top brand line accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2.5px] transition-opacity duration-300 ${
                  isSelected ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundColor: card.accentHex }}
              />

              {/* Upper Section */}
              <div className="space-y-4 w-full">
                
                {/* Header Row */}
                <div className="flex items-center justify-between w-full">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center border transition-colors shrink-0"
                    style={{
                      backgroundColor: isSelected ? `${card.accentHex}15` : "rgba(255,255,255,0.03)",
                      borderColor: isSelected ? `${card.accentHex}40` : "rgba(255,255,255,0.06)",
                      color: card.accentHex
                    }}
                  >
                    {card.icon}
                  </div>
                  <span className="text-[8px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-400 border border-white/5 whitespace-nowrap">
                    {card.status}
                  </span>
                </div>

                {/* Main Titles */}
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-[#d1d0ce]/40 mb-1 block uppercase leading-none font-black">
                    {card.category}
                  </span>
                  <h4 className="font-sans font-bold text-white text-sm tracking-tight flex items-center gap-1.5 justify-start leading-snug">
                    {card.title}
                    {isSelected && (
                      <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-ping shrink-0" />
                    )}
                  </h4>
                  <p className="text-[11px] text-[#d1d0ce]/60 leading-relaxed mt-2.5 line-clamp-3">
                    {card.shortDesc}
                  </p>
                </div>
              </div>

              {/* Middle Embedded Telemetry Micro-Widget for professional high-fidelity showcase */}
              <div className="w-full my-4 bg-slate-950/40 rounded-xl border border-white/5 p-2 h-14 flex items-center justify-center relative overflow-hidden shrink-0">
                
                {/* Visual rendering according to specific page type */}
                {card.id === "dashboard" && (
                  <div className="flex items-center justify-between w-full px-1 z-10">
                    <div className="flex items-center gap-1.5 shrink-0 text-left">
                      <Heart className="h-3 w-3 text-amber-400 animate-pulse" />
                      <span className="text-[11px] font-mono font-black text-amber-200 mt-0.5 leading-none">{tickerBpm}</span>
                      <span className="text-[7px] font-mono text-zinc-500 font-bold leading-none">BPM</span>
                    </div>
                    {/* SVG ECG Miniature line */}
                    <svg className="w-16 h-8 text-amber-400/40" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M0,15 L30,15 L35,5 L40,25 L45,15 L100,15" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                )}

                {card.id === "sos" && (
                  <div className="flex items-center justify-between w-full px-1 z-10">
                    <span className="text-[7px] font-mono tracking-wider font-extrabold text-red-400 uppercase flex items-center gap-1">
                      <Zap className="h-2 w-2 animate-ping" /> SATELLITE
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <span 
                          key={dot} 
                          className={`h-1.5 w-1.5 rounded-full ${
                            dot <= 3 ? "bg-red-500 animate-pulse" : "bg-red-950"
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {card.id === "locator" && (
                  <div className="flex items-center justify-between w-full px-1 z-10">
                    <span className="text-[7px] font-mono text-zinc-500 font-bold uppercase shrink-0">Radar sweep</span>
                    <div className="relative h-7 w-7 rounded-full border border-sky-500/20 flex items-center justify-center shrink-0">
                      <div 
                        className="absolute w-full h-[1px] bg-sky-400/65 origin-center" 
                        style={{ transform: `rotate(${radarDegrees}deg)` }}
                      />
                      <Radar className="h-3.5 w-3.5 text-sky-400/30" />
                    </div>
                  </div>
                )}

                {card.id === "records" && (
                  <div className="flex items-center justify-between w-full px-1 z-10">
                    <span className="text-[7px] font-mono text-emerald-400 uppercase font-black">Scanning File</span>
                    <div className="h-1 max-w-[45px] w-full bg-emerald-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 animate-pulse" style={{ width: "80%" }} />
                    </div>
                  </div>
                )}

                {card.id === "pitch" && (
                  <div className="flex items-center justify-between w-full px-1 z-10">
                    <span className="text-[7px] font-mono text-rose-300 uppercase font-bold shrink-0">TAM Size</span>
                    <div className="flex items-end gap-[2px] h-6 shrink-0">
                      <div className="w-1.5 bg-violet-500/30 h-1 rounded" />
                      <div className="w-1.5 bg-violet-500/50 h-3 rounded" />
                      <div className="w-1.5 bg-violet-500/70 h-4 rounded" />
                      <div className="w-1.5 bg-violet-500 h-6 rounded" />
                    </div>
                  </div>
                )}

                {/* Moving grid background */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px]" />
              </div>

              {/* Lower Stack - technology tags */}
              <div className="border-t border-white/5 pt-3 w-full space-y-1.5 mt-auto">
                <span className="text-[8px] font-mono text-zinc-500 tracking-wider leading-none uppercase font-black block">INTEGRATION MODULES</span>
                <div className="flex flex-wrap gap-1">
                  {card.techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[9px] bg-white/[0.02] border border-white/5 text-[#d1d0ce]/80 font-mono px-1.5 py-0.5 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* 3. Primary Sandbox Console Frame */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full text-left"
      >
        <div className="border border-white/10 bg-slate-950/25 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(5,2,18,0.7)] relative">
          
          {/* Aesthetic Mock Frame Operating Header */}
          <div className="px-6 py-4.5 bg-slate-950/80 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              {/* Retro hardware indicators */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 border border-rose-600/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 border border-amber-600/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 border border-emerald-600/50" />
              </div>

              {/* Console designation */}
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
                <h3 className="text-[10px] md:text-xs font-mono font-black text-violet-300 uppercase tracking-widest leading-none">
                  Live Sandbox Session: {cards.find(c => c.id === selectedFeature || (selectedFeature === "records" && c.id === "records"))?.title}
                </h3>
              </div>
            </div>

            {/* Right clinical indicator badge */}
            <div className="flex items-center gap-2 bg-[#090b1e] border border-violet-900/35 px-4 py-1.5 rounded-full text-[9px] font-mono font-bold text-violet-300 shrink-0 select-none">
              <Grid className="h-3 w-3 text-violet-400 animate-spin" style={{ animationDuration: "12s" }} />
              EMULATION MODE RE-ALIGNED
            </div>
          </div>

          {/* Core Content mounting active module */}
          <div className="p-4 md:p-6.5 bg-[#050212]/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFeature}
                initial={{ opacity: 0, scale: 0.995, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.995, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex"
              >
                {selectedFeature === "dashboard" && <HealthDashboard />}
                {selectedFeature === "sos" && <EmergencySOS />}
                {selectedFeature === "locator" && <HospitalLocator />}
                {selectedFeature === "records" && <HealthDashboard />} {/* Includes direct scanning and PDF records upload simulation gracefully */}
                {selectedFeature === "pitch" && <HackathonPresentation />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
