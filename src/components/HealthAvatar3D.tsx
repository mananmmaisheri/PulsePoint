import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Activity, 
  Info, 
  ArrowLeft, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Scale, 
  Ruler, 
  Sparkles,
  RefreshCw,
  RotateCcw,
  Search,
  Eye,
  Settings,
  Flame,
  Dna
} from "lucide-react";

export default function HealthAvatar3D() {
  // 1. Somatic state inputs
  const [height, setHeight] = useState<number>(175); // cm
  const [weight, setWeight] = useState<number>(72); // kg
  const [age, setAge] = useState<number>(28); // years
  const [gender, setGender] = useState<"male" | "female" | "nonbinary">("male");
  const [stressLevel, setStressLevel] = useState<"low" | "medium" | "high">("medium");
  const [systolic, setSystolic] = useState<number>(120); // mmHg

  // Visual scan state controllers
  const [scanMode, setScanMode] = useState<"hologram" | "skeletal" | "respiratory" | "cardio">("hologram");
  const [activeOrganId, setActiveOrganId] = useState<"brain" | "heart" | "lungs" | "liver" | "joints">("heart");
  const [rotationY, setRotationY] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  // Auto rotation loop
  useEffect(() => {
    let timer: any;
    if (isRotating) {
      timer = setInterval(() => {
        setRotationY((p) => (p + 2.0) % 360);
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isRotating]);

  const handleReset = () => {
    setHeight(175);
    setWeight(72);
    setAge(28);
    setGender("male");
    setStressLevel("medium");
    setSystolic(120);
    setScanMode("hologram");
    setActiveOrganId("heart");
  };

  const heightMeters = height / 100;
  const bmi = weight / (heightMeters * heightMeters);

  // Somatic scaling transformations
  const scaleY = height / 175;
  const scaleX = Math.min(1.3, Math.max(0.75, bmi / 22.0));

  // Comprehensive health score calculation 
  let calculatedScore = 100;

  if (age > 45) {
    calculatedScore -= (age - 45) * 0.3;
  }
  const bmiDeviation = Math.abs(bmi - 21.7);
  calculatedScore -= bmiDeviation * 3.6;

  const bpDeviation = Math.abs(systolic - 120);
  calculatedScore -= bpDeviation * 0.4;

  if (stressLevel === "medium") calculatedScore -= 6;
  if (stressLevel === "high") calculatedScore -= 20;

  const healthScore = Math.floor(Math.max(12, Math.min(100, calculatedScore)));

  // Aura states based on score
  let statusColor = "text-emerald-400";
  let statusBg = "bg-emerald-950/40 border-emerald-500/30";
  let auraGlow = "shadow-[0_0_50px_rgba(16,185,129,0.18)]";
  let matchCategory = "Homeostatic Equilibrium (Excellent)";

  if (healthScore < 85 && healthScore >= 60) {
    statusColor = "text-amber-400";
    statusBg = "bg-amber-950/40 border-amber-500/30";
    auraGlow = "shadow-[0_0_50px_rgba(245,158,11,0.18)]";
    matchCategory = "Metabolic Compensation (Moderate)";
  } else if (healthScore < 60) {
    statusColor = "text-rose-400";
    statusBg = "bg-rose-950/40 border-rose-500/30";
    auraGlow = "shadow-[0_0_50px_rgba(239,68,68,0.18)]";
    matchCategory = "Somatic High Stress (Risks Prevalent)";
  }

  // Detailed localized telemetry indices
  const getOrganDiagnostic = () => {
    switch (activeOrganId) {
      case "brain":
        return {
          title: "Neural Cortex & Brain Scan",
          icon: "🧠",
          metrics: [
            { label: "Alpha Neurological Sync", value: stressLevel === "low" ? "88%" : stressLevel === "medium" ? "65%" : "42%", state: "normal" },
            { label: "Cortisol Neural Load", value: stressLevel === "low" ? "Low (Stable)" : stressLevel === "medium" ? "Elevated" : "Hypertensial Strike", state: stressLevel === "high" ? "high" : "normal" },
            { label: "Executive Focus Index", value: "Optimal (B-Waves active)", state: "normal" }
          ],
          summary: "Cerebral wave maps reveal high localized activity within the amygdala, correlating with work pressure. Parasympathetic stimulation suggested.",
        };
      case "heart":
        return {
          title: "Cardiovascular Chamber & Heart",
          icon: "❤️",
          metrics: [
            { label: "Systolic Ventricle Load", value: `${systolic} mmHg`, state: systolic > 130 ? "high" : "normal" },
            { label: "Coronary Wall Compliance", value: systolic > 130 ? "Stiffened" : "Highly Elastic", state: systolic > 130 ? "high" : "normal" },
            { label: "Resting Cardiac Energy", value: "72 BPM (Symmetrical Sync)", state: "normal" }
          ],
          summary: "Myocardial chamber compliance is responsive. Watch vascular back-pressure index derived from elevated peak systolic cycles.",
        };
      case "lungs":
        return {
          title: "Pulmonary Bronchial Airways",
          icon: "🫁",
          metrics: [
            { label: "Tidal Volume Reserve", value: "3.8 Liters (Healthy)", state: "normal" },
            { label: "Alveoli Oxygen Transfer", value: "98.5% Efficiency", state: "normal" },
            { label: "Respiratory Cadence Rate", value: "14 breaths/min", state: "normal" }
          ],
          summary: "Both lobes present unconstricted flow. Slight thoracic tension and oxygen saturation dips noted during hyperventilation spikes.",
        };
      case "liver":
        return {
          title: "Visceral Organs & Hepatic Core",
          icon: "🥝",
          metrics: [
            { label: "Visceral Adipose Pressure", value: bmi > 25 ? "Excessive" : "Balanced", state: bmi > 25 ? "high" : "normal" },
            { label: "Insulin Tissue Response", value: bmi > 25 ? "Resistive Shift" : "Highly Sensitive", state: bmi > 25 ? "high" : "normal" },
            { label: "Digestive Enzyme Homeostasis", value: "Perfect", state: "normal" }
          ],
          summary: "Gastrointestinal homeostasis corresponds to metabolic mass inputs. Lowering simple sugars stabilizes insulin secretion bounds.",
        };
      case "joints":
        return {
          title: "Somatic Joints & Skeleton",
          icon: "🦴",
          metrics: [
            { label: "Knee Cartilage Thickness", value: age > 40 ? "Mild Wear" : "Pristine", state: "normal" },
            { label: "Synovial Fluid Nutrition", value: "Optimal Lubrication", state: "normal" },
            { label: "Lumbar Spinal Compression", value: "Slight Lordotic Shift", state: "normal" }
          ],
          summary: "Lower extremity mechanics indicate healthy skeletal loads. Stretch and engage glutes/hamstrings weekly to decompress hips.",
        };
    }
  };

  const getClinicalReview = () => {
    const ageString = age > 40 ? "mature physiological metabolic cadence" : "youthful active cellular regeneration";
    const weightVerdict = bmi < 18.5 
      ? `underweight lean index (BMI: ${bmi.toFixed(1)})` 
      : bmi < 25 
        ? `excellent weight-to-height balance (BMI: ${bmi.toFixed(1)})` 
        : `heightened metabolic bulk index (BMI: ${bmi.toFixed(1)})`;
    const pulseVerdict = systolic > 140 
      ? `stage-2 systemic hypertension Risk (${systolic} mmHg)` 
      : systolic > 130 
        ? `elevated pre-hypertensive state (${systolic} mmHg)` 
        : `healthy standard circulatory tension (${systolic} mmHg)`;

    if (healthScore >= 85) {
      return {
        summary: `Superb somatic state identified! Mapped variables indicate ${weightVerdict} with a highly active ${ageString}. Circulation is synchronized closely with ${pulseVerdict}. Autonomic tone exhibits high parasympathetic balance. Keep up the clean diet and hydration.`,
        dos: [
          "Preserve this excellent metabolic homeostasis! Target 75-80g whole proteins daily.",
          "Perform 150 minutes of weekly Zone-2 cardiovascular exercises (e.g. steady cycling or jogging).",
          "Conduct morning alternate-nostril breathing (Nadi Shodhana) to lock in nervous resilience.",
          "Maintain mineralized hydration with trace organic salts during early mornings."
        ],
        donts: [
          "Avoid late-evening dense carbohydrate triggers to prevent overnight cortisol spikes.",
          "Don't compromise active resting segments - target 7.5 to 8 solid sleep hours.",
          "Limit screen exposure and high-frequency stimulants after sunset.",
          "Do not sit continuously for over 60 minutes without brief 2-minute dynamic stretching."
        ]
      };
    } else if (healthScore >= 60) {
      return {
        summary: `Mild to moderate systemic stress stress detected. At height ${height}cm and weight ${weight}kg, the somatic frame is undergoing ${weightVerdict}. Circulatory checks return ${pulseVerdict}, which when combined with ${stressLevel} neural stress, is promoting arterial strain and cellular fatigue cycles.`,
        dos: [
          "Incorporate organic Turmeric and ginger tea in mornings to calm micro-inflammatory triggers.",
          "Consume potassium-rich items (avocados, leafy greens, coconut water) to balance blood pressure spikes.",
          "Standardize a brisk 15-minute walk directly after your highest carbohydrate meal. ",
          "Use lumbar support belts during prolonged static sitting segments."
        ],
        donts: [
          "Avoid sodium-dense processed foods to check vascular pressure spikes.",
          "Do not skip primary morning meals (mitigates sudden blood glucose fluctuations).",
          "Minimize intense central neural stimulation inside 1 hour of seeking sleep.",
          "Do not exhaust metabolic reserves with high HIIT training on days of high stress."
        ]
      };
    } else {
      return {
        summary: `High priority risk triggers activated. System logs outline ${weightVerdict} with ${pulseVerdict} and high cardiac stress levels. This creates severe vascular strain on your arterial networks, degrades sleep recovery efficiency, and depletes metabolic stamina resources quickly.`,
        dos: [
          "Schedule a prompt clinical follow-up check with your trusted primary physician.",
          "Move toward a strict clean, unprocessed, low-sodium dietary frame immediately.",
          "Practice daily somatic decompression meditation (Yoga Nidra) for 20 minutes.",
          "Consume warm filtered liquids only, avoiding ice-cold fluids during digestive phases."
        ],
        donts: [
          "Strictly avoid extreme high-impact cardiovascular bursts, heavy deadlifts, or hot saunas (prevents sudden coronary events).",
          "Do not take systemic over-the-counter thermogenic stimulants or high-caffeine supplements.",
          "Do not remain in high-stress emotional loops without intentional somatic breath escapes.",
          "Do not sleep under 7 hours; sleep debt directly damages cardiac cellular remodeling bounds."
        ]
      };
    }
  };

  const review = getClinicalReview();
  const organDiag = getOrganDiagnostic();

  // Dynamic colors for hologram modes
  const getGradientForMode = () => {
    switch (scanMode) {
      case "hologram":
        return {
          fill: "rgba(139, 92, 246, 0.15)",
          stroke: "#a78bfa",
          accentGlow: "rgba(139, 92, 246, 0.3)",
          beatingColor: "text-violet-400"
        };
      case "skeletal":
        return {
          fill: "rgba(14, 165, 233, 0.1)",
          stroke: "#38bdf8",
          accentGlow: "rgba(14, 165, 233, 0.35)",
          beatingColor: "text-sky-400"
        };
      case "respiratory":
        return {
          fill: "rgba(20, 184, 166, 0.12)",
          stroke: "#2dd4bf",
          accentGlow: "rgba(20, 184, 166, 0.4)",
          beatingColor: "text-teal-400"
        };
      case "cardio":
        return {
          fill: "rgba(239, 68, 68, 0.12)",
          stroke: "#f87171",
          accentGlow: "rgba(239, 68, 68, 0.4)",
          beatingColor: "text-rose-500"
        };
    }
  };

  const modeParams = getGradientForMode();

  return (
    <div className="w-full text-left" id="cybernetic-avatar-dashboard">
      
      {/* 3-Column Bento Grid Layout for Ultimate Aesthetic Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Column 1: Somatic Variable Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 bg-slate-950/25 border border-white/5 rounded-3xl p-6 backdrop-blur-md justify-between min-h-0">
          
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-violet-400 animate-spin" style={{ animationDuration: "12s" }} />
                <h3 className="text-xs uppercase font-mono font-black text-white tracking-widest leading-none">
                  Somatic Settings
                </h3>
              </div>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-violet-300 hover:text-white bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                title="Reset human scale metrics to optimal medical benchmarks"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Benchmarks
              </button>
            </div>

            {/* Height Selector Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span className="flex items-center gap-2"><Ruler className="h-4 w-4 text-orange-400" /> Height (cm)</span>
                <span className="font-mono font-extrabold text-white text-xs bg-white/5 px-2 py-0.5 rounded border border-white/5">{height} cm</span>
              </div>
              <input 
                type="range"
                min="130"
                max="215"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-violet-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Weight Selector Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span className="flex items-center gap-2"><Scale className="h-4 w-4 text-sky-400" /> Weight (kg)</span>
                <span className="font-mono font-extrabold text-white text-xs bg-white/5 px-2 py-0.5 rounded border border-white/5">{weight} kg</span>
              </div>
              <input 
                type="range"
                min="40"
                max="140"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Age Input Selector Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span className="flex items-center gap-2"><User className="h-4 w-4 text-emerald-400" /> Patient Age</span>
                <span className="font-mono font-extrabold text-white text-xs bg-white/5 px-2 py-0.5 rounded border border-white/5">{age} years</span>
              </div>
              <input 
                type="range"
                min="14"
                max="95"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blood Pressure Input Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-rose-400" /> Peak Systolic (mmHg)</span>
                <span className="font-mono font-extrabold text-white text-xs bg-white/5 px-2 py-0.5 rounded border border-white/5">{systolic} mmHg</span>
              </div>
              <input 
                type="range"
                min="90"
                max="170"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Gender Switch */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block mb-1">Gender Projection Shape</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["male", "female", "nonbinary"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-1.5 px-2 text-[10px] font-bold font-mono rounded-lg border transition-all cursor-pointer capitalize text-center ${
                      gender === g 
                        ? "bg-violet-600/10 border-violet-500 text-white" 
                        : "bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Stress level Selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold block mb-1">Visceral Cortisol Feedback</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["low", "medium", "high"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStressLevel(s)}
                    className={`py-1.5 px-2 text-[10px] font-bold font-mono rounded-lg border transition-all cursor-pointer capitalize text-center ${
                      stressLevel === s 
                        ? s === "low" 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                          : s === "medium"
                            ? "bg-amber-500/10 border-amber-500 text-amber-300"
                            : "bg-rose-500/10 border-rose-500 text-rose-300"
                        : "bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    {s} stress
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Body Index specs stats under sliders */}
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-1.5 mt-4">
            <span className="text-[9px] font-mono tracking-widest text-[#d1d0ce]/40 block uppercase">Real-Time Core Parameters</span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-[9px] text-zinc-500 uppercase font-mono label">Calculated BMI</p>
                <p className="text-sm font-mono font-black text-white mt-0.5">{bmi.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase font-mono label">Vascular Back-Pressure</p>
                <p className="text-sm font-mono font-black text-rose-300 mt-0.5">{systolic - 120 > 0 ? `+${systolic - 120}` : "0"} mmHg</p>
              </div>
            </div>
          </div>

        </div>

        {/* Column 2: Holographic 3D Interactive Cybernetic Avatar */}
        <div className="lg:col-span-4 flex flex-col justify-between border border-white/10 bg-[#06041c]/40 rounded-3xl p-6 min-h-[500px] relative overflow-hidden align-middle">
          
          {/* Laser scanning strip element animated continuously */}
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)] z-10 pointer-events-none animate-[scan-bar_4.5s_infinite_ease-in-out]" 
               style={{
                 animationName: "scanimagemode"
               }}
          />

          <style>{`
            @keyframes scanimagemode {
              0%, 100% { top: 12%; opacity: 0.2; }
              50% { top: 88%; opacity: 0.95; }
            }
          `}</style>
          
          {/* Top header navigation settings overlays */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="text-left font-mono">
              <span className="text-[8px] font-black tracking-widest text-violet-400 uppercase">HOLOGRAPHIC DIAGNOSTIC FEED</span>
              <h4 className="text-xs font-bold text-white mt-1 uppercase flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                {scanMode} Engine Ready
              </h4>
            </div>
            
            <button 
              onClick={() => setIsRotating(!isRotating)}
              className="h-8 w-8 rounded-xl border border-white/10 bg-slate-950/45 text-zinc-400 flex items-center justify-center cursor-pointer transition-colors hover:text-white hover:border-violet-500"
              title={isRotating ? "Mute interactive rotation" : "Engage micro rotation projection"}
            >
              <RefreshCw className={`h-4 w-4 ${isRotating ? "animate-spin" : ""}`} style={{ animationDuration: "11s" }} />
            </button>
          </div>

          {/* Hologram projection field with base rings and nodes */}
          <div className="flex-1 flex items-center justify-center relative my-12">
            
            {/* Base platform ring at feet coordinates */}
            <div className="absolute bottom-1 w-44 h-12 border-2 border-violet-500/25 rounded-full bg-violet-600/5 rotate-x-60 animate-pulse flex items-center justify-center pointer-events-none">
              <div className="w-36 h-9 border border-cyan-400/30 rounded-full" />
              <div className="absolute w-24 h-6 border border-sky-400/40 rounded-full" />
            </div>

            {/* Center grid coordinate line */}
            <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-[1.5px] bg-gradient-to-b from-transparent via-violet-500/10 to-transparent border-dashed pointer-events-none" />

            {/* CLICKABLE Interactive anatomical target overlays arranged floating near key centers */}
            {/* Brain node */}
            <button
              onClick={() => setActiveOrganId("brain")}
              className={`absolute top-[28px] left-[152px] z-30 px-2 py-0.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                activeOrganId === "brain" 
                  ? "bg-violet-600 border-violet-400 text-white shadow-violet-500/20" 
                  : "bg-black/80 border-white/10 text-violet-300 hover:border-violet-500/40"
              }`}
            >
              <span>🧠 CEREBRAL</span>
              {activeOrganId === "brain" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            {/* Heart node */}
            <button
              onClick={() => setActiveOrganId("heart")}
              className={`absolute top-[82px] left-[152px] z-30 px-2 py-0.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                activeOrganId === "heart" 
                  ? "bg-rose-600 border-rose-400 text-white shadow-rose-500/20" 
                  : "bg-black/80 border-white/10 text-rose-300 hover:border-rose-500/40"
              }`}
            >
              <span>❤️ CARDIAC</span>
              {activeOrganId === "heart" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            {/* Lungs node */}
            <button
              onClick={() => setActiveOrganId("lungs")}
              className={`absolute top-[108px] left-[10px] z-30 px-2 py-0.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                activeOrganId === "lungs" 
                  ? "bg-teal-600 border-teal-400 text-white shadow-teal-500/20" 
                  : "bg-black/80 border-white/10 text-teal-300 hover:border-teal-500/40"
              }`}
            >
              <span>🫁 PULMONARY</span>
              {activeOrganId === "lungs" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            {/* Visceral organ node */}
            <button
              onClick={() => setActiveOrganId("liver")}
              className={`absolute top-[152px] left-[152px] z-30 px-2 py-0.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                activeOrganId === "liver" 
                  ? "bg-amber-600 border-amber-400 text-white shadow-amber-500/20" 
                  : "bg-black/80 border-white/10 text-amber-300 hover:border-amber-500/40"
              }`}
            >
              <span>🥝 VISCERAL</span>
              {activeOrganId === "liver" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            {/* Knee joints node */}
            <button
              onClick={() => setActiveOrganId("joints")}
              className={`absolute top-[215px] left-[20px] z-30 px-2 py-0.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md ${
                activeOrganId === "joints" 
                  ? "bg-sky-600 border-sky-400 text-white shadow-sky-500/20" 
                  : "bg-black/80 border-white/10 text-sky-400 hover:border-sky-500/40"
              }`}
            >
              <span>🦴 JOINT FLEX</span>
              {activeOrganId === "joints" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            {/* Layered Cybernetic Body Shell Wrapper */}
            <div 
              className={`w-40 h-[260px] relative flex items-center justify-center transition-all ${auraGlow}`}
              style={{
                perspective: "600px"
              }}
            >
              {/* Dynamic transformations matching height, weight, rotation state */}
              <div
                className="w-full h-full relative transition-transform duration-100 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${rotationY}deg) scale(${scaleX}, ${scaleY})`
                }}
              >
                {/* Visual Body Path Silhouette */}
                <svg className="h-[250px] opacity-90 mx-auto" viewBox="0 0 100 200" fill="none">
                  {/* Defs */}
                  <defs>
                    <linearGradient id="bodyMeshGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={modeParams.stroke} stopOpacity="0.4" />
                      <stop offset="50%" stopColor={modeParams.stroke} stopOpacity="0.1" />
                      <stop offset="100%" stopColor={modeParams.stroke} stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Scaled Human Head */}
                  <path 
                    d="M50,12 C43,12 37,17 37,25 C37,33 42,38 50,38 C58,38 63,33 63,25 C63,17 57,12 50,12 Z" 
                    fill={activeOrganId === "brain" ? "rgba(168, 85, 247, 0.4)" : modeParams.fill} 
                    className="transition-all"
                    stroke={activeOrganId === "brain" ? "#db2777" : modeParams.stroke} 
                    strokeWidth="1.3" 
                  />
                  
                  {/* Active node flash for brain */}
                  <circle cx="50" cy="24" r="5" className={`animate-pulse ${activeOrganId === "brain" ? "fill-rose-500" : "fill-violet-400/40"}`} />

                  {/* Body Neck */}
                  <path d="M47,38 L47,46 L53,46 L53,38 Z" fill={modeParams.fill} stroke={modeParams.stroke} strokeWidth="1" />

                  {/* Detailed Contoured Chest Pectorals & Abdominal trunk */}
                  <path 
                    d="M30,46 C25,48 24,53 28,58 C32,63 35,70 35,80 C35,90 33,96 32,102 C31,108 34,115 41,115 L59,115 C66,115 69,108 68,102 C67,96 65,90 65,80 C65,70 68,63 72,58 C76,53 75,48 70,46 Z" 
                    fill="url(#bodyMeshGlow)" 
                    stroke={modeParams.stroke} 
                    strokeWidth="1.6" 
                  />

                  {/* Internal grid line ribs */}
                  <path d="M50,48 L50,111" stroke={modeParams.stroke} strokeWidth="1" strokeOpacity="0.6" />
                  <path d="M37,59 Q50,66 63,59" stroke={modeParams.stroke} strokeWidth="1" strokeOpacity="0.5" fill="none" />
                  <path d="M35,72 Q50,80 65,72" stroke={modeParams.stroke} strokeWidth="1" strokeOpacity="0.4" fill="none" />
                  <path d="M34,85 Q50,93 66,85" stroke={modeParams.stroke} strokeWidth="1" strokeOpacity="0.3" fill="none" />

                  {/* Cardiac organ node mapping inside trunk */}
                  <circle 
                    cx="50" 
                    cy="68" 
                    r={activeOrganId === "heart" ? "7" : "4.5"} 
                    className={`transition-all ${activeOrganId === "heart" ? "fill-rose-500 animate-ping" : "fill-rose-400"}`} 
                    stroke="#fff" 
                    strokeWidth="0.8" 
                  />

                  {/* Lungs overlay representation */}
                  <path 
                    d="M48,60 C48,78 34,78 34,60 Z" 
                    fill={activeOrganId === "lungs" ? "rgba(20, 184, 166, 0.45)" : "none"} 
                    stroke="#2dd4bf" 
                    strokeWidth="0.8" 
                    strokeOpacity="0.5"
                  />
                  <path 
                    d="M52,60 C52,78 66,78 66,60 Z" 
                    fill={activeOrganId === "lungs" ? "rgba(20, 184, 166, 0.45)" : "none"} 
                    stroke="#2dd4bf" 
                    strokeWidth="0.8" 
                    strokeOpacity="0.5"
                  />

                  {/* Visceral liver schematic overlay */}
                  <path 
                    d="M40,88 Q50,96 60,86 L58,98 H41 Z" 
                    fill={activeOrganId === "liver" ? "rgba(245, 158, 11, 0.45)" : "none"} 
                    stroke="#f59e0b" 
                    strokeWidth="0.8" 
                    strokeOpacity="0.5"
                  />

                  {/* Left Contoured Arm */}
                  <path d="M28,48 C22,54 18,65 17,76 C16,84 18,92 21,98 M22,106 C21,114 19,122 17,130 C16,134 18,137 21,136" stroke={modeParams.stroke} strokeWidth="1.2" fill="none" />

                  {/* Right Contoured Arm */}
                  <path d="M72,48 C78,54 82,65 83,76 C84,84 82,92 79,98 M78,106 C79,114 81,122 83,130 C84,134 82,137 79,136" stroke={modeParams.stroke} strokeWidth="1.2" fill="none" />

                  {/* Contoured Left Leg */}
                  <path d="M35,115 C30,128 29,142 30,154 C31,162 33,165 33,170 C33,178 30,186 29,194" stroke={modeParams.stroke} strokeWidth="1.3" fill="none" />
                  
                  {/* Knee joint highlight node */}
                  <circle cx="33" cy="165" r={activeOrganId === "joints" ? "4.5" : "2.5"} className={activeOrganId === "joints" ? "fill-sky-400 animate-ping" : "fill-[#38bdf8]"} />

                  {/* Contoured shadow Right Leg */}
                  <path d="M65,115 C70,128 71,142 70,154 C69,162 67,165 67,170 C67,178 70,186 71,194" stroke={modeParams.stroke} strokeWidth="1.3" fill="none" />
                  
                  {/* Right Knee joint highlight */}
                  <circle cx="67" cy="165" r={activeOrganId === "joints" ? "4.5" : "2.5"} className={activeOrganId === "joints" ? "fill-sky-400 animate-ping" : "fill-[#38bdf8]"} />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Hologram Scan Modes Segmented selector controller options */}
          <div className="space-y-3 z-10">
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 block uppercase text-center font-bold">Select Active Hologram Channel</span>
            
            <div className="grid grid-cols-4 gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {[
                { id: "hologram", label: "Holo", color: "text-violet-400" },
                { id: "skeletal", label: "X-Ray", color: "text-sky-400" },
                { id: "respiratory", label: "Pulm", color: "text-teal-400" },
                { id: "cardio", label: "Cardio", color: "text-red-400" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setScanMode(mode.id as any)}
                  className={`py-2 px-1 text-[10px] font-mono font-bold rounded-xl transition-all capitalize cursor-pointer text-center ${
                    scanMode === mode.id 
                      ? "bg-white/10 text-white shadow-md border border-white/10" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Composite health score overlay panel */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div className="text-left">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Score Index</span>
                <span className={`text-lg font-mono font-black ${statusColor}`}>{healthScore} <span className="text-[10px] text-zinc-500">/ 100</span></span>
              </div>
              <span className={`text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${statusBg} ${statusColor}`}>
                {matchCategory}
              </span>
            </div>
          </div>

        </div>

        {/* Column 3: Diagnostic organ feedback & Best Clinical recommendations */}
        <div className="lg:col-span-4 flex flex-col gap-6 justify-between min-h-0">
          
          {/* Diagnostic console feedback */}
          <div className="border border-white/5 bg-gray-950/25 p-5 rounded-3xl space-y-3 flex flex-col justify-between flex-1">
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest flex items-center justify-between border-b border-white/5 pb-2">
                <span>⚡ Interactive Telemetry Scan</span>
                <span className="text-[14px]" role="img" aria-label="organ-icon">{organDiag?.icon}</span>
              </h4>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white tracking-normal font-sans">{organDiag?.title}</h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-1 font-sans">
                  {organDiag?.summary}
                </p>
              </div>

              {/* Localized metrics variables */}
              <div className="space-y-1.5 pt-2">
                {organDiag?.metrics.map((m, idx) => (
                  <div key={idx} className="bg-white/[0.01] border border-white/5 px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 text-[10px]">{m.label}:</span>
                    <strong className={`font-bold ${m.state === "high" ? "text-rose-400" : "text-white"}`}>{m.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[9px] text-zinc-500 font-mono text-left leading-normal pt-2 border-t border-white/5">
              *Hologram projection represents somatic mathematical models. Avoid replacing formal clinical prescriptions.
            </p>
          </div>

          {/* Best Clinical Activities to DO (Indian medical focus) */}
          <div className="bg-emerald-950/15 border border-emerald-920/15 rounded-3xl p-5 text-left space-y-2">
            <h4 className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              ✓ Patient Action Directives (DOs)
            </h4>
            
            <div className="space-y-2">
              {review.dos.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[10.5px]">
                  <span className="text-emerald-400 font-sans font-bold leading-none mt-1">✓</span>
                  <p className="font-sans text-emerald-100/90 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Things to Avoid (DON'Ts) */}
          <div className="bg-rose-950/15 border border-rose-920/15 rounded-3xl p-5 text-left space-y-2">
            <h5 className="text-xs font-mono font-extrabold text-rose-450 uppercase tracking-wider flex items-center gap-2 text-rose-450">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              ✗ Lifestyle Restrictions (DONTs)
            </h5>
            
            <div className="space-y-2">
              {review.donts.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[10.5px]">
                  <span className="text-rose-500 font-sans font-bold leading-none mt-1">✗</span>
                  <p className="font-sans text-rose-100/90 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
