import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Lock, Mail, ShieldCheck, FileCheck, LogOut, Download, Plus, 
  Trash2, Key, AlertTriangle, Fingerprint, RefreshCcw, CreditCard, 
  ClipboardList, CheckCircle, ArrowRight, UserPlus, FileText, HeartPulse
} from "lucide-react";

interface AppUser {
  email: string | null;
  name: string;
  isGuest: boolean;
  birthdate?: string;
  bloodType?: string;
  allergies?: string;
  conditions?: string;
  avatarUrl?: string;
  joinedDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface UserProfileProps {
  user: AppUser | null;
  onAuthChange: (newUser: AppUser | null) => void;
  // Let's allow sync with parent navigation state if they log out or log in
  setTab: (tab: string) => void;
}

export default function UserProfile({ user, onAuthChange, setTab }: UserProfileProps) {
  // Auth state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBirthdate, setEditBirthdate] = useState("");
  const [editBloodType, setEditBloodType] = useState("");
  const [editAllergies, setEditAllergies] = useState("");
  const [editConditions, setEditConditions] = useState("");
  const [editEmergencyContact, setEditEmergencyContact] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");
  const [showIdCard, setShowIdCard] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sound feedback
  const playBeep = (freq = 800, duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context block ignored
    }
  };

  // Sync profile editing values with user state
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditBirthdate(user.birthdate || "1994-08-15");
      setEditBloodType(user.bloodType || "O-Positive");
      setEditAllergies(user.allergies || "No known seasonal or medication allergies");
      setEditConditions(user.conditions || "None declared");
      setEditEmergencyContact(user.emergencyContact || "Dr. Alice Vance (Primary Care)");
      setEditEmergencyPhone(user.emergencyPhone || "+1 (555) 323-8821");
    }
  }, [user]);

  // Handle Authentication submit
  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    playBeep(900, 0.1);

    // Simulate clinical registration process with timeout
    setTimeout(() => {
      if (!agreeTerms) {
        setAuthError("You must agree to the HIPAA secure storage and privacy disclosures.");
        setIsSubmitting(false);
        return;
      }

      if (isSignUp && !name.trim()) {
        setAuthError("Please enter your full medical credential name.");
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

      // Successful clinical session provisioning
      const provisionedUser: AppUser = {
        email: email,
        name: isSignUp ? name : email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        isGuest: false,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        birthdate: "1994-08-15",
        bloodType: "A-Positive",
        allergies: "Penicillin, Seasonal Pollen",
        conditions: "Asthma, Mild Hypertension",
        emergencyContact: "Sarah Millson (Spouse)",
        emergencyPhone: "+1 (555) 901-4433"
      };

      localStorage.setItem("pulsepoint_user", JSON.stringify(provisionedUser));
      onAuthChange(provisionedUser);
      setTab("pulsepoint");
      setIsSubmitting(false);
      playBeep(1100, 0.15);
    }, 900);
  };

  // Switch instantly to Guest mode for high-availability clinical lookup
  const handleGuestContinue = () => {
    playBeep(1000, 0.1);
    setIsSubmitting(true);
    
    setTimeout(() => {
      const guestUser: AppUser = {
        email: null,
        name: "Guest Practitioner",
        isGuest: true,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        birthdate: "1991-03-22",
        bloodType: "O-Negative (Universal)",
        allergies: "No known corporate allergens",
        conditions: "Healthy Baseline",
        emergencyContact: "Pulsepoint Emergency Dispatch Center",
        emergencyPhone: "911 / Internal Dispatch"
      };
      
      localStorage.setItem("pulsepoint_user", JSON.stringify(guestUser));
      onAuthChange(guestUser);
      setTab("pulsepoint");
      setIsSubmitting(false);
      playBeep(1200, 0.12);
    }, 400);
  };

  // Manage profile updates
  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    playBeep(920, 0.08);
    const updatedUser: AppUser = {
      ...user,
      name: editName,
      birthdate: editBirthdate,
      bloodType: editBloodType,
      allergies: editAllergies,
      conditions: editConditions,
      emergencyContact: editEmergencyContact,
      emergencyPhone: editEmergencyPhone,
    };

    localStorage.setItem("pulsepoint_user", JSON.stringify(updatedUser));
    onAuthChange(updatedUser);
    setIsEditing(false);
    setSaveSuccess(true);
    playBeep(1300, 0.15);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Secure Sign Out which clears state
  const handleSignOut = () => {
    playBeep(600, 0.2);
    localStorage.removeItem("pulsepoint_user");
    onAuthChange(null);
    setTab("home");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 relative z-10" id="user-clinical-profile">
      
      <AnimatePresence mode="wait">
        {!user ? (
          /* ==================== SCREEN A: CLINICAL GATEWAY (AUTH) ==================== */
          <motion.div
            key="auth-gateway"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto"
          >
            {/* Visual Header Shield */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)] mb-4">
                <ShieldCheck className="h-8 w-8 text-violet-400 animate-pulse" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
                Secure Health Vault
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1 uppercase tracking-widest">
                PulsePoint Encrypted EHR Entry
              </p>
            </div>

            {/* Glassmorphic Auth Form Card */}
            <div className="p-6 md:p-8 bg-slate-950/80 border border-white/10 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30" />
              
              {/* Form trigger tabs (Sign In vs Register) */}
              <div className="flex border-b border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setAuthError("");
                    playBeep(700, 0.05);
                  }}
                  className={`flex-1 pb-3 text-xs uppercase font-mono font-bold tracking-wider relative transition-colors ${
                    !isSignUp ? "text-[#f1edd3]" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Provider Sign In
                  {!isSignUp && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setAuthError("");
                    playBeep(750, 0.05);
                  }}
                  className={`flex-1 pb-3 text-xs uppercase font-mono font-bold tracking-wider relative transition-colors ${
                    isSignUp ? "text-[#f1edd3]" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Secure Register
                  {isSignUp && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded-full" />
                  )}
                </button>
              </div>

              {/* Real form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                
                {isSignUp && (
                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">
                      Full Name (Identifiable EHR Field)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder="Dr. Jordan Henderson"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase block">
                    Secured Clinical Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="provider@pulsepoint.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase">
                    <label>EHR Master Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError("Simulated offline security: Simply enter any 6+ character password to begin.");
                          playBeep(500, 0.1);
                        }}
                        className="text-amber-400 text-[8px] font-normal hover:underline"
                      >
                        Help Key?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword(!showPassword);
                        playBeep(850, 0.05);
                      }}
                      className="absolute right-3.5 top-2.5 text-[9px] font-mono font-bold text-violet-400 hover:text-white"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                {/* Secure privacy notice disclosures matching specifications */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-zinc-400 select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={() => {
                        setAgreeTerms(!agreeTerms);
                        playBeep(800, 0.05);
                      }}
                      className="mt-0.5 accent-violet-600 rounded bg-black"
                    />
                    <span className="text-[10px] leading-relaxed font-sans font-medium">
                      Understand that PulsePoint stores all biometrics under strict sandboxed **AES-256 local encrypted client databases**. Tick to accept the terms.
                    </span>
                  </label>
                </div>

                {/* Error Box */}
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-[10px] font-mono flex gap-2"
                  >
                    <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                    <span>{authError}</span>
                  </motion.div>
                )}

                {/* Submit action buttons */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.45)] hover:brightness-110 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin text-white">●</span>
                    ) : (
                      <>
                        <span>{isSignUp ? "Generate Secured Account" : "Access Clinical Dashboard"}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Guest Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                <div className="relative flex justify-center text-[10px] font-mono uppercase"><span className="bg-[#05030f] px-3 text-zinc-500 font-extrabold">Instant Sandbox</span></div>
              </div>

              {/* Continue as Guest Button */}
              <button
                type="button"
                onClick={handleGuestContinue}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] text-zinc-300 border border-white/10 hover:border-white/20 font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer active:scale-98"
              >
                Continue as Secure Guest
              </button>

              {/* Verification bottom badge lines */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-extrabold">
                <Fingerprint className="h-3.5 w-3.5 text-violet-500/80" />
                <span>HIPAA compliant storage sandbox</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ==================== SCREEN B: EHR PROFILE DASHBOARD ==================== */
          <motion.div
            key="profile-clinical-dashboard"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
          >
            
            {/* Left Box: Card Widget, Quick Stats and Print ID Zone */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Profile Card Header */}
              <div className="p-6 border border-white/5 bg-gray-950/15 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500/20 to-transparent" />
                
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {/* Generative First Initial Initial Avatar */}
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-sans text-xl font-bold flex items-center justify-center shadow-lg uppercase">
                      {user.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-medium text-white tracking-tight">{user.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          user.isGuest 
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-300" 
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                        }`}>
                          {user.isGuest ? "Temporary Guest" : "Verified Provider"}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">MD Suite</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="p-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 text-rose-400 transition-all cursor-pointer active:scale-95"
                    title="Terminate Clinical Vault Session"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[8px] text-zinc-500 uppercase font-bold block">Secure Email</span>
                      <span className="text-zinc-300 block truncate mt-0.5">{user.email || "No secure email bound"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-500 uppercase font-bold block">Joined On</span>
                      <span className="text-zinc-300 block mt-0.5">{user.joinedDate || "Immediate Session"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Digital Health Emergency ID Card Card Flip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-wider block">Pulsepoint Medical clinical ID</span>
                  <button 
                    onClick={() => {
                      setShowIdCard(!showIdCard);
                      playBeep(900, 0.05);
                    }} 
                    className="text-[10px] text-violet-400 font-mono hover:underline font-bold"
                  >
                    {showIdCard ? "Collapse" : "Show Display ID"}
                  </button>
                </div>

                {showIdCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6 bg-gradient-to-br from-[#13072b] to-[#12050f] border border-white/10 rounded-3xl relative overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-violet-600/10 hover:border-violet-500/30 text-left cursor-default select-none"
                  >
                    {/* Floating holographic lines */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_right_bottom,rgba(139,92,246,0.1),transparent_50%)]" />
                    <div className="absolute top-0 right-0 p-4 shrink-0 text-violet-400 opacity-20 group-hover:opacity-60 transition-opacity">
                      <HeartPulse className="h-10 w-10 text-rose-500 animate-pulse" />
                    </div>

                    <div className="flex flex-col justify-between h-40">
                      <div>
                        <div className="flex items-center gap-2">
                          <Fingerprint className="h-4 w-4 text-rose-400" />
                          <span className="text-[9px] font-mono tracking-widest text-zinc-300 font-black uppercase leading-none">PULSEPOINT BIO-EMS RECORD</span>
                        </div>
                        <h4 className="text-lg font-display text-white font-medium tracking-wide mt-2">{user.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-400 font-mono block">DOB: {editBirthdate}</span>
                          <span className="text-zinc-600 block text-[9px] font-mono">•</span>
                          <span className="text-[10px] text-rose-400 font-mono font-bold uppercase block">{editBloodType}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                        <div>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold block">ICE Dispatch Protocol</span>
                          <span className="text-[10px] text-zinc-300 font-mono block truncate max-w-[200px] mt-0.5">{editEmergencyContact}</span>
                          <span className="text-[9px] text-zinc-400 font-mono block mt-0.5">{editEmergencyPhone}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-zinc-500 uppercase font-bold block">Vault Sync</span>
                          <span className={`text-[9px] font-mono font-bold block mt-0.5 ${user.isGuest ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {user.isGuest ? "OFFLINE ONLY" : "CLOUD ACCREDITED"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Verification bottom guidelines */}
              <div className="p-5 border border-white/5 bg-gray-950/15 rounded-3xl space-y-3.5 text-left select-none relative">
                <h4 className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-[#f1edd3] block">
                  HIPAA Security Status
                </h4>
                <div className="space-y-2 text-xs font-sans text-zinc-400 leading-normal">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>Client Encryption Vault:</b> Biometrics are fully guarded with individual AES keys inside private window local session arrays.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>No Vendor Locking:</b> Download your medical records, clinical assistant logs, and biometric diagnostics anytime as physical reports.</span>
                  </div>
                </div>

                {/* Print clinical record summary action */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      playBeep(1400, 0.2);
                      window.print();
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-white/20 text-white font-mono text-[10px] transition-all font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-[#f1edd3]" />
                    <span>PRINT EHR CLINICAL REPORT SUMMARY</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Box: Editable Biometric baselines, known conditions & ICE profiles */}
            <div className="lg:col-span-7">
              <div className="p-6 md:p-8 border border-white/10 bg-slate-950/80 rounded-3xl shadow-xl backdrop-blur-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500/20 to-transparent" />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-display font-medium text-white tracking-tight">
                      Clinical Biometric Credentials
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">
                      Edit customizable details for AI diagnostic grounding
                    </p>
                  </div>
                  
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        playBeep(1000, 0.08);
                      }}
                      className="px-4 py-2 rounded-xl bg-violet-600/10 border border-violet-500/30 text-violet-300 hover:bg-violet-600 hover:text-white transition-all text-xs font-mono font-bold cursor-pointer"
                    >
                      Update Records
                    </button>
                  )}
                </div>

                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>SUCCESS: Your EHR Medical Card & baseline metrics have been re-calibrated correctly!</span>
                  </motion.div>
                )}

                {user.isGuest && (
                  <div className="mb-6 p-4 bg-amber-950/20 border border-amber-500/10 text-amber-300 rounded-2xl text-[11px] font-sans leading-relaxed flex items-start gap-3">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <b>Interactive Sandboxed Guest Session:</b> You are logged in locally. Creating a <b>Verified Provider Account</b> protects your logs, syncs metrics to the cloud, and unlocks complete remote clinical diagnostics.
                    </div>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    
                    {/* Field 1: Name */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase select-none">
                        Provider Full Display Name
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-55"
                      />
                    </div>

                    {/* Field 2: DOB */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase select-none">
                        Identifiable Birthdate
                      </label>
                      <input
                        type="date"
                        disabled={!isEditing}
                        value={editBirthdate}
                        onChange={(e) => setEditBirthdate(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-55"
                      />
                    </div>

                    {/* Field 3: Blood Type Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase select-none">
                        Blood Type Classification
                      </label>
                      {isEditing ? (
                        <select
                          value={editBloodType}
                          onChange={(e) => setEditBloodType(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 px-3 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                          {["O-Positive", "O-Negative", "A-Positive", "A-Negative", "B-Positive", "B-Negative", "AB-Positive", "AB-Negative"].map((bt) => (
                            <option key={bt} value={bt} className="bg-slate-950 text-white">{bt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          disabled
                          value={editBloodType}
                          className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs font-sans text-white disabled:opacity-55"
                        />
                      )}
                    </div>

                    {/* Field 4: Emergency Contacts */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase select-none">
                        Emergency Contact (Primary Rel)
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        placeholder="Name & Relationship"
                        value={editEmergencyContact}
                        onChange={(e) => setEditEmergencyContact(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-55"
                      />
                    </div>

                    {/* Field 5: Phone Contact */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase select-none">
                        ICE Secure Secondary Contact Phone
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        placeholder="+1 (555) 000-0000"
                        value={editEmergencyPhone}
                        onChange={(e) => setEditEmergencyPhone(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-55"
                      />
                    </div>
                  </div>

                  {/* Known Allergies Field block (Width Full) */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase select-none">
                      Active Clinical Allergies & Drug Adverse Reactions
                    </label>
                    <textarea
                      disabled={!isEditing}
                      rows={2}
                      value={editAllergies}
                      onChange={(e) => setEditAllergies(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-55 resize-none"
                    />
                  </div>

                  {/* Chronic Conditions Field block (Width Full) */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase select-none">
                      Chronic Medical Conditions & Comorbidities
                    </label>
                    <textarea
                      disabled={!isEditing}
                      rows={2}
                      value={editConditions}
                      onChange={(e) => setEditConditions(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-55 resize-none"
                    />
                  </div>

                  {/* Edit save controls */}
                  {isEditing && (
                    <motion.div 
                      className="flex gap-3 justify-end pt-2"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          playBeep(650, 0.05);
                          // Reset edit values back to state values
                          setEditName(user.name || "");
                          setEditBirthdate(user.birthdate || "");
                          setEditBloodType(user.bloodType || "");
                          setEditAllergies(user.allergies || "");
                          setEditConditions(user.conditions || "");
                          setEditEmergencyContact(user.emergencyContact || "");
                          setEditEmergencyPhone(user.emergencyPhone || "");
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-all text-xs font-mono font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white transition-all text-xs font-mono font-bold hover:brightness-115 active:scale-97 cursor-pointer"
                      >
                        Commit Changes
                      </button>
                    </motion.div>
                  )}
                </form>

                {/* Audit Trial Section */}
                <div className="relative mt-8 pt-6 border-t border-white/5 text-left">
                  <div className="flex items-center gap-2 text-violet-400 mb-4 animate-pulse">
                    <ClipboardList className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold block">
                      Local Session Security & Auditing Trail
                    </span>
                  </div>
                  
                  <div className="p-3 bg-black/30 border border-white/5 rounded-2xl text-[11px] space-y-2.5">
                    <div className="flex justify-between items-center text-zinc-500 font-mono text-[10px]">
                      <span>AUDIT ACTIVITY</span>
                      <span>SECURE LOCAL TIMESTAMP</span>
                    </div>
                    <div className="h-[1px] bg-white/5" />
                    <div className="space-y-1.5 font-sans">
                      <div className="flex justify-between text-zinc-300">
                        <span>• Security credential validation checked</span>
                        <span className="text-zinc-500 font-mono text-[9px] uppercase font-extrabold">Just now</span>
                      </div>
                      <div className="flex justify-between text-zinc-300">
                        <span>• AES local vault session provisioning</span>
                        <span className="text-zinc-500 font-mono text-[9px] uppercase font-extrabold">Logged</span>
                      </div>
                      <div className="flex justify-between text-zinc-300 font-semibold text-violet-400">
                        <span>• Clinical diagnosis assistance sandbox ready</span>
                        <span className="text-zinc-500 font-mono text-[9px] uppercase font-extrabold">Active</span>
                      </div>
                    </div>
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
