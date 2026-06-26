import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  HeartPulse,
  Bot,
  ShieldAlert,
  Compass,
  FileText,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  Cpu,
  Brain,
  ShieldAlert as SOSIcon,
  Sparkles
} from "lucide-react";

interface HomepageScrollSectionsProps {
  setTab: (tab: string) => void;
}

export default function HomepageScrollSections({ setTab }: HomepageScrollSectionsProps) {
  const [liveBpm, setLiveBpm] = useState(72);
  const [activeStep, setActiveStep] = useState(1);

  // High-fidelity ECG animation tick to sync heartbeat reading dynamically
  useEffect(() => {
    const bpmInterval = setInterval(() => {
      setLiveBpm(prev => {
        const offset = Math.random() > 0.5 ? 1 : -1;
        const target = prev + offset;
        return target >= 68 && target <= 84 ? target : prev;
      });
    }, 1800);

    const stepInterval = setInterval(() => {
      setActiveStep(prev => (prev % 3) + 1);
    }, 4000);

    return () => {
      clearInterval(bpmInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const features = [
    {
      icon: <Bot className="h-6 w-6 text-violet-400" />,
      title: "PulsePoint Chat Companion",
      description: "Our proprietary Clinical AI agent is trained to interpret somatic discomfort indicators, explain pharmacodynamics, and offer personalized health insights around the clock.",
      cta: "Launch Chatbot",
      targetTab: "pulsepoint",
      color: "from-violet-500/20 to-indigo-500/5",
      accent: "text-violet-400",
      stats: "Gemini 2.5 Secured"
    },
    {
      icon: <LayoutFeatureIcon type="sos" />,
      title: "Immediate SOS Console",
      description: "Instantly broadcast your telemetry payload and GPS coordinates to emergency contacts and health responders in a secure one-tap SOS countdown.",
      cta: "View SOS Suite",
      targetTab: "features",
      color: "from-rose-500/20 to-orange-500/5",
      accent: "text-rose-400",
      stats: "0.8s Global Relay"
    },
    {
      icon: <Activity className="h-6 w-6 text-amber-400" />,
      title: "Smart Medicine & Vitals Tracker",
      description: "Log daily prescriptions, configure active buzzer alarms for precise dosage times, find regional pharmacies open 24/7, and synchronize essential live health metrics.",
      cta: "Explore Trackers",
      targetTab: "features",
      color: "from-amber-500/20 to-yellow-500/5",
      accent: "text-amber-400",
      stats: "Active Dosage Alarms"
    },
    {
      icon: <FileText className="h-6 w-6 text-emerald-400" />,
      title: "AI Medical Vault Scan",
      description: "Upload physical medical records, physician scripts, or lab charts. Our vision layer scans papers instantly to simplify dosing and schedule alarms.",
      cta: "Upload Record",
      targetTab: "features",
      color: "from-emerald-500/20 to-teal-500/5",
      accent: "text-emerald-400",
      stats: "HIPAA Compliant Protocol"
    }
  ];

  return (
    <div className="relative z-10 w-full bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950/95 backdrop-blur-md" id="homepage-scroll-container">
      {/* Scroll indicator banner to guide users downward */}
      <div className="flex justify-center -mt-8 mb-20 pointer-events-none">
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono tracking-widest text-[#d1d0ce]/40 font-bold uppercase">Explore Ecosystem</span>
          <div className="h-6 w-4 rounded-full border border-white/20 flex justify-center p-1">
            <div className="h-1.5 w-1.5 bg-violet-400 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* SECTION 1: CORE CAPABILITIES & SOLUTIONS (Framer-Motion reveals) */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative">
        <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-violet-950/30 border border-violet-800/30 rounded-full text-violet-300 text-xs font-mono font-bold tracking-wider uppercase mb-4"
          >
            <Brain className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
            Empowering Patient Autonomy
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white"
          >
            Clinical-Grade Intelligence. <br />
            <span className="bg-gradient-to-r from-violet-400 via-rose-300 to-amber-200 bg-clip-text text-transparent font-semibold">
              Designed For Real Lives.
            </span>
          </motion.h2>

          <p className="text-base text-foreground/60 mt-4 leading-relaxed font-sans">
            PulsePoint is built on a high-compliance micro-mesh that pairs live sensor statistics with state-of-the-art diagnostic reasoning models.
          </p>
        </div>

        {/* Dynamic staggered card grid with premium clinical-grade card designs in one row on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 45, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ 
                y: -8, 
                scale: 1.02, 
                transition: { duration: 0.25, ease: "easeOut" }
              }}
              transition={{ 
                type: "spring",
                stiffness: 75,
                damping: 15,
                delay: index * 0.12 
              }}
              className={`group p-8 rounded-3xl border border-white/5 bg-[#0b0821]/60 bg-gradient-to-br ${feat.color} relative overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-violet-600/[0.08] flex flex-col justify-between min-h-[300px]`}
            >
              {/* Subtle ambient light splash inside card aligned with its primary accent */}
              <div className="absolute -top-12 -right-12 h-32 w-32 bg-current opacity-[0.03] group-hover:opacity-[0.06] blur-2xl rounded-full transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  {/* Glowing Icon Plate with reactive breathing effect */}
                  <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-violet-400/40 group-hover:bg-white/[0.06] transition-all duration-300 animate-pulse" style={{ animationDuration: '4s' }}>
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest font-extrabold uppercase text-[#f2f1ef]/40 bg-white/5 px-3 py-1 rounded-full border border-white/5 group-hover:border-white/10 group-hover:text-[#f2f1ef]/75 transition-all">
                    {feat.stats}
                  </span>
                </div>

                <h3 className="text-2xl font-display font-medium text-[#f2f1ef] tracking-tight group-hover:text-white transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-foreground/50 leading-relaxed mt-4 group-hover:text-[#d1d0ce]/80 transition-colors">
                  {feat.description}
                </p>
              </div>

              {/* Dynamic bottom action block with custom visual pulse line */}
              <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <button
                  onClick={() => setTab(feat.targetTab)}
                  className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-violet-300 transition-colors cursor-pointer select-none"
                >
                  <span className="relative">
                    {feat.cta}
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-violet-400 group-hover:w-full transition-all duration-300" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-violet-400 group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>
                
                {/* Visual heart line ping indicator */}
                <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-full text-[9px] font-mono text-[#d1d0ce]/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping shrink-0" />
                  ACTIVE SYSTEM
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 2: THE INTERACTIVE BIOMETRIC SIMULATOR & TELEMETRY HEAL INTERFACE */}
      <section className="bg-gradient-to-b from-transparent via-slate-950/40 to-transparent py-24 relative overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-rose-900/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Block: Technical Context */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950/20 border border-amber-800/30 px-3 py-1 rounded-full">
              ⚡ LIVE TELEMETRY SIMULATOR
            </span>
            <h3 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight leading-tight">
              Watch your vitals coordinate in real-time.
            </h3>
            <p className="text-sm text-foreground/55 leading-relaxed font-sans">
              PulsePoint parses background clinical metrics seamlessly. Experience how heart telemetry pulses sync immediately with intelligent threshold warnings.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Continuous Electrocardiogram Sweep</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed mt-0.5">Dual-band SVG waves track rhythmic fluctuations at 60 frames per second.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Dynamic Stress Warnings</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed mt-0.5">Onboard model automatically notifies chosen dispatch servers if parameters critical.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setTab("features")}
              className="liquid-glass text-white font-medium hover:bg-white/5 border border-white/10 px-6 py-3 rounded-full text-xs transition-all tracking-wide flex items-center gap-2 cursor-pointer mt-4"
            >
              Access Medicine & Vitals Tracker
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>

          {/* Right Block: Pure High-Fidelity UI Simulator Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 bg-[#0b0821]/80 border border-white/10 rounded-3xl p-6 shadow-2xl relative"
          >
            {/* Ambient glows and header details inside layout card */}
            <div className="absolute top-2 right-2 h-20 w-20 bg-rose-500/10 blur-xl rounded-full" />
            <div className="absolute bottom-2 left-2 h-24 w-24 bg-violet-500/10 blur-xl rounded-full" />

            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <HeartPulse className="h-5 w-5 text-rose-500 animate-pulse" />
                <div>
                  <p className="text-xs font-semibold text-white">Telemetry Channel: PULSE-1</p>
                  <p className="text-[9px] font-mono text-foreground/45">SECURE END-TO-END FEED</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 font-mono font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                LIVE STREAM
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Stat 1: Pulse */}
              <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <span className="text-[9px] font-mono text-foreground/35 uppercase font-bold">Biometric Heart Rate</span>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-display font-bold text-white tracking-tight animate-pulse">
                    {liveBpm}
                  </span>
                  <span className="text-[10px] font-mono text-rose-400 font-bold">BPM</span>
                </div>
                <p className="text-[9px] text-emerald-400 font-mono mt-2 flex items-center gap-1">
                  <span>●</span> Rhythmic Steady
                </p>
              </div>

              {/* Stat 2: VO2 Max */}
              <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-foreground/35 uppercase font-bold">Oxygenation level</span>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">
                    98.6
                  </span>
                  <span className="text-[10px] font-mono text-sky-400 font-bold">%</span>
                </div>
                <p className="text-[9px] text-sky-400 font-mono mt-2">SpO2 Optimal Range</p>
              </div>

              {/* Stat 3: Stress Index */}
              <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-foreground/35 uppercase font-bold">Stress Synthesis</span>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">
                    Mild
                  </span>
                </div>
                <p className="text-[9px] text-violet-400 font-mono mt-2">Relaxed Cognitive Flow</p>
              </div>
            </div>

            {/* High-Fidelity Oscilloscope ECG animation curve using direct styling / SVG path */}
            <div className="w-full bg-slate-950/90 border border-white/5 p-4 rounded-2xl mb-4 relative overflow-hidden h-28">
              <span className="absolute top-2 left-2 text-[8px] font-mono tracking-widest text-[#d1d0ce]/30 uppercase font-black">
                ECG MONITOR CORES
              </span>
              
              {/* Dynamic SVG with drawing heart loop */}
              <svg className="w-full h-full text-rose-500 opacity-90" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path
                  d="M 0,50 L 50,50 L 60,45 L 70,55 L 80,50 L 100,50 L 110,15 L 120,90 L 130,50 L 160,50 L 170,45 L 180,55 L 190,50 L 250,50 L 260,10 L 270,95 L 280,50 L 310,50 L 320,45 L 330,55 L 340,50 L 400,50"
                  fill="none"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  className="stroke-pulse-curve"
                  style={{
                    strokeDasharray: "1000",
                    strokeDashoffset: "0",
                    animation: "ecg-sweep-animation 3s linear infinite"
                  }}
                />
              </svg>

              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                <span className="text-[9px] font-mono text-rose-400/70 font-semibold uppercase">Harmonic sweep sweep</span>
              </div>
            </div>

            <style>{`
              @keyframes ecg-sweep-animation {
                0% { opacity: 0.3; stroke-dashoffset: 200; }
                50% { opacity: 1; }
                100% { opacity: 0.3; stroke-dashoffset: 0; }
              }
            `}</style>
          </motion.div>

        </div>
      </section>

      {/* SECTION 3: THE STEP-BY-STEP WORKFLOW TIMELINE */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative">
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-violet-950/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-mono font-bold tracking-widest text-violet-400 uppercase bg-violet-950/20 border border-violet-800/30 px-3 py-1 rounded-full">
            🧠 CLINICAL WORKFLOW
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight mt-3">
            How PulsePoint Secures Guardrails
          </h2>
          <p className="text-sm text-foreground/50 mt-2">
            Engineered to coordinate real-time tracking with autonomous AI dispatch in under three standard phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              activeStep === 1 
                ? "border-violet-500 bg-violet-950/10" 
                : "border-white/5 bg-white/[0.01]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 p-2.5 rounded-lg border border-violet-800/20 leading-none">
                STEP .01
              </span>
              <Activity className={`h-5 w-5 ${activeStep === 1 ? "text-violet-400 animate-pulse" : "text-foreground/35"}`} />
            </div>
            <h4 className="text-lg font-display font-bold text-white leading-tight">Patient telemetry sync</h4>
            <p className="text-xs text-foreground/50 leading-relaxed mt-2.5">
              Sync your wearable logs or drop medicine papers directly into the cloud. The system maps baseline vital logs into encrypted caches.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              activeStep === 2 
                ? "border-violet-500 bg-violet-950/10" 
                : "border-white/5 bg-white/[0.01]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 p-2.5 rounded-lg border border-violet-800/20 leading-none">
                STEP .02
              </span>
              <Cpu className={`h-5 w-5 ${activeStep === 2 ? "text-violet-400 animate-spin" : "text-foreground/35"}`} />
            </div>
            <h4 className="text-lg font-display font-bold text-white leading-tight">Clinical reasoning scan</h4>
            <p className="text-xs text-foreground/50 leading-relaxed mt-2.5">
              The proprietary PulsePoint model checks statistics against somatic thresholds to identify critical trends and compose bulletproof guidelines.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              activeStep === 3 
                ? "border-violet-500 bg-violet-950/10" 
                : "border-white/5 bg-white/[0.01]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 p-2.5 rounded-lg border border-violet-800/20 leading-none">
                STEP .03
              </span>
              <Compass className={`h-5 w-5 ${activeStep === 3 ? "text-violet-400 animate-bounce" : "text-foreground/35"}`} />
            </div>
            <h4 className="text-lg font-display font-bold text-white leading-tight">Direct action dispatch</h4>
            <p className="text-xs text-foreground/50 leading-relaxed mt-2.5">
              When symptoms trigger limits, PulsePoint coordinates with location APIs to identify active hospitals and alert emergency networks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: DETAILED BOTTOM IMMERSIVE CALL-TO-ACTION CARD */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="absolute -inset-10 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="liquid-glass border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-32 w-32 bg-violet-400/5 rounded-full blur-[80px]" />
          
          <h3 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
            Take Control of Your Clinical Workspace Today.
          </h3>
          <p className="text-sm text-foreground/50 max-w-xl mx-auto mt-3.5 leading-relaxed font-sans">
            Connect directly with PulsePoint's conversational expert or inspect our visual tools, maps components, and health logs dashboards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setTab("pulsepoint")}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-full transition-all text-xs tracking-wider cursor-pointer shadow-xl hover:shadow-violet-500/20 active:scale-98"
            >
              Consult Clinical Chatbot
            </button>
            <button
              onClick={() => setTab("features")}
              className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-[#d1d0ce] font-semibold px-8 py-4 rounded-full transition-all text-xs tracking-wider cursor-pointer active:scale-98"
            >
              View Features Catalog
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// Inline LayoutFeatureIcon to map lucide elements without error risks
function LayoutFeatureIcon({ type }: { type: string }) {
  if (type === "sos") {
    return <ShieldAlert className="h-6 w-6 text-rose-400 animate-pulse" />;
  }
  return <HeartPulse className="h-6 w-6 text-rose-400" />;
}
