import { useState } from "react";
import { HeartPulse, Menu, X, Sparkles, LayoutDashboard, Home, Bot, User } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: { name: string; isGuest: boolean } | null;
}

export default function Navbar({ currentTab, setTab, user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSelect = (tab: string) => {
    setTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full relative z-40 bg-transparent" id="pulsepoint-navigation">
      {/* Container row */}
      <div className="w-full py-4 md:py-5 px-4 md:px-8 flex flex-row justify-between items-center max-w-7xl mx-auto">
        {/* Left Side: PulsePoint Logo with glowing pulsing medical icon */}
        <button
          onClick={() => handleTabSelect("home")}
          className="flex items-center gap-2 md:gap-2.5 group transition-transform hover:scale-[1.01] cursor-pointer focus:outline-none"
        >
          <div className="relative flex items-center justify-center h-11 w-11 md:h-14 md:w-14 shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/d/1BFhwv5CYYqqOtHIMy-YIZhOoHHVJSCLS" 
              alt="PulsePoint AI Logo" 
              className="h-11 w-11 md:h-14 md:w-14 object-contain rounded-xl md:rounded-2xl shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 h-11 w-11 md:h-14 md:w-14 bg-rose-500 rounded-full blur-lg opacity-15 group-hover:opacity-35 transition-opacity pointer-events-none" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-medium text-lg md:text-xl tracking-wide bg-gradient-to-r from-white via-rose-100 to-violet-300 bg-clip-text text-transparent leading-none">
              PulsePoint
            </span>
            <span className="text-[8px] md:text-[9px] text-violet-400 font-mono tracking-wider mt-1 font-bold whitespace-nowrap">
              AI CLINICAL COMPANION
            </span>
          </div>
        </button>

        {/* Center: Explicit, clean Nav Items for Home, PulsePoint page, and Features page for DESKTOP */}
        <div className="hidden md:flex items-center gap-10">
          <button
            onClick={() => setTab("home")}
            className={`font-medium text-sm transition-all cursor-pointer focus:outline-none py-1 relative ${
              currentTab === "home" 
                ? "text-white font-semibold" 
                : "text-foreground/70 hover:text-white"
            }`}
          >
            Home
            {currentTab === "home" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-amber-300 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setTab("pulsepoint")}
            className={`font-medium text-sm transition-all cursor-pointer focus:outline-none py-1 relative flex items-center gap-1.5 ${
              currentTab === "pulsepoint" 
                ? "text-white font-semibold" 
                : "text-foreground/70 hover:text-white"
            }`}
          >
            PulsePoint AI
            <span className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-ping" />
            {currentTab === "pulsepoint" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-amber-300 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setTab("features")}
            className={`font-medium text-sm transition-all cursor-pointer focus:outline-none py-1 relative ${
              currentTab === "features" 
                ? "text-white font-semibold" 
                : "text-foreground/70 hover:text-white"
            }`}
          >
            Features & Solutions
            {currentTab === "features" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-amber-300 rounded-full" />
            )}
          </button>
        </div>

        {/* Right Side Tools & Controls: Show mobile hamburger or launch CTA on desktop */}
        <div className="flex items-center gap-2.5">
          {/* Launch CTA on desktop, hidden or condensed on small screens */}
          <button
            onClick={() => handleTabSelect(currentTab === "home" ? "pulsepoint" : "home")}
            className="hidden sm:inline-flex items-center justify-center liquid-glass text-center text-white text-xs font-semibold hover:bg-white/10 border border-white/15 h-9 px-4.5 rounded-full transition-all cursor-pointer shadow-lg hover:shadow-violet-500/10 active:scale-98"
          >
            {currentTab === "home" ? "Launch Clinical AI" : "Back to Landing"}
          </button>

          {/* Secure User Health Profile / EHR Vault Trigger */}
          <button
            onClick={() => handleTabSelect("profile")}
            className={`flex items-center justify-center h-9 w-9 rounded-full transition-all border cursor-pointer select-none ${
              currentTab === "profile"
                ? "bg-violet-600/25 border-violet-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)] animate-pulse"
                : "bg-white/[0.04] border-white/10 hover:border-white/30 hover:bg-white/[0.08] text-zinc-300 hover:text-white"
            }`}
            title="User Medical Vault"
          >
            {user ? (
              <span className="text-[10px] uppercase font-sans font-black tracking-tight text-violet-300">
                {user.name.slice(0, 2)}
              </span>
            ) : (
              <User className="h-4 w-4" />
            )}
          </button>

          {/* Hamburger button for mobile devices */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden items-center justify-center p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-[#f2f1ef] transition-colors cursor-pointer select-none active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-rose-400" /> : <Menu className="h-5 w-5 text-[#f2f1ef]" />}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Navigation overlay page lists */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 py-5 px-6 mx-4 mt-2 bg-[#0a071c]/95 border border-white/10 rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 flex flex-col gap-4 text-left animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1.5 pb-2.5 border-b border-white/5">
            <span className="text-[9px] font-mono tracking-widest text-[#d1d0ce]/40 font-bold uppercase">Clinical Workspace Routing</span>
          </div>

          {/* Mobile routing links */}
          <button
            onClick={() => handleTabSelect("home")}
            className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === "home"
                ? "bg-white/[0.07] text-white border border-white/10"
                : "text-foreground/70 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <Home className="h-4 w-4 text-violet-400" />
            <span>Home Welcome Landing</span>
          </button>

          <button
            onClick={() => handleTabSelect("pulsepoint")}
            className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === "pulsepoint"
                ? "bg-white/[0.07] text-white border border-white/10"
                : "text-foreground/70 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <Bot className="h-4 w-4 text-purple-400" />
            <span className="flex-1">Consult PulsePoint AI</span>
            <span className="h-2 w-2 bg-purple-400 rounded-full animate-ping" />
          </button>

          <button
            onClick={() => handleTabSelect("features")}
            className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === "features"
                ? "bg-white/[0.07] text-white border border-white/10"
                : "text-foreground/70 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-amber-400" />
            <span>Advanced Solutions Suite</span>
          </button>

          <button
            onClick={() => handleTabSelect("profile")}
            className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === "profile"
                ? "bg-white/[0.07] text-white border border-white/10"
                : "text-foreground/70 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <User className="h-4 w-4 text-emerald-400" />
            <span className="flex-1">Medical Vault Profile</span>
            {user ? (
              <span className="text-[8px] font-mono tracking-widest bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-extrabold uppercase px-1.5 py-0.5 rounded">
                {user.isGuest ? "Guest" : "Verified"}
              </span>
            ) : (
              <span className="text-[8px] font-mono tracking-widest bg-rose-500/10 border border-rose-500/40 text-rose-400 font-extrabold uppercase px-1.5 py-0.5 rounded animate-pulse">
                Locked
              </span>
            )}
          </button>

          {/* Mobile dedicated extra launch trigger */}
          <div className="pt-2.5 border-t border-white/5">
            <button
              onClick={() => handleTabSelect(currentTab === "home" ? "pulsepoint" : "home")}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-xl text-center active:scale-98"
            >
              {currentTab === "home" ? "Launch Clinical AI" : "Back to Landing"}
            </button>
          </div>
        </div>
      )}

      {/* Decorative 1px divider bottom matching verbatim specifications */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent mt-[3px]" />
    </nav>
  );
}
