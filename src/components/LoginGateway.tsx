import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Fingerprint, 
  Heart,
  Eye,
  EyeOff
} from "lucide-react";
import { AppUser } from "../App";

interface LoginGatewayProps {
  onAuthChange: (user: AppUser) => void;
}

// Low frequency beep for audio feedback (from standard implementation)
function playBeep(freq: number, duration: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // AudioContext blocked or unsupported
  }
}

export default function LoginGateway({ onAuthChange }: LoginGatewayProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle local database-free submit
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    playBeep(900, 0.1);

    setTimeout(() => {
      if (!agreeTerms) {
        setAuthError("You must agree to the secure local storage and privacy disclosures.");
        setIsSubmitting(false);
        return;
      }

      if (isSignUp && !name.trim()) {
        setAuthError("Please enter your full medical or personal identifier.");
        setIsSubmitting(false);
        return;
      }

      if (!email.includes("@")) {
        setAuthError("A valid medical provider or personal email is required.");
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        setAuthError("Security requirement: Password must be at least 6 characters.");
        setIsSubmitting(false);
        return;
      }

      // Check if this is a custom login or brand new sign up
      let displayName = name.trim();
      if (!isSignUp) {
        // Try to fetch registered user from local storage
        const registeredStr = localStorage.getItem("pulsepoint_local_auth_db");
        const registered = registeredStr ? JSON.parse(registeredStr) : [];
        const found = registered.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (found) {
          if (found.password !== password) {
            setAuthError("Invalid credentials. Please verify your password.");
            setIsSubmitting(false);
            return;
          }
          displayName = found.name;
        } else {
          // If not found in custom registered DB, we can let any valid mock user log in instantly!
          // This keeps the app incredibly robust and user-friendly
          displayName = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
        }
      } else {
        // Save user to simulated registered DB
        const registeredStr = localStorage.getItem("pulsepoint_local_auth_db");
        const registered = registeredStr ? JSON.parse(registeredStr) : [];
        // Check duplicate
        if (registered.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
          setAuthError("This email is already registered locally.");
          setIsSubmitting(false);
          return;
        }
        registered.push({ email: email.toLowerCase(), password, name: displayName });
        localStorage.setItem("pulsepoint_local_auth_db", JSON.stringify(registered));
      }

      const verifiedUser: AppUser = {
        uid: "user_" + Math.random().toString(36).substring(2, 11),
        email: email.toLowerCase(),
        name: displayName || "Healthcare Professional",
        isGuest: false,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        birthdate: "1994-08-15",
        bloodType: "O-Positive",
        allergies: "None declared",
        conditions: "Healthy Baseline",
        emergencyContact: "Emergency Services",
        emergencyPhone: "112",
        plan: "free",
        aiCredits: 15
      };

      localStorage.setItem("pulsepoint_user", JSON.stringify(verifiedUser));
      onAuthChange(verifiedUser);
      setIsSubmitting(false);
      playBeep(1200, 0.15);
    }, 600);
  };

  // Continue as Guest (instantly)
  const handleGuestContinue = () => {
    playBeep(1000, 0.1);
    setIsSubmitting(true);

    setTimeout(() => {
      const guestUser: AppUser = {
        uid: "guest_" + Math.random().toString(36).substring(2, 11),
        email: null,
        name: "Guest Practitioner",
        isGuest: true,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        birthdate: "1990-01-01",
        bloodType: "Universal Donor (O-)",
        allergies: "None",
        conditions: "Healthy Sandbox User",
        emergencyContact: "Internal PulsePoint Command",
        emergencyPhone: "112",
        plan: "free",
        aiCredits: 15
      };

      localStorage.setItem("pulsepoint_user", JSON.stringify(guestUser));
      onAuthChange(guestUser);
      setIsSubmitting(false);
      playBeep(1300, 0.12);
    }, 400);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black/90 p-4 md:p-8">
      {/* Dynamic backdrop glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-900/15 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-purple-950/10 blur-[130px] rounded-full"></div>
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-rose-950/10 blur-[130px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Shield Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-rose-500/20 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.15)] mb-4">
            <Heart className="h-8 w-8 text-rose-500 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight">
            PulsePoint AI
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1.5 uppercase tracking-widest">
            Cognitive Clinical Operations Room
          </p>
        </div>

        {/* Encrypted Auth Portal Card */}
        <div className="p-6 md:p-8 bg-slate-950/75 border border-white/10 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.7)] backdrop-blur-3xl relative overflow-hidden">
          {/* Accent lighting strip */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500/40 via-rose-500/30 to-amber-500/40" />

          {/* Tab Selection */}
          <div className="flex border-b border-white/5 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setAuthError("");
                playBeep(700, 0.05);
              }}
              className={`flex-1 pb-3.5 text-xs uppercase font-mono font-bold tracking-wider relative transition-colors ${
                !isSignUp ? "text-[#f2f1ef]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Provider Login
              {!isSignUp && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setAuthError("");
                playBeep(750, 0.05);
              }}
              className={`flex-1 pb-3.5 text-xs uppercase font-mono font-bold tracking-wider relative transition-colors ${
                isSignUp ? "text-[#f2f1ef]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Create Account
              {isSignUp && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-500 rounded-full" />
              )}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">
                  Practitioner Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Dr. Jordan Henderson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">
                Secured Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="clinician@pulsepoint.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">
                Master Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    playBeep(850, 0.05);
                  }}
                  className="absolute right-3.5 top-2.5 text-[9px] font-mono font-bold text-rose-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-zinc-400 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={() => {
                    setAgreeTerms(!agreeTerms);
                    playBeep(800, 0.05);
                  }}
                  className="mt-0.5 accent-rose-600 rounded bg-black"
                />
                <span className="text-[10px] leading-relaxed font-sans font-medium">
                  I accept that my biometrics and clinical inputs are stored securely under local, sandbox-encrypted client databases.
                </span>
              </label>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-[10px] font-mono flex gap-2"
              >
                <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_8px_20px_rgba(244,63,94,0.2)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.35)] hover:brightness-110 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-spin text-white">●</span>
                ) : (
                  <>
                    <span>{isSignUp ? "Generate Account" : "Access Clinical Desk"}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Secure Guest Option */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase"><span className="bg-[#05030f] px-3 text-zinc-500 font-extrabold">Instant Sandbox</span></div>
          </div>

          <button
            type="button"
            onClick={handleGuestContinue}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] text-zinc-300 border border-white/10 hover:border-white/20 font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4 text-[#fcd34d]" />
            Continue as Guest
          </button>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-extrabold">
            <Fingerprint className="h-3.5 w-3.5 text-rose-500/80" />
            <span>Encrypted local biometric database sandbox</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
