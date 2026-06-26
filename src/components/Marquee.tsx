import React from "react";
import {
  Activity,
  ShieldAlert,
  Sparkles,
  MapPin,
  FileText,
  Presentation,
  BellRing,
  Heart,
  ShieldCheck
} from "lucide-react";

interface MarqueeFeature {
  name: string;
  badge: string;
  icon: React.ReactNode;
  colorClass: string;
  badgeColorClass: string;
}

export default function Marquee() {
  const features: MarqueeFeature[] = [
    { 
      name: "Smart Medicine & Vitals Tracker", 
      badge: "Meds & Vitals", 
      icon: <Activity className="h-4 w-4" />, 
      colorClass: "text-amber-400",
      badgeColorClass: "text-amber-300 bg-amber-950/40 border-amber-500/20"
    },
    { 
      name: "Emergency SOS Rescuer", 
      badge: "112 Live ERSS", 
      icon: <ShieldAlert className="h-4 w-4 animate-pulse" />, 
      colorClass: "text-red-400",
      badgeColorClass: "text-red-300 bg-red-950/40 border-red-500/20"
    },
    { 
      name: "Veda AI Clinical Assistant", 
      badge: "Gemini Triage", 
      icon: <Sparkles className="h-4 w-4" />, 
      colorClass: "text-violet-400",
      badgeColorClass: "text-violet-300 bg-violet-950/40 border-violet-500/20"
    },
    { 
      name: "Clinician Locator Services", 
      badge: "Google maps Platform", 
      icon: <MapPin className="h-4 w-4" />, 
      colorClass: "text-sky-400",
      badgeColorClass: "text-sky-300 bg-sky-950/40 border-sky-500/20"
    },
    { 
      name: "Medical Scanner & Vault", 
      badge: "Vision OCR", 
      icon: <FileText className="h-4 w-4" />, 
      colorClass: "text-emerald-400",
      badgeColorClass: "text-emerald-300 bg-emerald-950/40 border-emerald-500/20"
    },
    { 
      name: "Compliant Pill Reminders", 
      badge: "Alarm Sync", 
      icon: <BellRing className="h-4 w-4" />, 
      colorClass: "text-purple-400",
      badgeColorClass: "text-purple-300 bg-purple-950/40 border-purple-500/20"
    },
    { 
      name: "Investor Pitch & Market Size", 
      badge: "TAM Analytics", 
      icon: <Presentation className="h-4 w-4" />, 
      colorClass: "text-[#fda4af]",
      badgeColorClass: "text-rose-300 bg-rose-950/40 border-rose-500/20"
    },
    { 
      name: "Cardiovascular Telemetry", 
      badge: "Heart rate Core", 
      icon: <Heart className="h-4 w-4 animate-pulse" />, 
      colorClass: "text-pink-400",
      badgeColorClass: "text-pink-300 bg-pink-950/40 border-pink-500/20"
    },
    { 
      name: "Secure Patient HIPAA Vault", 
      badge: "AES-256 Encrypted", 
      icon: <ShieldCheck className="h-4 w-4" />, 
      colorClass: "text-blue-400",
      badgeColorClass: "text-blue-300 bg-blue-950/40 border-blue-500/20"
    }
  ];

  // Duplicate for seamless infinite loop scroll
  const marqueeList = [...features, ...features, ...features];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-12" id="marquee-section">
      <div className="flex flex-col lg:flex-row items-center gap-8 border-t border-white/5 pt-10 overflow-hidden">
        {/* Left Side: Static Text verbatim: "Relied on by brands / across the globe" updated to "PORTAL SUITE & SERVICES" */}
        <div className="shrink-0 text-center lg:text-left">
          <p className="text-foreground/42 text-xs font-mono font-black uppercase tracking-widest leading-relaxed">
            ACTIVE CLINICAL ENGINES <br className="hidden lg:block" />
            & DATA INTEGRATIONS
          </p>
        </div>

        {/* Right Side: Infinite scrolling marquee inside an overflow-hidden mask */}
        <div className="relative flex-1 overflow-hidden w-full py-3.5">
          {/* Fader Masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

          {/* Marquee loop element with hover stop state */}
          <div className="animate-marquee-loop flex items-center gap-10">
            {marqueeList.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center gap-3.5 shrink-0 group hover:opacity-100 transition-opacity bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-2xl"
              >
                {/* Visual spec: liquid-glass 32x32 rounded-xl custom icon holding lucide indicator */}
                <div className={`liquid-glass h-9 w-9 rounded-xl flex items-center justify-center border border-white/5 shadow-md flex-shrink-0 ${item.colorClass}`}>
                  {item.icon}
                </div>
                
                {/* Text attributes stack */}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground/90 tracking-wide group-hover:text-violet-400 transition-colors leading-none">
                    {item.name}
                  </span>
                  <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border mt-1.5 leading-none w-fit tracking-wider ${item.badgeColorClass}`}>
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

