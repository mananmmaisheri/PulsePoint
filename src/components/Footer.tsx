import React from "react";
import { motion } from "motion/react";
import { 
  Heart, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  ExternalLink,
  Activity,
  Globe2,
  Lock
} from "lucide-react";

interface FooterProps {
  setTab: (tab: string) => void;
}

export default function Footer({ setTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-[#050212]/95 text-[#f2f1ef] overflow-hidden" id="homepage-footer">
      {/* Decorative background glow elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-violet-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[200px] bg-rose-900/5 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-white/5">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <button 
              onClick={() => setTab("home")}
              className="flex items-center gap-3.5 group/logo focus:outline-none cursor-pointer text-left"
            >
              <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0">
                <img 
                  src="https://lh3.googleusercontent.com/d/1BFhwv5CYYqqOtHIMy-YIZhOoHHVJSCLS" 
                  alt="PulsePoint AI Logo" 
                  className="h-10 w-10 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-medium text-xl tracking-wide bg-gradient-to-r from-white via-rose-100 to-indigo-300 bg-clip-text text-transparent leading-none">
                  PulsePoint
                </span>
                <span className="text-[9px] text-[#A78BFA] font-mono tracking-wider mt-1.5 font-bold uppercase">
                  Clinical Intelligence Hub
                </span>
              </div>
            </button>

            <p className="text-sm text-foreground/50 leading-relaxed max-w-sm">
              The premium, offline-first digital healthcare and emergency response platform translating biometrics, report cards, and doctor actions into instant somatic guidelines.
            </p>

            <div className="flex flex-wrap gap-4 items-center text-xs text-foreground/45 font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                HIPAA Compliant
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full">
                <Lock className="h-3.5 w-3.5 text-violet-400" />
                End-to-End Crypted
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-violet-300/80">
              Workspace Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setTab("home")}
                  className="text-foreground/55 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="h-1 w-1 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Ecosystem Overview
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTab("pulsepoint")}
                  className="text-foreground/55 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="h-1 w-1 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  AI Clinical Chatbot
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTab("features")}
                  className="text-foreground/55 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="h-1 w-1 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Doctor & Hospital Locator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTab("features")}
                  className="text-foreground/55 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="h-1 w-1 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Physical Health Logs Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Core Telemetry and Support */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-violet-300/80">
              Emergency Services
            </h4>
            
            <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-950/5 space-y-2 max-w-sm">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                RED CASCADE DISPATCH PROTOCOL
              </div>
              <p className="text-xs text-[#eedfdc]/60 leading-relaxed font-sans">
                If custom biometric alerts detect severe choking, cardiac arrest, or hemorrhage, please consult standard local services. Hotlines are synchronized globally.
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-rose-300/85 pt-1.5 border-t border-rose-500/10">
                <span>National Emergency: 112 / 102</span>
                <span className="underline cursor-pointer hover:text-rose-200">Local Ambulance</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 text-xs text-foreground/40 leading-relaxed font-mono">
              <div className="flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-foreground/30" />
                Active Jurisdiction: Global Standard
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-foreground/30" />
                Telemetry transmission latency: 0.02s
              </div>
            </div>
          </div>
        </div>

        {/* Medical disclaimer notice */}
        <div className="py-8 border-b border-white/5 text-[11px] text-foreground/35 leading-relaxed font-sans max-w-5xl">
          <p>
            <strong>Emergency Medical Notice & Liability Limitation:</strong> PulsePoint AI operates as an advanced clinical triage guidance portal and medical documentation translator. It is designed to assist with scheduling, report tracking, and botanical suggestions, and strictly does NOT constitute professional diagnostic certificates or medical prescriptions. Continuous sensor feeds represent secure telemetry parameters from connected wearables. In critical, high-danger physical crises, immediately bypass digital dashboards and engage local licensed emergency operators directly.
          </p>
        </div>

        {/* Lower copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/45 font-mono">
          <div className="flex items-center gap-1 text-center sm:text-left">
            <span>© {currentYear} PulsePoint AI. Crafted with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse mx-0.5" />
            <span>for clinical equity and clinical response innovation.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#pulsepoint-navigation" className="hover:text-white transition-colors">Back to Top</a>
            <span className="text-white/10">|</span>
            <span className="text-foreground/30">v1.2.4-Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
