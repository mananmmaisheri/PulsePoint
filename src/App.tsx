import { useState, startTransition, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, getUserProfile, saveUserProfile, UserProfileData } from "./lib/firebase";

// Import modular components
import BackgroundVideo from "./components/BackgroundVideo";
import CustomCursor from "./components/CustomCursor";
import Navbar from "./components/Navbar";
import Marquee from "./components/Marquee";
import AISmartAssistant from "./components/AISmartAssistant";
import FeaturesHub from "./components/FeaturesHub";
import HomepageScrollSections from "./components/HomepageScrollSections";
import Footer from "./components/Footer";
import UserProfile from "./components/UserProfile";
import LoginGateway from "./components/LoginGateway";
import PricingModal from "./components/PricingModal";

export interface AppUser {
  uid?: string;
  email: string | null;
  name: string;
  isGuest: boolean;
  birthdate?: string;
  bloodType?: string;
  allergies?: string;
  conditions?: string;
  joinedDate?: string;
  avatarUrl?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  plan?: "free" | "plus";
  aiCredits?: number;
}

export default function App() {
  // Authentication states
  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem("pulsepoint_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Navigation tabs routing state: "home" | "pulsepoint" | "features" | "profile"
  const [currentTab, setTabState] = useState<string>("home");
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const handlePlanUpgrade = () => {
    if (user) {
      const updatedUser = { ...user, plan: "plus" as const, aiCredits: 999999 };
      setUser(updatedUser);
      localStorage.setItem("pulsepoint_user", JSON.stringify(updatedUser));
    }
  };

  // Wrapping setTab with startTransition to handle routing transitions fluidly
  const setTab = (tab: string) => {
    startTransition(() => {
      setTabState(tab);
    });
  };

  useEffect(() => {
    const handleOpenPricing = () => setIsPricingOpen(true);
    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        const saved = localStorage.getItem("pulsepoint_user");
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch (err) {}
        }
      }
    };
    
    window.addEventListener("open-pricing-modal", handleOpenPricing);
    window.addEventListener("user-credits-updated", handleUserUpdate);
    window.addEventListener("pulsepoint-user-updated", handleUserUpdate);
    
    return () => {
      window.removeEventListener("open-pricing-modal", handleOpenPricing);
      window.removeEventListener("user-credits-updated", handleUserUpdate);
      window.removeEventListener("pulsepoint-user-updated", handleUserUpdate);
    };
  }, []);

  if (!user) {
    return (
      <div className="relative min-h-screen bg-background font-sans text-foreground selection:bg-rose-500/30 overflow-x-hidden p-0 m-0">
        <CustomCursor />
        <LoginGateway onAuthChange={setUser} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground selection:bg-rose-500/30 overflow-x-hidden p-0 m-0">
      {/* 1. Custom Interactive Glow Cursor */}
      <CustomCursor />

      {/* 2. Interactive Navigation Routing */}
      {currentTab === "home" && (
        /* ==================== 1. HOME PAGE WORKSPACE (Verbatim Landing Specs with Scroll Reveal) ==================== */
        <div className="min-h-screen flex flex-col relative overflow-y-auto overflow-x-hidden bg-background scroll-smooth">
          
          {/* Constant ambient cosmic layout background shadows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -slate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] rounded-full"></div>
            <div className="absolute top-[15%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[5%] right-[-5%] w-[450px] h-[450px] bg-violet-900/10 blur-[120px] rounded-full"></div>
          </div>

          {/* Share exact video loop backdrop across the entire home tab layout as a fixed background */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <BackgroundVideo url="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4" />
          </div>

          {/* Section 1: Top Hero Landing Section (h-screen viewport containment) */}
          <div className="relative min-h-screen flex flex-col overflow-hidden shrink-0 z-10">
            {/* Top Navbar */}
            <Navbar currentTab={currentTab} setTab={setTab} user={user} onOpenPricing={() => setIsPricingOpen(true)} />

            {/* Vertically Centered Hero elements above video - relative z-10 block */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                {/* Headline - replaced "Power AI" with "PulsePoint AI" */}
                <h1 className="font-display font-normal text-[48px] md:text-[110px] lg:text-[150px] leading-[1.02] tracking-[-0.035em] select-none text-[#f2f1ef] whitespace-nowrap">
                  PulsePoint{" "}
                  <span
                    style={{
                      background: "linear-gradient(to left, #6366f1, #a855f7, #fcd34d)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    className="bg-clip-text text-transparent font-semibold"
                  >
                    AI
                  </span>
                </h1>

                {/* Subtitle - verbatim specifications slightly paired into clinical values */}
                <p className="text-[#d1d0ce] text-base md:text-lg leading-relaxed max-w-lg mt-6 opacity-80 tracking-wide font-sans text-center px-4">
                  The most powerful AI ever deployed in healthcare and emergency response intelligence.
                </p>

                {/* CTA button: "Schedule a Consult" - leads immediately to the specialized AI assistant */}
                <button
                  onClick={() => setTab("pulsepoint")}
                  className="liquid-glass text-white font-semibold hover:bg-white/10 hover:shadow-violet-500/20 px-8 py-5 mt-10 rounded-full cursor-pointer select-none active:scale-98 transition-all tracking-wide text-sm flex items-center gap-3 shadow-2xl border border-white/20 animate-bounce"
                  style={{ animationDuration: '3s' }}
                >
                  Schedule a Consult
                  <span className="text-amber-300">➜</span>
                </button>
              </motion.div>
            </div>

            {/* Logo partners marquee pinned at the bottom - pb-10 inside */}
            <Marquee />
          </div>

          {/* Section 2: Continuous Scroll-Triggered Features & Info Panels */}
          <HomepageScrollSections setTab={setTab} />

          {/* Persistent Immersive Footer */}
          <Footer setTab={setTab} />
        </div>
      )}

      {currentTab === "pulsepoint" && (
        /* ==================== 2. PULSEPOINT CHATBOT (Immersive Landing Background Specs) ==================== */
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
          {/* Immersive UI absolute background gradient glowing shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] rounded-full"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full"></div>
          </div>

          {/* Share exact video loop backdrop from home screen layout to capture aesthetic harmony */}
          <BackgroundVideo url="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4" />

          {/* Navbar wrapper */}
          <Navbar currentTab={currentTab} setTab={setTab} user={user} onOpenPricing={() => setIsPricingOpen(true)} />

          {/* Chat Assistant embedded inside beautiful transparent frosted layout card */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-2 md:py-3 px-2 md:px-6 max-w-7xl mx-auto w-full h-[calc(100vh-100px)] md:h-[calc(100vh-112px)] overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-slate-950/80 border border-white/10 rounded-3xl p-1.5 md:p-2.5 shadow-2xl backdrop-blur-2xl flex-1 flex flex-col h-full overflow-hidden"
            >
              <div className="flex-1 flex flex-col overflow-hidden">
                <AISmartAssistant user={user} />
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {currentTab === "features" && (
        /* ==================== 3. FEATURES HUB WORKSPACE (Enhanced Professional Solutions) ==================== */
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
          {/* Constant ambient cosmic layout background shadows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] rounded-full"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full"></div>
          </div>

          {/* Share exact video loop backdrop from home screen layout to capture aesthetic harmony */}
          <BackgroundVideo url="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4" />

          {/* Master Dashboard Navbar */}
          <Navbar currentTab={currentTab} setTab={setTab} user={user} onOpenPricing={() => setIsPricingOpen(true)} />

          {/* Primary View content mounting the catalog layout of medical modules */}
          <div className="relative z-20 flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                <FeaturesHub />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {currentTab === "profile" && (
        /* ==================== 4. USER HEALTH VAULT & EHR PROFILE ==================== */
        <div className="min-h-screen flex flex-col bg-background relative overflow-y-auto">
          {/* Ambient cosmic backdrop layout */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] rounded-full"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-900/10 blur-[120px] rounded-full"></div>
          </div>

          <BackgroundVideo url="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4" />

          <Navbar currentTab={currentTab} setTab={setTab} user={user} onOpenPricing={() => setIsPricingOpen(true)} />

          <div className="relative z-10 flex-1 flex flex-col">
            <UserProfile user={user} onAuthChange={setUser} setTab={setTab} />
          </div>
          
          <Footer setTab={setTab} />
        </div>
      )}

      {/* 5. Dynamic Pricing Plan Modal Upgrade */}
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
        user={user} 
        onPlanUpgrade={handlePlanUpgrade} 
      />
    </div>
  );
}
