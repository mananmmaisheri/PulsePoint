import React, { useState, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  ShieldAlert,
  Compass,
  Presentation,
  User,
  Activity,
  Zap,
  Heart,
  Radar,
  ArrowLeft,
  Grid,
  Sparkles,
  Cpu,
  BrainCircuit,
  Sliders
} from "lucide-react";

// Import live functional sub-systems
import HealthDashboard from "./HealthDashboard";
import MedicalRecordsVault from "./MedicalRecordsVault";
import EmergencySOS from "./EmergencySOS";
import HospitalLocator from "./HospitalLocator";
import HealthOnboarding from "./HealthOnboarding";

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
  telemetryType: "bpm" | "satellite" | "radar" | "avatar" | "tam";
}

export default function FeaturesHub() {
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [tickerBpm, setTickerBpm] = useState(72);
  const [radarDegrees, setRadarDegrees] = useState(0);

  // Real-time telemetry loops for active device previews
  useEffect(() => {
    const bpmLog = setInterval(() => {
      setTickerBpm((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const net = prev + delta;
        return net >= 68 && net <= 76 ? net : prev;
      });
    }, 1500);

    const radarAngle = setInterval(() => {
      setRadarDegrees((prev) => (prev + 6) % 360);
    }, 60);

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
      shortDesc: "Real-time wearable telemetry and heart analytics calibrated to active patient profiles.",
      longDesc: "Provides instant feedback of heart frequency (BPM), blood oxygen, fluid intake meters, and continuous vital logs with persistent secure state storage.",
      icon: <LayoutDashboard className="h-5 w-5" />,
      colorClass: "border-amber-500/30 text-amber-400 hover:border-amber-500/60",
      activeColorClass: "border-amber-500 bg-[#0e0a29]/80 shadow-amber-500/20 ring-amber-500/25",
      glowColor: "rgba(245, 158, 11, 0.2)",
      accentHex: "#f59e0b",
      techStack: ["Wearable Sync", "Biometric Analytics", "Clinical Vital Logs"],
      status: "Telemetry Active",
      telemetryType: "bpm"
    },
    {
      id: "records-vault",
      title: "AI Medical Records Vault",
      category: "MULTIMODAL DIAGNOSTICS",
      shortDesc: "Secure clinical report digitization, handwritten prescription OCR, and diagnostic translation.",
      longDesc: "Leverages multimodal AI models to translate paper prescriptions, biochemistry panels, and radiology results into plain text summaries, stored directly on your private encrypted vault.",
      icon: <BrainCircuit className="h-5 w-5 animate-pulse" />,
      colorClass: "border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60",
      activeColorClass: "border-indigo-500 bg-[#0e0a29]/80 shadow-indigo-500/20 ring-indigo-500/25",
      glowColor: "rgba(99, 102, 241, 0.2)",
      accentHex: "#6366f1",
      techStack: ["Multimodal OCR", "Gemini Clinical Scan", "Encrypted Vault"],
      status: "Vault Secure",
      telemetryType: "avatar"
    },
    {
      id: "sos",
      title: "Emergency SOS Rescuer",
      category: "AUTOMATED ALERTS",
      shortDesc: "Active multi-channel emergency broadcast conveying GPS coordinates.",
      longDesc: "Under acute trauma or cardiac events, user triggers a rapid satellite countdown capturing GPS positioning, vital history payloads, and pre-alerting nearest EDs.",
      icon: <ShieldAlert className="h-5 w-5 animate-pulse" />,
      colorClass: "border-rose-500/30 text-rose-400 hover:border-rose-500/60",
      activeColorClass: "border-rose-500 bg-[#0e0a29]/80 shadow-rose-500/20 ring-rose-500/25",
      glowColor: "rgba(239, 68, 68, 0.2)",
      accentHex: "#ef4444",
      techStack: ["GPS Satellite API", "112 Proxy", "Cellular SMS Relay"],
      status: "Resilient Link",
      telemetryType: "satellite"
    },
    {
      id: "locator",
      title: "Clinic Finder",
      category: "GEOLOCATION ENGINE",
      shortDesc: "Interactive Google Maps grounding to map nearest trauma clinics.",
      longDesc: "Identifies regional clinical providers, round-the-clock intensive care nodes, and open specialist wings mapped cleanly against live patient location strings.",
      icon: <Compass className="h-5 w-5" />,
      colorClass: "border-sky-500/30 text-sky-400 hover:border-sky-500/60",
      activeColorClass: "border-sky-500 bg-[#0e0a29]/80 shadow-sky-500/20 ring-sky-500/25",
      glowColor: "rgba(14, 165, 233, 0.2)",
      accentHex: "#0ea5e9",
      techStack: ["Maps GIS APIs", "Clinics Geocoder", "AI Search Grounding"],
      status: "Satellite Sync",
      telemetryType: "radar"
    },
    {
      id: "risk-predictor",
      title: "Chronic Risk Predictor",
      category: "PREVENTATIVE EPIDEMIOLOGY",
      shortDesc: "Our interactive 6-section clinical questionnaire and blood report scanner mapping direct risk scores.",
      longDesc: "Performs multi-vector assessment (lifestyle metrics, symptom indicators, genetics, and lab blood telemetry) to formulate predictive scores for Diabetes, Coronary and Hypertensive states.",
      icon: <Sliders className="h-5 w-5" />,
      colorClass: "border-violet-500/30 text-violet-400 hover:border-violet-500/60",
      activeColorClass: "border-violet-500 bg-[#0e0a29]/80 shadow-violet-500/20 ring-violet-500/25",
      glowColor: "rgba(139, 92, 246, 0.2)",
      accentHex: "#8b5cf6",
      techStack: ["ML Risk Models", "Biomarker Extractors", "Onboarding Flow"],
      status: "Assessment Ready",
      telemetryType: "tam"
    }
  ];

  // Transition parameters
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.02
      }
    }
  };

  const cardTransition = {
    hidden: { opacity: 0, y: 35, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 18 }
    }
  };

  return (
    <div className="w-full flex-1 max-w-7xl mx-auto px-4 md:px-8 py-10" id="solutions-suite-hub">
      <AnimatePresence mode="wait">
        {activeFeatureId === null ? (
          /* ================= PAGE VIEW 1: OVERVIEW CARD PORTAL LIST ================= */
          <motion.div
            key="overview-portal-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Header Layout: Minimalist typography with professional aesthetic and clear hierarchy */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5 text-left">
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-violet-300 font-extrabold uppercase bg-violet-950/40 border border-violet-800/40 px-3.5 py-1.5 rounded-full flex items-center gap-2 w-fit">
                  <Cpu className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                  PulsePoint Diagnostic Portal Catalog
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight mt-1">
                  Advanced Clinical Suite
                </h2>
                <p className="text-xs md:text-sm text-foreground/50 max-w-2xl font-sans font-light">
                  Select any active clinical node below to launch that medical simulation module in a dedicated workspace.
                </p>
              </div>

              {/* Status information Badge */}
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-4 py-2.5 rounded-xl self-start md:self-auto shadow-lg backdrop-blur-md">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-mono text-zinc-500 uppercase leading-none font-bold">EMULATOR LATENCY</p>
                  <p className="text-[10px] font-bold text-white mt-1 font-mono">0.02s Live Feed</p>
                </div>
              </div>
            </div>

            {/* Bento Interactive Grid for exactly 6 cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {cards.map((card) => (
                <motion.button
                  key={card.id}
                  variants={cardTransition}
                  onClick={() => {
                    startTransition(() => {
                      setActiveFeatureId(card.id);
                    });
                  }}
                  whileHover={{
                    y: -8,
                    borderColor: card.accentHex,
                    boxShadow: `0 20px 40px ${card.glowColor}`,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-black/60 hover:bg-black/85 border border-white/10 rounded-2xl p-6 text-left flex flex-col justify-between transition-all outline-none cursor-pointer relative overflow-hidden backdrop-blur-2xl min-h-[310px] group shadow-xl"
                >
                  {/* Dynamic absolute color top header block line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] opacity-25 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: card.accentHex }}
                  />

                  {/* Upper Header portion */}
                  <div className="space-y-4 w-full text-left">
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center border transition-colors shrink-0 bg-white/[0.03] border-white/10"
                        style={{ color: card.accentHex }}
                      >
                        {card.icon}
                      </div>

                      {/* Small Status Identifier tag */}
                      <span className="text-[8px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-300 border border-white/10">
                        {card.status}
                      </span>
                    </div>

                    {/* Descriptive texts */}
                    <div className="text-left">
                      <span className="text-[10px] font-mono tracking-widest text-violet-300 mb-1.5 block uppercase font-bold leading-none">
                        {card.category}
                      </span>
                      <h4 className="font-display font-bold text-white text-base tracking-tight leading-snug group-hover:text-white">
                        {card.title}
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed mt-2.5 font-light font-sans line-clamp-3">
                        {card.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* High fidelity telemetry widget box embedded in card */}
                  <div className="w-full my-4 bg-black/50 rounded-xl border border-white/5 p-2.5 h-16 flex items-center justify-center relative overflow-hidden shrink-0">
                    
                    {card.telemetryType === "bpm" && (
                      <div className="flex items-center justify-between w-full px-1 z-10 text-left">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Heart className="h-3.5 w-3.5 text-amber-400 animate-pulse animate-duration-1000" />
                          <span className="text-xs font-mono font-black text-amber-200 mt-0.5 leading-none">{tickerBpm}</span>
                          <span className="text-[8px] font-mono text-zinc-500 font-bold leading-none">BPM</span>
                        </div>
                        {/* Miniature SVG Wave line */}
                        <svg className="w-20 h-8 text-amber-400/50 shrink-0" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path d="M0,15 L35,15 L40,5 L45,25 L50,15 L100,15" fill="none" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                      </div>
                    )}

                    {card.telemetryType === "satellite" && (
                      <div className="flex items-center justify-between w-full px-1 z-10 text-left">
                        <span className="text-[8px] font-mono tracking-wider font-extrabold text-red-400 uppercase flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5 animate-bounce" /> SAT INTEGRATION
                        </span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <span 
                              key={dot} 
                              className={`h-2 w-2 rounded-full ${
                                dot <= 4 ? "bg-red-500 animate-pulse" : "bg-red-950"
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {card.telemetryType === "radar" && (
                      <div className="flex items-center justify-between w-full px-1 z-10 text-left">
                        <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase shrink-0">Radar Sweep Active</span>
                        <div className="relative h-8 w-8 rounded-full border border-sky-500/30 flex items-center justify-center shrink-0">
                          <div 
                            className="absolute w-full h-[1.2px] bg-sky-400/80 origin-center" 
                            style={{ transform: `rotate(${radarDegrees}deg)` }}
                          />
                          <Radar className="h-4 w-4 text-sky-400/20" />
                        </div>
                      </div>
                    )}

                    {card.telemetryType === "tam" && (
                      <div className="flex items-center justify-between w-full px-1 z-10 text-left">
                        <span className="text-[8px] font-mono text-rose-300 uppercase font-black shrink-0">TAM INDEX</span>
                        <div className="flex items-end gap-[3px] h-7 shrink-0">
                          <div className="w-1.5 bg-violet-500/20 h-2 rounded" />
                          <div className="w-1.5 bg-violet-500/40 h-3.5 rounded" />
                          <div className="w-1.5 bg-violet-500/60 h-5 rounded" />
                          <div className="w-1.5 bg-violet-500 h-7 rounded" />
                        </div>
                      </div>
                    )}

                    {card.telemetryType === "avatar" && (
                      <div className="flex items-center justify-between w-full px-1 z-10 text-left">
                        <span className="text-[8px] font-mono text-emerald-400 uppercase font-extrabold flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-emerald-400 animate-spin animate- duration-3000" /> Human Model
                        </span>
                        <div className="h-1 w-20 bg-emerald-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 animate-pulse" style={{ width: "92%" }} />
                        </div>
                      </div>
                    )}

                    {/* Styled Tech Grids */}
                    <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                  </div>

                  {/* Tech stack lists */}
                  <div className="border-t border-white/10 pt-3.5 w-full space-y-1.5 text-left mt-auto">
                    <span className="text-[8px] font-mono text-zinc-500 font-bold tracking-wider leading-none uppercase block">SUPPORT MODULES</span>
                    <div className="flex flex-wrap gap-1.5">
                      {card.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] bg-white/[0.04] border border-white/5 text-zinc-100 font-mono px-2 py-0.5 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          /* ================= PAGE VIEW 2: DEDICATED FULL-SCREEN FEATURE WORKSPACE ================= */
          <motion.div
            key="feature-details-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 text-left"
          >
            {/* Elegant glowing back panel bar header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4.5">
              <button
                onClick={() => {
                  startTransition(() => {
                    setActiveFeatureId(null);
                  });
                }}
                className="flex items-center gap-2 text-xs font-mono font-bold text-violet-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 px-5 py-2.5 rounded-full transition-all cursor-pointer w-fit group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Portal Directory
              </button>

              <div className="flex items-center gap-2 bg-[#090b1e] border border-violet-900/40 px-4 py-1.5 rounded-full text-[10px] font-mono text-violet-300 font-bold w-fit">
                <Grid className="h-3 w-3 text-violet-400 rotate-12" />
                Session: {cards.find(c => c.id === activeFeatureId)?.title}
              </div>
            </div>

            {/* Title Block describing the chosen active view */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-mono tracking-widest text-violet-300 font-black uppercase">
                {cards.find(c => c.id === activeFeatureId)?.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
                {cards.find(c => c.id === activeFeatureId)?.title}
              </h1>
              <p className="text-xs md:text-sm text-foreground/50 max-w-3xl leading-relaxed">
                {cards.find(c => c.id === activeFeatureId)?.longDesc}
              </p>
            </div>

            {/* Mounted Content Container */}
            <div className="border border-white/10 bg-slate-950/25 p-4 md:p-8 rounded-3xl backdrop-blur-3xl shadow-2xl relative">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeatureId}
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {activeFeatureId === "dashboard" && <HealthDashboard />}
                  {activeFeatureId === "records-vault" && <MedicalRecordsVault />}
                  {activeFeatureId === "sos" && <EmergencySOS />}
                  {activeFeatureId === "locator" && <HospitalLocator />}
                  {activeFeatureId === "risk-predictor" && <HealthOnboarding />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
