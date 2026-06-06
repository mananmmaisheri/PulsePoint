import { HeartPulse } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Navbar({ currentTab, setTab }: NavbarProps) {
  return (
    <nav className="w-full relative z-40 bg-transparent" id="pulsepoint-navigation">
      {/* Container row */}
      <div className="w-full py-5 px-8 flex flex-row justify-between items-center max-w-7xl mx-auto">
        {/* Left Side: PulsePoint Logo with glowing pulsing medical icon */}
        <button
          onClick={() => setTab("home")}
          className="flex items-center gap-2.5 group transition-transform hover:scale-[1.01] cursor-pointer focus:outline-none"
        >
          <div className="relative flex items-center justify-center h-14 w-14">
            <img 
              src="https://lh3.googleusercontent.com/d/1BFhwv5CYYqqOtHIMy-YIZhOoHHVJSCLS" 
              alt="PulsePoint AI Logo" 
              className="h-14 w-14 object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 h-14 w-14 bg-rose-500 rounded-full blur-lg opacity-15 group-hover:opacity-35 transition-opacity pointer-events-none" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-medium text-xl tracking-wide bg-gradient-to-r from-white via-rose-100 to-violet-300 bg-clip-text text-transparent leading-none">
              PulsePoint
            </span>
            <span className="text-[9px] text-violet-400 font-mono tracking-wider mt-1 font-bold">
              AI CLINICAL COMPANION
            </span>
          </div>
        </button>

        {/* Center: Explicit, clean Nav Items for Home, PulsePoint page, and Features page */}
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

        {/* Right Side: Quick CTA toggle/Launcher */}
        <div>
          <button
            onClick={() => setTab(currentTab === "home" ? "pulsepoint" : "home")}
            className="liquid-glass text-white text-xs font-semibold hover:bg-white/10 border border-white/15 h-9 px-4.5 rounded-full transition-all cursor-pointer shadow-lg hover:shadow-violet-500/10 active:scale-98"
          >
            {currentTab === "home" ? "Launch Clinical AI" : "Back to Landing"}
          </button>
        </div>
      </div>

      {/* Decorative 1px divider bottom matching verbatim specifications */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent mt-[3px]" />
    </nav>
  );
}
