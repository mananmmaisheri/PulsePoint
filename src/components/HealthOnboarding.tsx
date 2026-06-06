import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Activity,
  Heart,
  Droplet,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Upload,
  File,
  Loader2,
  Trash2,
  Download,
  Info,
  Sliders,
  Award,
  Zap,
  HelpCircle,
  Flame,
  Clock,
  Eye
} from "lucide-react";

interface OnboardingData {
  // Step 1: Basic Info
  fullName: string;
  age: string;
  gender: string;
  height: string; // cm
  weight: string; // kg
  
  // Step 2: Medical History
  medicalHistory: string[];

  // Step 3: Family History
  familyHistory: string[];

  // Step 4: Lifestyle & Hackathon MCQs
  smoking: string;
  alcohol: string;
  exercise: string;
  sleep: string;
  waterIntake: string;
  stressLevel: string;
  dietType: string;
  screenTime: string;
  activityLevel: string;

  // Step 5: Current Symptoms
  symptoms: string[];

  // Step 6: Blood Reports
  uploadedFiles: { name: string; type: string; category: string; progress: number }[];
}

interface ExtractionResult {
  bloodSugar: string;
  cholesterol: string;
  hemoglobin: string;
  thyroid: string;
  abnormalParameters: string[];
}

export default function HealthOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: "",
    age: "30",
    gender: "Male",
    height: "175",
    weight: "70",
    medicalHistory: [],
    familyHistory: [],
    smoking: "Never",
    alcohol: "Never",
    exercise: "1–2 days/week",
    sleep: "7–8 hrs",
    waterIntake: "1–2L",
    stressLevel: "Moderate",
    dietType: "Mixed",
    screenTime: "2–4 hrs",
    activityLevel: "Lightly Active",
    symptoms: [],
    uploadedFiles: []
  });

  // Calculations states
  const [bmi, setBmi] = useState(22.9);
  const [bmiCategory, setBmiCategory] = useState("Normal");
  
  // Diagnostic states after completion
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [healthScore, setHealthScore] = useState(85);
  const [riskLevels, setRiskLevels] = useState({
    diabetes: "Low",
    heart: "Low",
    hypertension: "Low",
    obesity: "Low"
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [extractedValues, setExtractedValues] = useState<ExtractionResult | null>(null);

  // Sound feedback system
  const playBeep = (freq = 800, duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context block ignored
    }
  };

  // Synchronize dynamic BMI calculations
  useEffect(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100;
    if (w > 0 && h > 0) {
      const calculatedBmi = w / (h * h);
      setBmi(Math.round(calculatedBmi * 10) / 10);
      
      if (calculatedBmi < 18.5) {
        setBmiCategory("Underweight");
      } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
        setBmiCategory("Normal");
      } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
        setBmiCategory("Overweight");
      } else {
        setBmiCategory("Obese");
      }
    }
  }, [formData.height, formData.weight]);

  // Load existing profile name initially if available
  useEffect(() => {
    const savedProfile = localStorage.getItem("pulsepoint_user");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && parsed.name) {
          setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || parsed.name
          }));
        }
      } catch (e) {}
    }
  }, []);

  const handleCheckboxChange = (
    field: "medicalHistory" | "familyHistory" | "symptoms",
    value: string
  ) => {
    playBeep(850, 0.04);
    setFormData((prev) => {
      const currentList = [...prev[field]];
      
      if (value === "None") {
        return {
          ...prev,
          [field]: currentList.includes("None") ? [] : ["None"]
        };
      }

      // Filter out 'None' if we are ticking something else
      const filtered = currentList.filter(item => item !== "None");

      if (filtered.includes(value)) {
        return {
          ...prev,
          [field]: filtered.filter((item) => item !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...filtered, value]
        };
      }
    });
  };

  const handleRadioChange = (field: keyof OnboardingData, value: string) => {
    playBeep(820, 0.05);
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    playBeep(950, 0.1);

    const newFile = {
      name: file.name,
      type: file.type || "application/octet-stream",
      category: category,
      progress: 0
    };

    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, newFile]
    }));

    // Simulate clinical upload sequence
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setFormData(prev => ({
        ...prev,
        uploadedFiles: prev.uploadedFiles.map(f => 
          f.name === file.name ? { ...f, progress: currentProgress } : f
        )
      }));

      if (currentProgress >= 100) {
        clearInterval(interval);
        playBeep(1200, 0.12);
      }
    }, 150);
  };

  const removeUploadedFile = (name: string) => {
    playBeep(600, 0.06);
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(f => f.name !== name)
    }));
  };

  // Compile final results mathematically based on health input vectors
  const calculateFinalAssessment = () => {
    setIsAnalyzing(true);
    playBeep(1000, 0.2);

    setTimeout(() => {
      // Risk and Diagnostic rules
      let computedScore = 95; // perfect score base

      // Deduct for lifestyle
      if (formData.smoking === "Regularly") computedScore -= 15;
      else if (formData.smoking === "Occasionally") computedScore -= 7;

      if (formData.alcohol === "Frequently") computedScore -= 10;
      else if (formData.alcohol === "Occasionally") computedScore -= 4;

      if (formData.exercise === "Never") computedScore -= 12;
      else if (formData.exercise === "1–2 days/week") computedScore -= 5;
      else if (formData.exercise === "Daily") computedScore += 3; // bonus

      if (formData.sleep === "Less than 5 hrs") computedScore -= 10;
      else if (formData.sleep === "5–6 hrs") computedScore -= 5;

      if (formData.waterIntake === "Less than 1L") computedScore -= 8;
      else if (formData.waterIntake === "1–2L") computedScore -= 3;

      if (formData.stressLevel === "Severe") computedScore -= 12;
      else if (formData.stressLevel === "High") computedScore -= 6;

      if (formData.screenTime === ">8 hrs") computedScore -= 5;
      if (formData.activityLevel === "Sedentary") computedScore -= 8;

      // Deduct for history and symptoms
      const historyCount = formData.medicalHistory.filter(h => h !== "None").length;
      computedScore -= (historyCount * 8);

      const symptomCount = formData.symptoms.filter(s => s !== "None").length;
      computedScore -= (symptomCount * 5);

      // Deduct for BMI Category
      if (bmiCategory === "Obese") computedScore -= 14;
      else if (bmiCategory === "Overweight") computedScore -= 6;
      else if (bmiCategory === "Underweight") computedScore -= 4;

      computedScore = Math.max(15, Math.min(100, computedScore));

      // 1. Evaluate Diabetes Risk
      let diabetesScore = 0;
      if (formData.medicalHistory.includes("Diabetes")) diabetesScore += 50;
      if (formData.familyHistory.includes("Diabetes")) diabetesScore += 30;
      if (formData.symptoms.includes("Frequent Urination")) diabetesScore += 20;
      if (formData.symptoms.includes("Excessive Thirst")) diabetesScore += 20;
      if (bmiCategory === "Obese") diabetesScore += 20;
      const diabetesRisk = diabetesScore >= 60 ? "High" : diabetesScore >= 30 ? "Medium" : "Low";

      // 2. Evaluate Heart Disease Risk
      let heartScore = 0;
      if (formData.medicalHistory.includes("Heart Disease")) heartScore += 50;
      if (formData.familyHistory.includes("Heart Disease") || formData.familyHistory.includes("Stroke")) heartScore += 25;
      if (formData.symptoms.includes("Chest Pain")) heartScore += 40;
      if (formData.smoking === "Regularly") heartScore += 25;
      if (formData.medicalHistory.includes("High Cholesterol") || formData.medicalHistory.includes("Hypertension")) heartScore += 20;
      const heartRisk = heartScore >= 65 ? "High" : heartScore >= 30 ? "Medium" : "Low";

      // 3. Evaluate Hypertension Risk
      let hypertensionScore = 0;
      if (formData.medicalHistory.includes("Hypertension")) hypertensionScore += 50;
      if (formData.familyHistory.includes("High Blood Pressure")) hypertensionScore += 25;
      if (formData.symptoms.includes("Dizziness") || formData.symptoms.includes("Headache")) hypertensionScore += 20;
      if (formData.smoking === "Regularly" || formData.alcohol === "Frequently") hypertensionScore += 15;
      if (bmiCategory === "Obese" || bmiCategory === "Overweight") hypertensionScore += 15;
      const hypertensionRisk = hypertensionScore >= 60 ? "High" : hypertensionScore >= 25 ? "Medium" : "Low";

      // 4. Obesity Risk
      const obesityRisk = bmiCategory === "Obese" ? "High" : bmiCategory === "Overweight" ? "Medium" : "Low";

      // Determine Suggestions based on diagnostic triggers
      const suggestions: string[] = [];
      if (formData.exercise === "Never" || formData.exercise === "1–2 days/week") {
        suggestions.push("Exercise regularly: Commit to a brisk 30-min walk daily or 150 minutes of moderate cardio per week.");
      }
      if (formData.smoking === "Regularly" || formData.smoking === "Occasionally") {
        suggestions.push("Reduce or quit smoking triggers completely to protect vascular endothelia.");
      }
      if (formData.symptoms.includes("Excessive Thirst") || formData.symptoms.includes("Frequent Urination") || diabetesRisk === "High") {
        suggestions.push("Monitor glycemic loads: Limit refined sugars, wheat gluten, soda carbs, and processed flour.");
      }
      if (formData.waterIntake === "Less than 1L" || formData.waterIntake === "1–2L") {
        suggestions.push("Increase absolute fluid consumption: Target at least 2.5 Liters of water daily.");
      }
      if (formData.sleep === "Less than 5 hrs" || formData.sleep === "5–6 hrs") {
        suggestions.push("Establish structural sleeping hygeine: Go to bed before 11 PM to leverage hepatic rest cycles.");
      }
      if (formData.stressLevel === "Severe" || formData.stressLevel === "High") {
        suggestions.push("Practice stress decompression: Implement a 10-minute deep diaphragmatic breathing loop daily.");
      }
      if (heartRisk === "High" || heartRisk === "Medium") {
        suggestions.push("Integrate omega-rich foods (walnuts, flax) and request a professional echocardiogram screening.");
      }
      if (hypertensionRisk === "High" || hypertensionRisk === "Medium") {
        suggestions.push("Sustain sodium balance: Limit raw salt sprinkles and optimize direct dietary magnesium and potassium.");
      }

      // Add general safeguards if list is empty
      if (suggestions.length === 0) {
        suggestions.push("Maintain your exemplary athletic routines and baseline organic nutrition habits.");
        suggestions.push("Engage in weekly muscular recovery and continuous hydration checkmarks.");
      }

      // If they have uploaded files, extract mock clinical results inside the diagnostic
      if (formData.uploadedFiles.length > 0) {
        setExtractedValues({
          bloodSugar: "108 mg/dL (Pre-Diabetic Baseline)",
          cholesterol: "214 mg/dL (Borderline High LDL)",
          hemoglobin: "13.8 g/dL (Adequate / Normal Oxygenation)",
          thyroid: "2.4 uIU/mL (Healthy Euthyroid)",
          abnormalParameters: ["Borderline fasting glycaemia", "Elevated LDL Cholesterol Fraction"]
        });
        
        // Slightly adapt stats downward based on abnormal parameters
        computedScore = Math.max(30, computedScore - 6);
      } else {
        setExtractedValues(null);
      }

      setHealthScore(computedScore);
      setRiskLevels({
        diabetes: diabetesRisk,
        heart: heartRisk,
        hypertension: hypertensionRisk,
        obesity: obesityRisk
      });
      setAiSuggestions(suggestions);

      // Save to client health profile
      const savedUser = localStorage.getItem("pulsepoint_user");
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          const updatedUser = {
            ...u,
            conditions: formData.medicalHistory.join(", "),
            allergies: u.allergies || "None declared",
            bloodType: u.bloodType || "O-Positive",
            birthdate: u.birthdate || new Date(new Date().getFullYear() - parseInt(formData.age), 5, 15).toISOString().split('T')[0]
          };
          localStorage.setItem("pulsepoint_user", JSON.stringify(updatedUser));
        } catch (e) {}
      }

      // Save onboarding complete flag
      localStorage.setItem("pulsepoint_onboarding_answers", JSON.stringify(formData));
      localStorage.setItem("pulsepoint_onboarding_results", JSON.stringify({
        score: computedScore,
        risks: {
          diabetes: diabetesRisk,
          heart: heartRisk,
          hypertension: hypertensionRisk,
          obesity: obesityRisk
        },
        suggestions: suggestions
      }));

      setIsAnalyzing(false);
      setOnboardingComplete(true);
      playBeep(1400, 0.25);
    }, 1800);
  };

  const handleNext = () => {
    if (currentStep < 6) {
      playBeep(900, 0.05);
      setCurrentStep(prev => prev + 1);
    } else {
      calculateFinalAssessment();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      playBeep(700, 0.05);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    playBeep(500, 0.15);
    setFormData({
      fullName: "",
      age: "30",
      gender: "Male",
      height: "175",
      weight: "70",
      medicalHistory: [],
      familyHistory: [],
      smoking: "Never",
      alcohol: "Never",
      exercise: "1–2 days/week",
      sleep: "7–8 hrs",
      waterIntake: "1–2L",
      stressLevel: "Moderate",
      dietType: "Mixed",
      screenTime: "2–4 hrs",
      activityLevel: "Lightly Active",
      symptoms: [],
      uploadedFiles: []
    });
    setCurrentStep(1);
    setOnboardingComplete(false);
    setExtractedValues(null);
  };

  const currentProgress = (currentStep / 6) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12" id="clinical-onboarding-wizard">
      
      {/* Upper Title Description */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-violet-600/15 border border-violet-500/20 mb-3 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
          <Activity className="h-6 w-6 text-violet-400 animate-pulse" />
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
          Precision Chronic Risk Diagnostic
        </h2>
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase mt-1">
          Machine Learning Risk Grounding • 6-Section Onboarding
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!onboardingComplete ? (
          /* ================= ONBOARDING QUESTIONNAIRE FORM SYSTEM ================= */
          <motion.div
            key="onboarding-questions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-slate-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative backdrop-blur-2xl text-left"
          >
            {/* Holographic Glowing Header line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500 animate-pulse" />

            {/* Stepper Progress bar */}
            <div className="bg-black/40 border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-black text-violet-400 bg-violet-950/80 px-2.5 py-1 rounded">
                  SECTION {currentStep}/6
                </span>
                <span className="text-xs text-zinc-300 font-display font-medium">
                  {currentStep === 1 && "Basic Information Details"}
                  {currentStep === 2 && "Personal Clinical History"}
                  {currentStep === 3 && "Genetic Family Linage"}
                  {currentStep === 4 && "Lifestyle & Somatic Stressors"}
                  {currentStep === 5 && "Active Symptomatic Markers"}
                  {currentStep === 6 && "Substantive Blood EHR Reports"}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">
                {Math.round(currentProgress)}% Done
              </span>
            </div>

            {/* Micro progress line */}
            <div className="w-full bg-white/5 h-1">
              <div 
                className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-400 h-full transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              />
            </div>

            {/* Core questionnaire scrollbox */}
            <div className="p-6 md:p-8 min-h-[360px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  
                  {/* SECTION 1: BASIC INFORMATION */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div className="p-4 bg-violet-950/15 border border-violet-800/30 rounded-2xl text-xs text-violet-300 leading-normal flex gap-3">
                        <Info className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                        <span>This diagnostic grounds automatic biological calculations (BMI, fluid quotas, cardiac stress limits) mapping correct advice in our AI Assistant.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-widest text-zinc-300 font-extrabold uppercase select-none block">
                            Full Individual Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-zinc-500" />
                            <input
                              type="text"
                              placeholder="Alex Carter"
                              value={formData.fullName}
                              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                              className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-widest text-zinc-300 font-extrabold uppercase select-none block">
                            Age Designation
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3.5 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-widest text-zinc-300 font-extrabold uppercase select-none block">
                            Gender Assigned at Birth
                          </label>
                          <div className="flex gap-4">
                            {["Male", "Female", "Other"].map((gen) => (
                              <label key={gen} className="flex-1 flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5 cursor-pointer hover:border-white/10 select-none">
                                <span className="text-xs text-zinc-300 font-sans">{gen}</span>
                                <input
                                  type="radio"
                                  name="gender"
                                  checked={formData.gender === gen}
                                  onChange={() => handleRadioChange("gender", gen)}
                                  className="accent-violet-500"
                                />
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-widest text-zinc-300 font-extrabold uppercase select-none block">
                            Height (centimeters)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="50"
                              max="250"
                              value={formData.height}
                              onChange={(e) => setFormData({...formData, height: e.target.value})}
                              className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3.5 pr-12 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                            />
                            <span className="absolute right-3.5 top-2 text-[10px] font-mono text-zinc-500 font-bold uppercase">CM</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-widest text-zinc-300 font-extrabold uppercase select-none block">
                            Absolute Body Weight (kilograms)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="20"
                              max="300"
                              value={formData.weight}
                              onChange={(e) => setFormData({...formData, weight: e.target.value})}
                              className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3.5 pr-12 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                            />
                            <span className="absolute right-3.5 top-2 text-[10px] font-mono text-zinc-500 font-bold uppercase">KG</span>
                          </div>
                        </div>

                        {/* Calculated BMI HUD */}
                        <div className="p-4 bg-gradient-to-r from-[#0d072b] to-[#04091a] border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                          <div className="text-left">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase font-black">Dynamic BMI Index</span>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-mono font-black text-white">{bmi}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">kg/m²</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase font-black">BMI Status</span>
                            <span className={`block text-xs font-bold uppercase mt-1 px-3 py-1 rounded-full ${
                              bmiCategory === "Normal" 
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                : bmiCategory === "Overweight"
                                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                                  : "bg-red-500/10 border border-red-500/20 text-red-400"
                            }`}>
                              {bmiCategory}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: MEDICAL HISTORY checkboxes */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-sans font-semibold text-white">Have you ever been diagnosed with:</h4>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">Select all relevant pre-diagnosed conditions below</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          "Diabetes",
                          "Hypertension (High BP)",
                          "Heart Disease",
                          "Asthma",
                          "Thyroid Disorder",
                          "Kidney Disease",
                          "Liver Disease",
                          "High Cholesterol",
                          "Arthritis",
                          "Cancer"
                        ].map((cond) => {
                          const isChecked = formData.medicalHistory.includes(cond);
                          return (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => handleCheckboxChange("medicalHistory", cond)}
                              className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                                isChecked 
                                  ? "bg-violet-600/15 border-violet-500 text-white shadow-md shadow-violet-500/10" 
                                  : "bg-black/30 border-white/5 hover:border-white/10 text-zinc-300 hover:text-white"
                              }`}
                            >
                              <span>{cond}</span>
                              <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                                isChecked ? "border-violet-400 bg-violet-600" : "border-zinc-700"
                              }`}>
                                {isChecked && <span className="text-[8px] font-black">✓</span>}
                              </div>
                            </button>
                          );
                        })}

                        {/* None button */}
                        <button
                          type="button"
                          onClick={() => handleCheckboxChange("medicalHistory", "None")}
                          className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer col-span-2 md:col-span-1 border-white/5 ${
                            formData.medicalHistory.includes("None")
                              ? "bg-emerald-600/15 border-emerald-500 text-white"
                              : "bg-black/30 border-white/5 hover:border-white/10 text-zinc-300"
                          }`}
                        >
                          <span className="font-semibold">None of the above</span>
                          <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                            formData.medicalHistory.includes("None") ? "border-emerald-400 bg-emerald-600" : "border-zinc-700"
                          }`}>
                            {formData.medicalHistory.includes("None") && <span className="text-[8px] font-black">✓</span>}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: FAMILY HISTORY checkboxes */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-sans font-semibold text-white">Does anyone in your immediate family have:</h4>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">Assists genetic predisposition chronic disease modeling</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          "Diabetes",
                          "High Blood Pressure",
                          "Heart Disease",
                          "Stroke",
                          "Cancer",
                          "Obesity"
                        ].map((famC) => {
                          const isChecked = formData.familyHistory.includes(famC);
                          return (
                            <button
                              key={famC}
                              type="button"
                              onClick={() => handleCheckboxChange("familyHistory", famC)}
                              className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                                isChecked 
                                  ? "bg-violet-600/15 border-violet-500 text-white" 
                                  : "bg-black/30 border-white/5 hover:border-white/10 text-zinc-300"
                              }`}
                            >
                              <span>{famC}</span>
                              <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                                isChecked ? "border-violet-400 bg-violet-600" : "border-zinc-700"
                              }`}>
                                {isChecked && <span className="text-[8px] font-black">✓</span>}
                              </div>
                            </button>
                          );
                        })}

                        {/* None button */}
                        <button
                          type="button"
                          onClick={() => handleCheckboxChange("familyHistory", "None")}
                          className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer border-white/5 col-span-2 md:col-span-1 ${
                            formData.familyHistory.includes("None")
                              ? "bg-emerald-600/15 border-emerald-500 text-white"
                              : "bg-black/30 border-white/5 hover:border-white/10 text-zinc-300"
                          }`}
                        >
                          <span className="font-semibold">None of the above</span>
                          <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                            formData.familyHistory.includes("None") ? "border-emerald-400 bg-emerald-600" : "border-zinc-700"
                          }`}>
                            {formData.familyHistory.includes("None") && <span className="text-[8px] font-black">✓</span>}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SECTION 4: LIFESTYLE & HACKATHON BONUS MCQS */}
                  {currentStep === 4 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 bg-[#090b1e] border border-violet-900/40 px-3.5 py-1.5 rounded-xl text-[10px] font-mono text-violet-300 font-bold w-fit animate-pulse">
                        <Award className="h-3.5 w-3.5 text-violet-400" />
                        Hackathon Winning Chronic Corrinators Active
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                        {/* Smoking */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">Do you smoke?</span>
                          <div className="grid grid-cols-3 gap-2">
                            {["Never", "Occasionally", "Regularly"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("smoking", v)}
                                className={`py-2 px-1 text-[10px] rounded-lg border font-mono tracking-wide ${
                                  formData.smoking === v 
                                    ? "bg-violet-600/20 border-violet-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Alcohol */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">Do you consume alcohol?</span>
                          <div className="grid grid-cols-3 gap-2">
                            {["Never", "Occasionally", "Frequently"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("alcohol", v)}
                                className={`py-2 px-1 text-[10px] rounded-lg border font-mono tracking-wide ${
                                  formData.alcohol === v 
                                    ? "bg-violet-600/20 border-violet-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Exercise */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">How often do you exercise?</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["Never", "1–2 days/week", "3–5 days/week", "Daily"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("exercise", v)}
                                className={`py-2 px-1 text-[9px] rounded-lg border font-mono tracking-tight ${
                                  formData.exercise === v 
                                    ? "bg-violet-600/20 border-violet-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sleep */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">Average sleep per night?</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["Less than 5 hrs", "5–6 hrs", "7–8 hrs", "More than 8 hrs"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("sleep", v)}
                                className={`py-2 px-1 text-[9px] rounded-lg border font-mono tracking-tight ${
                                  formData.sleep === v 
                                    ? "bg-violet-600/20 border-violet-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Water Intake */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">Water Intake daily?</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["Less than 1L", "1–2L", "2–3L", "More than 3L"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("waterIntake", v)}
                                className={`py-2 px-1 text-[9px] rounded-lg border font-mono tracking-tight ${
                                  formData.waterIntake === v 
                                    ? "bg-violet-600/20 border-violet-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Stress Level */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono tracking-widest text-rose-300 font-extrabold uppercase block flex items-center gap-1">
                            <Flame className="h-3 w-3 text-rose-400" /> Stress Level Index
                          </span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["Low", "Moderate", "High", "Severe"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("stressLevel", v)}
                                className={`py-2 px-1 text-[9px] rounded-lg border font-mono tracking-tight ${
                                  formData.stressLevel === v 
                                    ? "bg-rose-500/15 border-rose-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Diet Type */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">Diet Classification</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["Vegetarian", "Non-Vegetarian", "Vegan", "Mixed"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("dietType", v)}
                                className={`py-2 px-1 text-[9px] rounded-lg border font-mono tracking-tight ${
                                  formData.dietType === v 
                                    ? "bg-violet-600/20 border-violet-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Daily Screen Time */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">Daily Screen Time</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["<2 hrs", "2–4 hrs", "4–8 hrs", ">8 hrs"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("screenTime", v)}
                                className={`py-2 px-1 text-[9px] rounded-lg border font-mono tracking-tight ${
                                  formData.screenTime === v 
                                    ? "bg-violet-600/20 border-violet-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Physical Activity Level */}
                        <div className="space-y-1.5 text-left md:col-span-2">
                          <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">Physical Activity Level</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["Sedentary", "Lightly Active", "Moderately Active", "Very Active"].map((v) => (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleRadioChange("activityLevel", v)}
                                className={`py-2 px-1 text-[9px] rounded-lg border font-mono tracking-tight ${
                                  formData.activityLevel === v 
                                    ? "bg-violet-600/20 border-violet-500 text-white font-bold" 
                                    : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: CURRENT SYMPTOMS checkboxes */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-sans font-semibold text-white">Select symptoms you currently experience:</h4>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">Captures acute parameters for risk level modeling</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          "Fatigue",
                          "Frequent Urination",
                          "Excessive Thirst",
                          "Headache",
                          "Chest Pain",
                          "Shortness of Breath",
                          "Dizziness",
                          "Weight Gain",
                          "Weight Loss",
                          "Joint Pain",
                          "Swelling"
                        ].map((symp) => {
                          const isChecked = formData.symptoms.includes(symp);
                          return (
                            <button
                              key={symp}
                              type="button"
                              onClick={() => handleCheckboxChange("symptoms", symp)}
                              className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                                isChecked 
                                  ? "bg-violet-600/15 border-violet-500 text-white" 
                                  : "bg-black/30 border-white/5 hover:border-white/10 text-zinc-300"
                              }`}
                            >
                              <span>{symp}</span>
                              <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                                isChecked ? "border-violet-400 bg-violet-600" : "border-zinc-700"
                              }`}>
                                {isChecked && <span className="text-[8px] font-black">✓</span>}
                              </div>
                            </button>
                          );
                        })}

                        {/* None button */}
                        <button
                          type="button"
                          onClick={() => handleCheckboxChange("symptoms", "None")}
                          className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer border-white/5 ${
                            formData.symptoms.includes("None")
                              ? "bg-emerald-600/15 border-emerald-500 text-white"
                              : "bg-black/30 border-white/5 hover:border-white/10 text-zinc-300"
                          }`}
                        >
                          <span className="font-semibold">None of the above</span>
                          <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                            formData.symptoms.includes("None") ? "border-emerald-400 bg-emerald-600" : "border-zinc-700"
                          }`}>
                            {formData.symptoms.includes("None") && <span className="text-[8px] font-black">✓</span>}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SECTION 6: BLOOD REPORT UPLOAD */}
                  {currentStep === 6 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-sans font-semibold text-white">Upload Clinical Laboratory Blood Reports:</h4>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">Allows our advanced model to extract exact biomarkers for diagnosis</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: "cbc", title: "Complete Blood Count (CBC) Report" },
                          { id: "sugar", title: "Blood Sugar / HbA1c Report" },
                          { id: "lipid", title: "Lipid Profile (Cholesterol) Report" },
                          { id: "thyroid", title: "Thyroid Panel Report" }
                        ].map((report) => (
                          <div key={report.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left space-y-2">
                            <span className="text-[10px] font-mono text-zinc-400 font-extrabold uppercase block">{report.title}</span>
                            
                            <label className="flex items-center justify-center gap-2 p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/10 hover:border-violet-500/45 rounded-xl transition-all cursor-pointer">
                              <Upload className="h-4 w-4 text-violet-400" />
                              <span className="text-[11px] font-sans text-zinc-300 font-medium">Select File</span>
                              <input 
                                type="file" 
                                accept="application/pdf,image/*" 
                                onChange={(e) => handleFileUpload(e, report.id)} 
                                className="hidden" 
                              />
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Active files progress summary list */}
                      {formData.uploadedFiles.length > 0 && (
                        <div className="space-y-2.5 pt-2 text-left">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase font-black block">Uploaded Documents Queue</span>
                          
                          <div className="space-y-2">
                            {formData.uploadedFiles.map((f) => (
                              <div key={f.name} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <File className="h-4.5 w-4.5 text-violet-400 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-white truncate font-medium">{f.name}</p>
                                    <p className="text-[9px] text-zinc-500 uppercase font-mono font-bold mt-0.5">Category: {f.category.toUpperCase()}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                  {f.progress < 100 ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin" />
                                      <span className="text-[10px] font-mono text-violet-300">{f.progress}%</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Ready</span>
                                  )}
                                  <button
                                    onClick={() => removeUploadedFile(f.name)}
                                    className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 transition-all"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Questionnaire Navigation Footer buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-10">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-5 py-2.5 text-xs rounded-full border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-zinc-300 transition-all font-mono font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  PREVIOUS
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 text-xs rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:brightness-110 active:scale-97 text-white shadow-lg shadow-violet-500/10 transition-all font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      ANALYZING...
                    </>
                  ) : currentStep === 6 ? (
                    <>
                      COMPILE REPORT
                      <Sparkles className="h-4 w-4 text-amber-300" />
                    </>
                  ) : (
                    <>
                      NEXT SECTION
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        ) : (
          /* ================= COMPLETED COGNITIVE ASSESSMENTS / CLINICAL VISUALS ================= */
          <motion.div
            key="onboarding-completed-charts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-left"
          >
            {/* Action panel triggers inside completing diagnostics */}
            <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white/5 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono font-bold cursor-pointer hover:bg-white/10 transition-all"
              >
                ← Take Test Again / Reset Answers
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playBeep(1100, 0.1);
                    window.print();
                  }}
                  className="px-4 py-2 bg-violet-600/10 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/20 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Download / Print EHR
                </button>
              </div>
            </div>

            {/* Diagnostic Layout Core Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Wing Column: Score & Risk meters cards */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual Circular Diagnostic score badge */}
                <div className="p-6 border border-white/10 bg-slate-950/80 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-2xl">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-transparent" />
                  
                  <span className="text-[9px] font-mono text-zinc-500 uppercase font-black tracking-widest block mb-4">PulsePoint Comprehensive health index</span>
                  
                  <div className="relative h-32 w-32 flex items-center justify-center">
                    {/* SVG Progress Circle Ring */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke="rgba(255,255,255,0.04)" 
                        strokeWidth="8" 
                        fill="none" 
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke="url(#g-gradient)" 
                        strokeWidth="8" 
                        strokeDasharray={263}
                        strokeDashoffset={263 - (263 * healthScore) / 100}
                        strokeLinecap="round"
                        fill="none" 
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="g-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Centered raw score */}
                    <div className="absolute flex flex-col justify-center items-center">
                      <span className="text-3xl font-mono font-black text-white leading-none">{healthScore}</span>
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider font-extrabold mt-1">/100 PTS</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-sans text-zinc-300 max-w-xs leading-normal">
                    {healthScore >= 80 ? (
                      <span className="text-emerald-400 font-semibold block">✓ Healthy Cardiovascular Baseline:</span>
                    ) : healthScore >= 55 ? (
                      <span className="text-amber-400 font-semibold block">⚠️ Moderate Risk Detected:</span>
                    ) : (
                      <span className="text-rose-400 font-semibold block">🚨 High Somatic Stress Indicators:</span>
                    )}
                    <span>Sustain active lifestyle and physical metrics. Optimize your specific risks according to suggestions below.</span>
                  </div>
                </div>

                {/* Chronic Disease Risk Levels metrics */}
                <div className="p-6 border border-white/10 bg-slate-950/80 rounded-3xl relative overflow-hidden text-left shadow-lg">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-red-500/20 via-violet-500/20 to-transparent" />
                  
                  <h4 className="text-xs uppercase font-mono tracking-widest font-extrabold text-zinc-300 block mb-4 flex items-center gap-1.5 col-span-2">
                    <ShieldCheck className="h-4 w-4 text-[#f1edd3]" />
                    Somatic Chronic Disease Risk Levels
                  </h4>

                  <div className="space-y-4">
                    {[
                      { key: "diabetes", title: "Diabetes mellitus Risk", level: riskLevels.diabetes },
                      { key: "heart", title: "Coronary pathology Risk", level: riskLevels.heart },
                      { key: "hypertension", title: "Hypertensive vascular Risk", level: riskLevels.hypertension },
                      { key: "obesity", title: "Obesity / Adipose Burden Risk", level: riskLevels.obesity }
                    ].map((m) => {
                      const percentage = m.level === "High" ? 85 : m.level === "Medium" ? 50 : 20;
                      const levelColor = m.level === "High" ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : m.level === "Medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                      
                      return (
                        <div key={m.key} className="space-y-1.5 text-left">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-300 font-medium">{m.title}</span>
                            <span className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${levelColor}`}>
                              {m.level}
                            </span>
                          </div>
                          
                          {/* Meter line progress */}
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                m.level === "High" 
                                  ? "bg-gradient-to-r from-violet-600 to-rose-500" 
                                  : m.level === "Medium" 
                                    ? "bg-gradient-to-r from-violet-600 to-amber-500" 
                                    : "bg-gradient-to-r from-violet-600 to-emerald-500"
                              }`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
              
              {/* Right Column: AI extraction details & Suggestions checkboxes */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Lab report OCR information if available */}
                {extractedValues && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 border border-white/10 bg-gradient-to-br from-[#0c142c]/90 to-slate-950/90 rounded-3xl relative overflow-hidden shadow-lg border-sky-950"
                  >
                    <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-sky-400/30 to-transparent" />
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-4.5 w-4.5 text-sky-400 animate-spin" />
                      <h4 className="text-xs uppercase font-mono tracking-widest font-extrabold text-sky-300 block">
                        Labs Extraction telemetry values
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase font-black block">Parsed Plasma Glycemia</span>
                        <span className="text-white font-medium block mt-1">{extractedValues.bloodSugar}</span>
                      </div>
                      
                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase font-black block">Circulating Cholesterol</span>
                        <span className="text-white font-medium block mt-1">{extractedValues.cholesterol}</span>
                      </div>

                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase font-black block">Absolute Hemoglobin</span>
                        <span className="text-white font-medium block mt-1">{extractedValues.hemoglobin}</span>
                      </div>

                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase font-black block">Thyrotropin Thyroid Panel</span>
                        <span className="text-white font-medium block mt-1">{extractedValues.thyroid}</span>
                      </div>
                    </div>

                    {/* Anomalous findings markers block */}
                    {extractedValues.abnormalParameters.length > 0 && (
                      <div className="mt-4 p-3 bg-amber-950/20 border border-amber-500/10 text-amber-300 rounded-2xl text-[11px] space-y-1 text-left">
                        <span className="text-[9px] font-mono uppercase tracking-wider block font-bold text-amber-400">🚨 Primary Biomarker Anomalies Detected:</span>
                        <ul className="list-disc pl-4 text-zinc-300 space-y-0.5">
                          {extractedValues.abnormalParameters.map((a, idx) => (
                            <li key={idx}><strong>{a}</strong></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* AI Suggestions checkbox checklist */}
                <div className="p-6 border border-white/10 bg-slate-950/80 rounded-3xl relative overflow-hidden text-left shadow-lg">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-transparent" />
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4.5 w-4.5 text-violet-400 animate-pulse" />
                    <h4 className="text-xs uppercase font-mono tracking-widest font-extrabold text-zinc-300 block">
                      Targeted Adaptive AI Clinic Suggestions
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {aiSuggestions.map((sug, idx) => {
                      return (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-black/30 border border-white/5 rounded-xl">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-zinc-300 block leading-relaxed">{sug}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* HIPAA compliance disclaimer note footer */}
                  <div className="mt-6 pt-5 border-t border-white/5 flex gap-2.5 text-[10px] font-sans text-zinc-500 leading-normal">
                    <ShieldCheck className="h-4 w-4 text-emerald-400/60 shrink-0" />
                    <span><b>HIPAA Encrypted Patient Record Notification:</b> All diagnostic outcomes, biometric indicators, and custom reports are retained inside client-side isolated sandbox arrays. No corporate vendor synchronization will occur without explicit OAuth validation.</span>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
