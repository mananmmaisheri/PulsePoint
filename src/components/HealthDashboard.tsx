import React, { useState, useEffect } from "react";
import {
  Activity,
  Plus,
  BellRing,
  Heart,
  Droplet,
  Award,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  HeartPulse
} from "lucide-react";
import { Reminder, UserHealthProfile } from "../types";

export default function HealthDashboard() {
  // 1. Core Profile states
  const [profile, setProfile] = useState<UserHealthProfile>(() => {
    const saved = localStorage.getItem("pulsepoint_profile");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Alex Carter",
          birthdate: "1988-11-24",
          bloodType: "O-Positive",
          allergies: "Penicillin, Tree nuts",
          conditions: "Mild asthma, High work-related stress",
          emergencyContacts: [],
        };
  });

  // 2. Reminders schedule states
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem("pulsepoint_reminders");
    return saved
      ? JSON.parse(saved)
      : [
          { id: "rem-1", name: "Albuterol Inhaler", type: "medication", time: "08:00", dosage: "2 puffs as urgent", active: true, takenToday: false },
          { id: "rem-2", name: "Atorvastatin (Lipitor)", type: "medication", time: "21:00", dosage: "10 mg tablet", active: true, takenToday: false },
          { id: "rem-3", name: "Vitals Telemetry Review", type: "appointment", time: "14:30", date: "2026-06-12", doctor: "Dr. Raymond Evans", active: true },
        ];
  });

  // 3. Biometric IoT metrics & PPG Calibration
  const [steps, setSteps] = useState(6420);
  const [water, setWater] = useState(1250); // ml
  const [bpm, setBpm] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [hrv, setHrv] = useState(65);
  const [baselineBpm, setBaselineBpm] = useState<number>(72);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // 4. Timer & Live Watch Clocks
  const [systemTime, setSystemTime] = useState<Date>(new Date());
  const [lastCheckedMin, setLastCheckedMin] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 5. Active Alert Alarm overlays state
  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);

  // New medication form inputs state
  const [newMed, setNewMed] = useState({ name: "", time: "", dosage: "" });

  useEffect(() => {
    localStorage.setItem("pulsepoint_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("pulsepoint_reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Request system notification permission on load
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Interactive Optical PPG scanner processing loop
  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            // Calibrate physiologic metrics based on selected baseline
            setBpm(baselineBpm + Math.floor(Math.random() * 4 - 2));
            setSpo2(97 + Math.floor(Math.random() * 3));
            setHrv(Math.max(38, Math.round(135 - baselineBpm + (Math.random() * 10 - 5))));
            // Double scan confirmation beeps
            playSingleBeep(1000, 0.12);
            setTimeout(() => {
              playSingleBeep(1500, 0.12);
            }, 150);
            return 100;
          }
          if (prev % 20 === 0) {
            playSingleBeep(900, 0.05);
          }
          return prev + 5;
        });
      }, 120);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(interval);
  }, [isScanning, baselineBpm]);

  // Safe helper audio tone generator
  const playSingleBeep = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const audioCtx = new Ctx();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {}
  };

  // Play standard professional audio beeps during alarm triggers
  const playAlarmBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime); // medical high-pitch sine
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3); // Short pulse
    } catch (err) {
      console.warn("Audio chime block or unsupported context:", err);
    }
  };

  // Clock updates checked every second to match medicine clocks
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setSystemTime(now);

      // Local hour-minute string, e.g. "08:00"
      const currentHoursStr = now.getHours().toString().padStart(2, "0");
      const currentMinsStr = now.getMinutes().toString().padStart(2, "0");
      const minuteKey = `${currentHoursStr}:${currentMinsStr}`;

      // Check if minute tick changed to avoid multiple alarms within same minute
      if (minuteKey !== lastCheckedMin) {
        // Find matching active medicine scheduled now
        const triggered = reminders.find(
          (r) => r.active && r.type === "medication" && r.time === minuteKey && !r.takenToday
        );

        if (triggered) {
          triggerAlarm(triggered);
          setLastCheckedMin(minuteKey);
        }
      }
    }, 1000);

    return () => clearInterval(clockTimer);
  }, [reminders, lastCheckedMin]);

  // Method to trigger an alarm overlay and a system notification
  const triggerAlarm = (reminder: Reminder) => {
    setActiveAlarm(reminder);
    playAlarmBeep();

    // Trigger standard browser HTML5 notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("💊 PulsePoint Medication Reminder", {
        body: `It is time for your scheduled dosage of: ${reminder.name} (${reminder.dosage || "Generic Dosage"})`,
        icon: "/favicon.ico",
        requireInteraction: true
      });
    }
  };

  // Fast test button to trigger a medication alarm immediately with no delay of hours
  const triggerTestAlarm = () => {
    const testReminder: Reminder = {
      id: `test-rem-${Date.now()}`,
      name: "Emergency Cardio Multivitamin B-Complex",
      type: "medication",
      time: systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dosage: "1 Capsules with warm water",
      active: true,
      takenToday: false
    };
    triggerAlarm(testReminder);
  };

  // Handles marking medication as taken and silencing the alarm overlay
  const handleAcknowledgeAlarm = (markerId: string, markTaken: boolean) => {
    if (markTaken) {
      setReminders((prev) =>
        prev.map((r) => (r.id === markerId ? { ...r, takenToday: true } : r))
      );
    }
    setActiveAlarm(null);
  };

  // Quick Action Toggles
  const handleMarkTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, takenToday: !r.takenToday } : r))
    );
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.time) return;

    const added: Reminder = {
      id: `rem-${Date.now()}`,
      name: newMed.name,
      type: "medication",
      time: newMed.time,
      dosage: newMed.dosage || "1 pill/dose",
      active: true,
      takenToday: false,
    };
    setReminders((p) => [...p, added]);
    setNewMed({ name: "", time: "", dosage: "" });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Progress metrics calculation
  const stepPct = Math.min(100, Math.floor((steps / 10000) * 100));
  const waterPct = Math.min(100, Math.floor((water / 3000) * 100));

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-6 py-8" id="health-dashboard">
      
      {/* 2-Column Dashboard Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-white/5 pb-6 mb-8 items-center text-left">
        {/* Profile left */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-medium text-white tracking-tight">
              PulsePoint Active Health Cockpit
            </h1>
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-foreground/50 mt-1">
            Authorized telemetry synchronization mapping wearable vital logs, active blood oxygen indices, and medical reminder alarms.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="text-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-1.5 text-foreground/80">
              👤 Patient: <strong className="text-white">{profile.name}</strong>
            </span>
            <span className="text-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-1.5 text-foreground/80">
              🩸 Blood: <strong className="text-rose-400">{profile.bloodType}</strong>
            </span>
            <span className="text-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-1.5 text-foreground/80">
              ⚠️ Allergies: <strong className="text-amber-400">{profile.allergies || "None"}</strong>
            </span>
            <span className="text-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-1.5 text-foreground/80">
              🧬 Status: <span className="text-emerald-400 font-mono font-bold animate-pulse">● TELEMETRY LOCKED</span>
            </span>
          </div>
        </div>

        {/* Live System Digital Clock right */}
        <div className="lg:col-span-4 bg-[#0a0b1c]/80 border border-violet-500/20 px-5 py-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-500/10 rounded-full blur-xl" />
          <div className="text-[10px] uppercase font-mono tracking-widest text-violet-300 font-extrabold flex items-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-violet-400 animate-spin animate-duration-3000" />
            Active Clinical Clock
          </div>
          <p className="text-3xl font-mono font-black text-white tracking-wider leading-none">
            {systemTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono mt-1.5 font-bold uppercase">
            Localized Gateway • Standard GMT
          </span>
        </div>
      </div>

      {/* Prominent Daily Goal Trackers - Positioned dynamically at the top for first-class recognition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" id="prominent-goals-trackers">
        {/* Step Counts logs */}
        <div className="p-5 border border-white/5 bg-gray-950/15 rounded-3xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-violet-500/20 to-transparent" />
          
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-violet-400">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-violet-400" />
                <span className="text-xs uppercase font-mono tracking-widest font-extrabold text-violet-400 block">
                  Steps Tracking
                </span>
              </div>
              {steps >= 10000 ? (
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full animate-bounce">
                  <Award className="h-3 w-3" /> GOAL MET
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-500 font-bold">
                  Goal: 10k
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-black text-white tracking-tight">
                  {steps.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-500 font-mono">steps</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                Estimation: <b>{(steps * 0.0008).toFixed(2)} km</b> • <b>{Math.round(steps * 0.04)} kcal</b>
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stepPct}%` }} 
                />
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                 <span>Progress: {stepPct}%</span>
                 <span>10k steps base</span>
              </div>
            </div>
          </div>

          {/* Sync interactive log actions */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold">Log Sync:</span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    setSteps((p) => p + 500);
                    playSingleBeep(700, 0.08);
                  }} 
                  className="hover:bg-white/10 text-zinc-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10 active:scale-95 transition-all cursor-pointer font-bold font-mono text-[10px]"
                >
                  +500
                </button>
                <button 
                  onClick={() => {
                    setSteps((p) => p + 1050);
                    playSingleBeep(850, 0.08);
                  }} 
                  className="hover:bg-white/10 text-zinc-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10 active:scale-95 transition-all cursor-pointer font-bold font-mono text-[10px]"
                >
                  +1.0k
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fluid Intake Progress */}
        <div className="p-5 border border-white/5 bg-gray-950/15 rounded-3xl flex flex-col justify-between space-y-4 text-left relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-sky-500/20 to-transparent" />
          
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-sky-400">
              <div className="flex items-center gap-2">
                <Droplet className="h-4.5 w-4.5 text-sky-400 animate-pulse" />
                <span className="text-xs uppercase font-mono tracking-widest font-extrabold text-sky-400 block">
                  Fluid Hydration
                </span>
              </div>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase leading-none ${
                water < 1000 
                  ? "bg-rose-500/15 border-rose-500/20 text-rose-300"
                  : water < 2000
                    ? "bg-amber-500/15 border-amber-500/20 text-amber-300"
                    : "bg-emerald-500/15 border-emerald-500/20 text-emerald-300"
              }`}>
                {water < 1000 ? "Alert" : water < 2200 ? "Moderate" : "Hydrated"}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-black text-white tracking-tight">
                  {water}
                </span>
                <span className="text-xs text-zinc-500 font-mono">ml</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                {water >= 3000 ? (
                  <span className="text-emerald-400 font-bold">✓ Daily target fully achieved!</span>
                ) : (
                  <span>Unfilled gap: <b>{3000 - water} ml</b> left to hit target</span>
                )}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sky-600 to-blue-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${waterPct}%` }} 
                />
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                <span>Progress: {waterPct}%</span>
                <span>3,000 ml limit</span>
              </div>
            </div>
          </div>

          {/* Log Hydration interactive actions */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold">Log Water:</span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    setWater((p) => Math.min(3000, p + 250));
                    playSingleBeep(900, 0.08);
                  }} 
                  className="hover:bg-white/10 text-zinc-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10 active:scale-95 transition-all cursor-pointer font-bold font-mono text-[10px]"
                >
                  +250ml
                </button>
                <button 
                  onClick={() => {
                    setWater((p) => Math.min(3000, p + 500));
                    playSingleBeep(1100, 0.08);
                  }} 
                  className="hover:bg-white/10 text-zinc-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10 active:scale-95 transition-all cursor-pointer font-bold font-mono text-[10px]"
                >
                  +500ml
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Column: Medications Clocks & Alarms Schedule */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="border border-white/5 bg-gray-950/15 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/40 via-teal-500/30 to-transparent" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BellRing className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                  Prescription Reminders & Clock
                </h3>
                <p className="text-xs text-zinc-500">
                  Interactive scheduling logs linking browser system alarms with real physical notifications.
                </p>
              </div>

              {/* Utility Beep controls and instant diagnostic tester */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 transition-all cursor-pointer"
                  title={soundEnabled ? "Mute audio beeps" : "Unmute audio beeps"}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={triggerTestAlarm}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 hover:border-indigo-400 hover:bg-indigo-950/60 font-mono text-[10px] font-bold transition-all cursor-pointer active:scale-95 shadow-lg shrink-0"
                >
                  ⚡ Alarm test
                </button>
              </div>
            </div>

            {/* Reminders List catalog */}
            <div className="space-y-3.5">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 bg-white/[0.01] border rounded-2xl flex items-center justify-between transition-all ${
                    r.takenToday
                      ? "border-emerald-500/20 bg-emerald-950/10 opacity-70"
                      : "border-white/5 hover:border-violet-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                     <button
                      onClick={() => handleMarkTaken(r.id)}
                      className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                        r.takenToday
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-white/20 hover:border-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      {r.takenToday && <CheckCircle className="h-4 w-4" />}
                    </button>

                    <div>
                      <p className={`text-sm font-semibold leading-normal ${r.takenToday ? "text-zinc-500 line-through" : "text-white"}`}>
                        {r.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                        <span className="bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded text-zinc-400">
                          {r.dosage || "No specifics"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Time: {r.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteReminder(r.id)}
                    className="text-zinc-600 hover:text-rose-400 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Addition Form */}
            <form onSubmit={handleAddMedication} className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-12 gap-3 text-left">
              <div className="md:col-span-5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lipitor Tablet"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/10 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="md:col-span-4">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">Dosage Strengths</label>
                <input
                  type="text"
                  placeholder="e.g. 10mg once daily"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/10 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="md:col-span-3 flex gap-2.5 items-end">
                <div className="flex-1">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block mb-1">Alarm Time</label>
                  <input
                    type="time"
                    value={newMed.time}
                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 cursor-pointer text-center font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg transition-all h-10 w-10 flex items-center justify-center rounded-xl shrink-0 cursor-pointer text-white"
                  title="Add Reminder Alert"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: High Fidelity Wearable Telemetry & Biometric Goals */}
        <div className="lg:col-span-6 space-y-6">

          {/* Interactive PPG Finger Oximeter Scanner panel SECOND */}
          <div className="p-6 border border-white/5 bg-gray-950/15 rounded-3xl space-y-5 text-left">
            
            <div className="flex items-center justify-between text-rose-400">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-rose-500 animate-pulse" />
                <span className="text-xs uppercase font-mono tracking-widest font-extrabold text-rose-400 block">
                  PPG Optical Biometric Sensor
                </span>
              </div>
              <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono font-bold uppercase rounded px-2 py-0.5">
                Physical Calibrator
              </span>
            </div>

            {/* Baseline Calibrator Selection Options - allows direct user grounding control */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase block">1. Calibrate Rest Baseline</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "Athletic (54)", bpm: 54, info: "High vagence tone" },
                  { label: "Optimal (72)", bpm: 72, info: "Standard norm" },
                  { label: "Stressed (95)", bpm: 95, info: "Elevated pulse" },
                ].map((item) => (
                  <button
                    key={item.bpm}
                    type="button"
                    onClick={() => {
                      setBaselineBpm(item.bpm);
                      playSingleBeep(600, 0.08);
                      // Reset to new baseline immediately for fluid use
                      setBpm(item.bpm + Math.floor(Math.random() * 3 - 1));
                    }}
                    className={`py-2 px-1 text-[10px] font-bold font-mono rounded-xl border transition-all cursor-pointer text-center ${
                      baselineBpm === item.bpm 
                        ? "bg-rose-500/10 border-rose-500/60 text-rose-300 shadow-[0_0_12px_rgba(239,68,68,0.1)]" 
                        : "bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    <div>{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Place finger optical scan button */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase block">2. Optical Biometric Scan Pad</span>
              
              <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-3 rounded-2xl">
                {/* Visual scan touch button pad */}
                <button
                  type="button"
                  onMouseDown={() => {
                    setIsScanning(true);
                  }}
                  onMouseUp={() => {
                    if (scanProgress < 100) {
                      setIsScanning(false);
                    }
                  }}
                  onMouseLeave={() => {
                    if (scanProgress < 100) {
                      setIsScanning(false);
                    }
                  }}
                  onTouchStart={() => {
                    setIsScanning(true);
                  }}
                  onTouchEnd={() => {
                    if (scanProgress < 100) {
                      setIsScanning(false);
                    }
                  }}
                  className={`h-16 w-16 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center shrink-0 cursor-pointer ${
                    isScanning 
                      ? "bg-rose-500/30 border-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-95" 
                      : "bg-[#180309]/80 border-rose-500/30 hover:border-rose-400/60 shadow-[0_0_10px_rgba(239,68,68,0.08)]"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isScanning ? "animate-ping" : "animate-pulse"}`}>
                    <HeartPulse className="h-5 w-5 text-rose-500" />
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  {isScanning ? (
                    <div className="space-y-1">
                      <p className="text-[11px] font-mono font-extrabold text-[#f1edd3] animate-pulse">🔴 SCANNING VASCULAR FLUCTUATION...</p>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                      </div>
                      <p className="text-[9px] text-zinc-400 font-mono">Keep cursor pressed: {scanProgress}% complete</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-white leading-tight">Touch & Hold Optical Zone</p>
                      <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                        Press and hold the red pad for a 3-second diagnostic calibration of your real heart metrics.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Display calibrated outcomes */}
            <div className="grid grid-cols-3 gap-2.5 pt-1.5 text-center">
              <div className="bg-[#120509]/60 border border-rose-500/10 p-2.5 rounded-xl">
                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Heart Pulse</span>
                <strong className="text-xl font-mono text-rose-100 block mt-0.5">{bpm} <span className="text-[10px] text-zinc-500 font-normal">BPM</span></strong>
              </div>

              <div className="bg-[#120509]/60 border border-rose-500/10 p-2.5 rounded-xl">
                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Blood Oxygen</span>
                <strong className="text-xl font-mono text-indigo-200 block mt-0.5">{spo2} <span className="text-[10px] text-zinc-500 font-normal">%</span></strong>
              </div>

              <div className="bg-[#120509]/60 border border-rose-500/10 p-2.5 rounded-xl">
                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">HRV Variance</span>
                <strong className="text-xl font-mono text-emerald-200 block mt-0.5">{hrv} <span className="text-[10px] text-zinc-500 font-normal">ms</span></strong>
              </div>
            </div>

            {/* Graphic heartbeat waves representations */}
            <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl text-xs">
              <span className="text-zinc-500 font-mono text-[9px] uppercase font-bold">Autonomic Wave:</span>
              <div className="flex items-center gap-1.5 h-6 shrink-0 pr-1">
                {[0.4, 0.8, 1.4, 1.0, 0.3, 0.9, 1.5, 0.5, 0.2, 0.8].map((scale, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-rose-500"
                    style={{
                      height: `${scale * 100}%`,
                      animation: "heart-pulse 1.6s infinite ease-in-out",
                      animationDelay: `${i * 0.12}s`
                    }}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Prominent physical medication alarm overlay Modal */}
      {activeAlarm && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0b0c1e] border border-emerald-500/30 max-w-md w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col p-8 text-center items-center gap-6 relative">
            
            {/* Visual emerald pulsing halo */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 scale-100 animate-pulse">
              <Bell className="h-8 w-8 animate-bounce" />
            </div>

            <div className="space-y-2 text-center">
              <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-1.5 rounded-full">
                🚨 Scheduled Medication Alarm
              </span>
              <h2 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight mt-2.5">
                {activeAlarm.name}
              </h2>
              <p className="text-xs text-emerald-300/80 font-mono">
                Scheduled Hour: {activeAlarm.time} • Dosage Rule: {activeAlarm.dosage || "1 Dose Unit"}
              </p>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-normal px-2">
              **Clinical Instruction Notice**: Please verify compound brand details and match prescription numbers precisely before swallowing dose packages. Avoid double-dose cycles under any circumstances.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 w-full mt-2">
              <button
                onClick={() => handleAcknowledgeAlarm(activeAlarm.id, true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-4.5 rounded-2xl active:scale-98 transition-all hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
              >
                ✓ Mark Medication as Taken
              </button>
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => handleAcknowledgeAlarm(activeAlarm.id, false)}
                  className="bg-white/5 border border-white/10 text-xs font-semibold py-3.5 rounded-2xl hover:bg-white/10 text-zinc-300 transition-all cursor-pointer"
                >
                  Snooze 5 Mins
                </button>
                <button
                  onClick={() => setActiveAlarm(null)}
                  className="bg-white/5 border border-white/10 text-xs font-semibold py-3.5 rounded-2xl hover:bg-white/10 text-zinc-300 transition-all cursor-pointer"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
