import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Check, 
  Gift, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  MessageSquare,
  Award,
  X,
  Volume2
} from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onPlanUpgrade: () => void;
}

const COUPONS = [
  { code: "PULSEPLUS100", desc: "100% Free Consultation Pass for Specialist Doctors" },
  { code: "PULSESURPRISE50", desc: "50% Off Diagnostic Tests at Partner labs" },
  { code: "MEDFREE30", desc: "Flat 30% Off prescription medicine deliveries" },
  { code: "COGNITIVE75", desc: "75% Off full health body checkups" }
];

export default function PricingModal({ isOpen, onClose, user, onPlanUpgrade }: PricingModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [claimedCoupon, setClaimedCoupon] = useState<any>(null);

  const playUpgradeSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Melodic chimes
      const chimeFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chimeFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
      });
    } catch (e) {}
  };

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      playUpgradeSound();
      onPlanUpgrade();
    }, 1200);
  };

  const handleClaimCoupon = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}

    const randomCoupon = COUPONS[Math.floor(Math.random() * COUPONS.length)];
    setClaimedCoupon(randomCoupon);
  };

  if (!isOpen) return null;

  const isPlus = user?.plan === "plus";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl bg-[#09071b] border border-white/10 rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.85)] p-6 md:p-8 text-left"
        >
          {/* Top light beam */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500/50 via-rose-500/50 to-amber-400/50" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/5 hover:border-white/15 transition-all active:scale-95 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {!success && !isPlus ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-violet-500/20 to-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Sparkles className="h-3 w-3 text-rose-400 animate-spin" />
                  Elevate Clinical Intel
                </span>
                <h3 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight mt-2">
                  Upgrade to PulsePoint Plus
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Unlock absolute computing high availability with customized health features built for medical specialists.
                </p>
              </div>

              {/* Side by side Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Free Plan card */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Free Plan</h4>
                    <div className="mt-2 mb-3">
                      <span className="text-2xl font-bold text-zinc-200">₹0</span>
                      <span className="text-xs text-zinc-500"> / forever</span>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-400">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                        <span>Limited to 15 starting AI credits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                        <span>Maximum of 6 document uploads</span>
                      </li>
                      <li className="flex items-start gap-2 text-zinc-600">
                        <X className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>No personalized AI wellness plans</span>
                      </li>
                      <li className="flex items-start gap-2 text-zinc-600">
                        <X className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>No surprise discount coupons</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-5 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block text-center">Active Sandbox</span>
                  </div>
                </div>

                {/* Plus Plan Card (Highlighted) */}
                <div className="p-5 bg-slate-900/40 border border-rose-500/30 rounded-2xl relative flex flex-col justify-between shadow-[0_0_20px_rgba(244,63,94,0.05)]">
                  <div className="absolute top-3 right-3 text-[9px] font-mono font-extrabold uppercase bg-rose-500 text-white px-2 py-0.5 rounded-md">
                    RECOMMENDED
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-widest">Plus Plan</h4>
                    <div className="mt-2 mb-3">
                      <span className="text-2xl font-bold text-white">₹199</span>
                      <span className="text-xs text-zinc-400"> / month</span>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-200">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Unlimited Chats</strong> (no credit cost)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Unlimited Document Storage</strong> in medical vault</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Personalized AI Health Plans</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Claim Surprise Coupons</strong> instantly</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={handleUpgrade}
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_6px_15px_rgba(244,63,94,0.25)] hover:brightness-110 active:scale-97 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="animate-spin text-white">●</span>
                      ) : (
                        <>
                          <span>Activate PulsePoint Plus</span>
                          <Zap className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Secure footer lines */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Simulated High-Availability Sandbox Payment. No real bank credentials or charges are transacted.</span>
              </div>
            </div>
          ) : (
            /* CONGRATS / ACTIVE PREMIUM VIEW */
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                PulsePoint Plus Active!
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2">
                Thank you for upgrading! Your clinician ID is now verified under clinical high-availability routing parameters. Feel free to use unlimited medical storage and chats.
              </p>

              {/* Claim Surprise Coupons block */}
              <div className="mt-8 p-6 bg-slate-900/60 border border-white/10 rounded-2xl max-w-md mx-auto relative overflow-hidden text-left">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-emerald-500/40 via-yellow-400/30 to-emerald-500/40" />
                <h4 className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Gift className="h-4 w-4 animate-pulse" />
                  Premium Surprise Coupon Box
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Claim your high-value health discount coupons exclusive to PulsePoint Plus medical subscribers:
                </p>

                {claimedCoupon ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-4 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex flex-col gap-1 text-center"
                  >
                    <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">YOUR SECRET COUPON CODE</span>
                    <span className="text-lg font-mono font-black text-yellow-300 bg-black/45 py-2 px-4 rounded-lg border border-white/5 tracking-wider select-all inline-block mx-auto cursor-pointer">
                      {claimedCoupon.code}
                    </span>
                    <p className="text-xs text-emerald-300 font-medium mt-1">
                      {claimedCoupon.desc}
                    </p>
                    <button
                      onClick={() => setClaimedCoupon(null)}
                      className="text-[9px] font-mono font-bold text-zinc-400 hover:text-white mt-2 cursor-pointer block underline"
                    >
                      Draw another coupon
                    </button>
                  </motion.div>
                ) : (
                  <div className="mt-4">
                    <button
                      onClick={handleClaimCoupon}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-yellow-500 text-black font-black text-xs tracking-wider uppercase transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:brightness-110 active:scale-97 cursor-pointer text-center"
                    >
                      🎁 Draw Surprise Coupon
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-all cursor-pointer active:scale-95"
                >
                  Dismiss Workspace
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
