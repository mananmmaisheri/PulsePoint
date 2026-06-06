import { useState } from "react";
import {
  FileText,
  TrendingUp,
  Brain,
  Shield,
  MapPin,
  Heart,
  Globe,
  Award,
  Zap,
  Briefcase,
  Users,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HackathonPresentation() {
  const [activeSlide, setActiveSlide] = useState("deck");

  const slides = [
    { id: "deck", label: "Executive Summary & Pitch", icon: <Award className="h-4 w-4" /> },
    { id: "market", label: "Problem vs. Solution", icon: <Shield className="h-4 w-4" /> },
    { id: "journey", label: "User Journey & Features", icon: <Users className="h-4 w-4" /> },
    { id: "architecture", label: "System Architecture", icon: <CpuIcon className="h-4 w-4" /> },
    { id: "business", label: "USPs & Business Model", icon: <Briefcase className="h-4 w-4" /> },
    { id: "impact", label: "Social Impact & Future", icon: <Heart className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-6 py-8" id="pitch-deck-presentation">
      {/* Header section */}
      <div className="border-b border-white/5 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-violet-400" />
            PulsePoint Consultant Evaluation & Pitch Workspace
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            Explore fully detailed hackathon mentorship insights, product blueprints, clinical and business frameworks curated for judges and medical partners.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl">
        {slides.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSlide(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeSlide === s.id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "text-foreground/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Slide body workspace */}
      <div className="border border-white/5 bg-gray-950/20 backdrop-blur-xl rounded-2xl p-6 md:p-8 min-h-[500px]">
        {/* SLIDE 1: Executive Summary & Pitch */}
        {activeSlide === "deck" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-3xl">🎯</span>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Section 01 / 06</span>
                <h2 className="text-xl font-display font-bold text-white leading-tight">Executive Summary & Pitch Strategy</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-4">
                <p className="text-sm leading-relaxed text-foreground/80">
                  <strong>PulsePoint</strong> redefines digital healthcare delivery. Originally, personal health platforms remained fragmented—fitness tracking operated in one silo, medication scheduling in another, and emergency crisis tools in a third. PulsePoint synthesizes biometric data, real-time doctor routing, and multimodal clinical report translation into a cohesive, instant system. 
                </p>
                <div className="bg-violet-950/15 border border-violet-900/30 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">The Elevator Pitch:</h4>
                  <p className="text-sm italic text-foreground/95">
                    "When seconds save lives, PulsePoint bridges the gap between fear and action. By loading patient biosensors, locating the closest trauma clinics, and translating heavy prescription jargon instantly with AI grounding, we give families the confidence to respond to medical crises, effectively turning every smartphone into a smart medical companion."
                  </p>
                </div>
              </div>

              {/* Side facts */}
              <div className="md:col-span-4 space-y-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Key Pitch Demographics</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-foreground/40">Clinical Standard:</span>
                    <span className="font-mono text-emerald-400">HIPAA Compliant</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-foreground/40">Market Potential:</span>
                    <span className="font-mono text-white">$14.2B APAC TAM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/40">AI Model Alias:</span>
                    <span className="font-mono text-amber-300">gemini-3.5-flash</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Why PulsePoint is Better than Traditional Healthcare Apps:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-foreground/75">
                <div className="p-4 bg-gray-900/40 rounded-xl space-y-1.5 border border-white/5">
                  <h4 className="font-bold text-rose-300">Traditional Legacy Portals</h4>
                  <p>• Isolated health logs without emergency triage coordination.</p>
                  <p>• Medical records are unreadable PDFs full of complex medical jargon.</p>
                  <p>• Static clinical directories without real location/GIS updates.</p>
                </div>
                <div className="p-4 bg-violet-950/10 rounded-xl space-y-1.5 border border-violet-900/20">
                  <h4 className="font-bold text-emerald-300">PulsePoint AI Integrated Hub</h4>
                  <p>• Core emergency loop integrating live sat coordinates and alerts.</p>
                  <p>• Multimodal scanner translating records into simple bullet steps immediately.</p>
                  <p>• Real-time, Maps Grounded locator suggesting active doctor centers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Problem vs. Solution */}
        {activeSlide === "market" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-3xl">☣️</span>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Section 02 / 06</span>
                <h2 className="text-xl font-display font-bold text-white leading-tight">Problem Statement & Innovative Solution</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Problem Statement */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="h-4 w-4" /> THE CLINICAL CRISIS
                </h3>
                <ul className="space-y-3 text-xs leading-relaxed text-foreground/75 list-disc pl-4">
                  <li>
                    <strong>Critical Information Asymmetry:</strong> Medical charts, prescriptions, and lab tests are drafted in archaic Latin or high clinical jargon. Patient non-compliance accounts for 125,000 avoidable deaths yearly due to misinterpreting prescriptions.
                  </li>
                  <li>
                    <strong>GPS Emergency Delays:</strong> Under severe physical distress (strokes, cardiac pain), victims struggle to communicate their exact location, navigate contacts, and identify open pediatric/geriatric units.
                  </li>
                  <li>
                    <strong>Disconnected Care Loops:</strong> Wellness logs exist separate from emergency alarm loops. Existing trackers do not prompt medical updates of medications under biometric alerts.
                  </li>
                </ul>
              </div>

              {/* Solution Overview */}
              <div className="space-y-4 bg-violet-950/10 border border-violet-900/20 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" /> THE INTELLIGENT SYSTEM
                </h3>
                <ul className="space-y-3 text-xs leading-relaxed text-foreground/80 list-disc pl-4">
                  <li>
                    <strong>AI Record Translation:</strong> Real visual OCR and natural language translation converts lab findings, complex medicines, and dosages into step-by-step guidance.
                  </li>
                  <li>
                    <strong>Tactical SOS Dispatch:</strong> One-tap SOS countdown, transmitting positioning coordinate telemetry to pre-stored home contacts.
                  </li>
                  <li>
                    <strong>Maps Retrieval Grounding:</strong> Dynamic GIS search utilizing Google Maps database. Finds open specialists, cardiology doctors, and trauma center routes nearby.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: User Journey & Features */}
        {activeSlide === "journey" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-3xl">🧭</span>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Section 03 / 06</span>
                <h2 className="text-xl font-display font-bold text-white leading-tight">Patient User Journey Map</h2>
              </div>
            </div>

            {/* Stepper diagram representation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-xs space-y-1">
                <span className="text-xl">☀️</span>
                <h4 className="font-bold text-white text-xs">Stage 1: Daily Routine</h4>
                <p className="text-foreground/45">Patient logs step goals, completes water targets, and takes early morning medications.</p>
              </div>
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-xs space-y-1">
                <span className="text-xl">🧪</span>
                <h4 className="font-bold text-white text-xs">Stage 2: Report Scans</h4>
                <p className="text-foreground/45">Patient uploads a newly retrieved clinical report. AI translates high lipids numbers into dietary plans.</p>
              </div>
              <div className="p-4 bg-amber-950/10 border border-amber-900/30 rounded-xl text-xs space-y-1">
                <span className="text-xl">⚠️</span>
                <h4 className="font-bold text-white text-xs">Stage 3: Alarm Alarm</h4>
                <p className="text-foreground/45">Patient senses sudden chest pain. Launches Dashboard Workspace, taps Tactical Emergency SOS.</p>
              </div>
              <div className="p-4 bg-violet-950/10 border border-violet-900/30 rounded-xl text-xs space-y-1">
                <span className="text-xl">🚀</span>
                <h4 className="font-bold text-white text-xs">Stage 4: Care Routing</h4>
                <p className="text-foreground/45">Coordinates dispatch, triggers alert messages to the family, and maps nearest cardiac clinics.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Feature Breakdown:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-foreground/75">
                <div className="p-4 bg-gray-900/30 rounded-xl space-y-1">
                  <h4 className="font-bold text-violet-300">1. AI Health Advisor chatbot</h4>
                  <p>Handles real clinical questions, pediatric first-aid advice, symptom checkups, and provides critical medical warnings.</p>
                </div>
                <div className="p-4 bg-gray-900/30 rounded-xl space-y-1">
                  <h4 className="font-bold text-rose-300">2. Geodirection EmergencySOS</h4>
                  <p>Sends instant emergency SMS alerts through mock/actual triggers and matches direct coordinates close to satellite parameters.</p>
                </div>
                <div className="p-4 bg-gray-900/30 rounded-xl space-y-1">
                  <h4 className="font-bold text-emerald-300">3. Multimodal Prescription ocr</h4>
                  <p>Processes blood, labs, and drug papers to extract medications, dosage schedules, and health alarms securely.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: System Architecture */}
        {activeSlide === "architecture" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-3xl">💻</span>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Section 04 / 06</span>
                <h2 className="text-xl font-display font-bold text-white leading-tight">System Technical Architecture</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column code mapping */}
              <div className="md:col-span-7 space-y-4">
                <p className="text-xs leading-relaxed text-foreground/75">
                  The application is fully client-server balanced to secure sensitive data. External communication flows through unified proxy routes in our Express backend.
                </p>

                {/* Drawn block diagram in code */}
                <div className="space-y-3 bg-black/35 p-5 border border-white/5 rounded-xl font-mono text-[10px] text-foreground/80 leading-relaxed">
                  <div className="flex justify-between items-center bg-violet-950/20 border border-violet-900/30 p-2 rounded">
                    <span className="text-violet-300 font-bold">1. CLIENT LAYER (React + Vite)</span>
                    <span className="text-foreground/40">Browser</span>
                  </div>
                  <div className="text-center">⬇️ POST requests with JSON metrics or base64 files</div>
                  <div className="flex justify-between items-center bg-gray-900 p-2 rounded">
                    <span className="text-amber-400 font-bold">2. PROXY MIDDLEWARE & EXPRESS SERVER</span>
                    <span className="text-foreground/45">Port 3000 / Sandbox</span>
                  </div>
                  <div className="text-center">⬇️ Safe integration with Telemetry header standard</div>
                  <div className="flex justify-between items-center bg-emerald-950/20 border border-emerald-900/30 p-2 rounded">
                    <span className="text-emerald-300 font-bold">3. GEMINI CLINICAL LARGE ENGINE</span>
                    <span className="text-foreground/45">google/genai SDK</span>
                  </div>
                  <div className="text-center">⬇️ Automatic Search Grounding & Maps Contextual Processing</div>
                  <div className="flex justify-between items-center bg-sky-950/20 border border-sky-900/30 p-2 rounded">
                    <span className="text-sky-300 font-bold">4. EXTERNAL DATA (Google Maps Platform)</span>
                    <span className="text-foreground/45">GIS sat telemetry</span>
                  </div>
                </div>
              </div>

              {/* Stack data column */}
              <div className="md:col-span-5 space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider">Engine Details:</h4>
                <ul className="space-y-3 text-foreground/70 leading-relaxed">
                  <li>
                    <strong className="text-white">Multimodal Imaging:</strong> Reads binary scan assets like images, parses OCR and organizes tables in standard JSON configurations directly.
                  </li>
                  <li>
                    <strong className="text-white">Maps Retrieval Grounding:</strong> Incorporates active latLng coordinates mapping nearby specialties inside search ground queries.
                  </li>
                  <li>
                    <strong className="text-white">Lazy initialization:</strong> Checks API availability dynamically avoiding load crashes due to transient configurations.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Business Model */}
        {activeSlide === "business" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-3xl">💎</span>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Section 05 / 06</span>
                <h2 className="text-xl font-display font-bold text-white leading-tight">Unique Selling Points & Monetization Business Model</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1">
                  <Zap className="h-4 w-4 text-amber-300" /> Unique Selling Points (USPs)
                </h3>
                <ul className="space-y-3 text-foreground/75 list-disc pl-4">
                  <li>
                    <strong>Dual-Engine Synergy:</strong> Bridges proactive biometric wellness metrics with instant emergency crisis coordination instantly in a single fluid dashboard screen.
                  </li>
                  <li>
                    <strong>Pre-diagnosis Translation:</strong> Converts high-risk, confusing clinical medical sheets into laying guidelines immediately, raising patient dosing accuracy.
                  </li>
                  <li>
                    <strong>Privacy First & Safe Grounding:</strong> Telemetry-controlled backend protecting keys, with real maps verification providing factual direction linkages.
                  </li>
                </ul>
              </div>

              <div className="space-y-4 bg-gray-900/40 border border-white/5 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-violet-400" /> B2B2C Monetization Business Model
                </h3>
                <ol className="space-y-3 text-foreground/85 list-decimal pl-4">
                  <li>
                    <strong>SaaS Corporate Wellness Packages:</strong> Underwrite licenses to businesses offering employees tactical health tracking dashboards, reducing health absentees.
                  </li>
                  <li>
                    <strong>Private Clinic/Hospital Partnerships:</strong> Premium diagnostic pipelines routing patients directly to partner clinic locations via Google Maps grounding results.
                  </li>
                  <li>
                    <strong>Freemium Consumer Care:</strong> Free access to core steps, basic GPT chat, and SOS triggers. Premium levels for unlimitedprescription scanner summarizations and multi-family contact alert circles.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: Social Impact & Roadmap */}
        {activeSlide === "impact" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-3xl">🌍</span>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Section 06 / 06</span>
                <h2 className="text-xl font-display font-bold text-white leading-tight">Social Impact, Target Audience, & Future Roadmap</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs leading-relaxed text-foreground/75">
              <div className="md:col-span-8 space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="h-4 w-4 text-emerald-400" /> Social Impact Highlights
                </h3>
                <p>
                  PulsePoint targets global Healthcare Equality (SDG Goal 3). By providing AI translation in multiple languages, we empower non-native speakers, rural patients, and elderly citizens to comprehend their medical orders and connect to closest facilities easily, removing linguistic and high fiscal barriers.
                </p>

                <h3 className="text-sm font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1 pt-2">
                  <Target className="h-4 w-4 text-violet-400" /> Target Audience Target Space
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                    <p className="font-bold text-white">Chronic patients</p>
                    <p className="text-[10px] text-foreground/45 mt-1">Managing daily medicines plans and health metrics checks.</p>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                    <p className="font-bold text-white">Non-clinical caregivers</p>
                    <p className="text-[10px] text-foreground/45 mt-1">Seniors and kids guardians who need direct medicine plans lookup.</p>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                    <p className="font-bold text-white">Frequent Travelers</p>
                    <p className="text-[10px] text-foreground/45 mt-1">Requiring immediate locale emergency doctor mapping.</p>
                  </div>
                </div>
              </div>

              {/* Interactive Roadmap */}
              <div className="md:col-span-4 bg-violet-950/10 border border-violet-900/20 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">Future Milestone Roadmap</h4>
                <div className="space-y-2 font-mono text-[11px] text-violet-300">
                  <div className="border-l border-violet-500/30 pl-2 pb-1">
                    <p className="font-bold text-white">Phase Q1-Q2 '26:</p>
                    <p className="text-foreground/50">Core AI record OCR scanner deployment on Cloud containers (Done!)</p>
                  </div>
                  <div className="border-l border-violet-500/30 pl-2 pb-1">
                    <p className="font-bold text-white">Phase Q3-Q4 '26:</p>
                    <p className="text-foreground/50">Wearable sensor IoT API linkages (Fitbit, Apple Watch integrations).</p>
                  </div>
                  <div className="border-l border-violet-500/30 pl-2">
                    <p className="font-bold text-white">Phase Q1 '27:</p>
                    <p className="text-foreground/50">Direct medical consulting appointment locks and insurance coverage checks.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CpuIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  );
}
