import React, { useState, useEffect } from "react";
import {
  Activity,
  Plus,
  Compass,
  FileText,
  BellRing,
  Heart,
  Droplet,
  Users,
  Award,
  Trash2,
  BrainCircuit,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import { Reminder, MedicalRecord, UserHealthProfile } from "../types";

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
          { id: "rem-1", name: "Albuterol Inhaler", type: "medication", time: "08:00", dosage: "2 puffs as needed", active: true, takenToday: false },
          { id: "rem-2", name: "Atorvastatin (Lipitor)", type: "medication", time: "21:00", dosage: "10 mg tablet", active: true, takenToday: false },
          { id: "rem-3", name: "Dr. Evans (Cardio checkup)", type: "appointment", time: "14:30", date: "2026-06-12", doctor: "Dr. Raymond Evans", active: true },
        ];
  });

  // 3. Medical Records States
  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem("pulsepoint_records");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "rec-1",
            category: "Lab Report",
            fileName: "WBC_Blood_Biochemistry_Profile.pdf",
            fileType: "application/pdf",
            dateAdded: "2026-05-20",
            summary: "Extracted basic standard counts: White Blood Cells (WBC) at 7.2 x10^3/uL, hemoglobin normal at 14.8 g/dL. Cholesterols require supervision: LDL is at 138 mg/dL. Recommends aerobic activity and low lipid diets.",
          },
        ];
  });

  // 4. Fitness Metrics States
  const [steps, setSteps] = useState(6420);
  const [water, setWater] = useState(1250); // ml
  const [bpm, setBpm] = useState(74);

  // States for new inputs
  const [newMed, setNewMed] = useState({ name: "", time: "", dosage: "" });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    localStorage.setItem("pulsepoint_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("pulsepoint_reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("pulsepoint_records", JSON.stringify(records));
  }, [records]);

  // Periodic heartbeat animation
  useEffect(() => {
    const timer = setInterval(() => {
      setBpm((p) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = p + delta;
        return next < 60 ? 60 : next > 110 ? 110 : next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
      dosage: newMed.dosage || "1 pill",
      active: true,
      takenToday: false,
    };
    setReminders((p) => [...p, added]);
    setNewMed({ name: "", time: "", dosage: "" });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // OCR Prescription multi-modal processing helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrResult("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/analyze-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64Content,
            mimeType: file.type,
            reportText: `Scan of file name: ${file.name}`,
          }),
        });
        const data = await res.json();
        const apiSummary = data.summary || "Failed to analyze document";

        const newRec: MedicalRecord = {
          id: `rec-${Date.now()}`,
          category: "Prescription",
          fileName: file.name,
          fileType: file.type,
          dateAdded: new Date().toISOString().split("T")[0],
          summary: apiSummary,
        };

        setRecords((prev) => [newRec, ...prev]);
        setOcrResult(apiSummary);
      } catch (err) {
        console.error("OCR parse fail:", err);
        setOcrResult("❌ Failed to parse this medical report scan. Please check your Gemini key configurations.");
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Click on a sample clinical report to learn summaries instantly
  const loadSampleReport = async (type: "cardio" | "blood") => {
    setOcrLoading(true);
    setOcrResult("");

    const mockReportText =
      type === "cardio"
        ? "Patient: Alex Carter. ECG results: Sinus tachycardia at resting heartrate 104 bpm. QRS Axis: normal. S-T elevation absent. Incomplete right bundle branch block (RBBB) suggested but blood pressure elevated at 139/89 mmHg. Subject reports acute caffeine ingestion."
        : "Patient: Alex Carter. Complete Blood Count: Hemoglobin: 15.2 g/dL (Normal: 13-17). Platelets: 230 x10^3/uL. Red Blood Cells: 5.1 mil. ALT (Liver): 48 U/L (mildly elevated relative to 40 U/L base limit). Creatinine: 1.02 mg/dL. Recommends hydration cycle boost.";

    try {
      const res = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText: mockReportText }),
      });
      const data = await res.json();
      const apiSummary = data.summary || "Sample parsed output failed.";

      const newRec: MedicalRecord = {
        id: `rec-${Date.now()}`,
        category: type === "cardio" ? "General Note" : "Lab Report",
        fileName: type === "cardio" ? "ECG_Heart_Scan_Analysis.txt" : "Serum_Heme_Panel.csv",
        fileType: "text/plain",
        dateAdded: new Date().toISOString().split("T")[0],
        summary: apiSummary,
      };

      setRecords((prev) => [newRec, ...prev]);
      setOcrResult(apiSummary);
    } catch (e) {
      console.error(e);
      setOcrResult("❌ Sample report call failed.");
    } finally {
      setOcrLoading(false);
    }
  };

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecord?.id === id) setSelectedRecord(null);
  };

  // Metrics percentages
  const stepPct = Math.min(100, Math.floor((steps / 10000) * 100));
  const waterPct = Math.min(100, Math.floor((water / 3000) * 100));

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-6 py-8" id="health-dashboard">
      {/* 2-Column workspace header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-white/5 pb-6 mb-8">
        {/* Profile Card left */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-medium text-white tracking-tight">
              PulsePoint Active Health Cockpit
            </h1>
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-sm text-foreground/50 mt-1">
            Realtime workspace coordinating patient biosensors, medication clocks, and deep diagnostic analytical reports.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="text-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-1.5 text-foreground/80">
              👤 Patient: <strong className="text-white">{profile.name}</strong>
            </span>
            <span className="text-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-1.5 text-foreground/80">
              🩸 Blood: <strong className="text-rose-400">{profile.bloodType}</strong>
            </span>
            <span className="text-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-1.5 text-foreground/80">
              ⚠️ Allergies: <strong className="text-amber-400">{profile.allergies || "None declared"}</strong>
            </span>
            <span className="text-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-1.5 text-foreground/80">
              🧬 Status: <span className="text-emerald-400 font-mono font-bold animate-pulse">● VITAL STABLE</span>
            </span>
          </div>
        </div>

        {/* Live sensors right */}
        <div className="lg:col-span-4 flex justify-between gap-3">
          <div className="flex-1 bg-rose-950/20 border border-rose-900/30 p-4 rounded-2xl flex flex-col justify-between items-start">
            <div className="flex items-center justify-between w-full text-rose-400">
              <Heart className="h-5 w-5 text-rose-500 animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Biometrics</span>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-display font-black text-rose-100">{bpm}</p>
              <p className="text-[10px] text-rose-300/60 font-mono tracking-wider mt-0.5">CURRENT PULSE BPM</p>
            </div>
          </div>

          <div className="flex-1 bg-violet-950/20 border border-violet-900/30 p-4 rounded-2xl flex flex-col justify-between items-start">
            <div className="flex items-center justify-between w-full text-violet-400">
              <Award className="h-5 w-5 text-violet-500" />
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Progress</span>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-display font-black text-violet-100">{stepPct}%</p>
              <p className="text-[10px] text-violet-300/60 font-mono tracking-wider mt-0.5">DAILY STEPS TASK</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Fitness and Medications */}
        <div className="lg:col-span-6 space-y-8">
          {/* Fitness Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step Counter Widget */}
            <div className="p-5 border border-white/5 bg-gray-950/10 rounded-2xl flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-foreground/45 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-violet-400" /> Current Step Counts
                </p>
                <div className="flex items-baseline gap-2 mt-3">
                  <h3 className="text-3xl font-display font-extrabold text-white">{steps}</h3>
                  <span className="text-xs text-foreground/40 font-mono">/ 10k goal</span>
                </div>
              </div>

              {/* Steps Progress Slider */}
              <div className="mt-5 space-y-2">
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${stepPct}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-foreground/30">
                  <span>Simulate walk:</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSteps((p) => p + 500)} className="hover:text-white px-2 py-0.5 rounded bg-white/5">+500</button>
                    <button onClick={() => setSteps((p) => p + 1000)} className="hover:text-white px-2 py-0.5 rounded bg-white/5">+1k</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Water Tracker Widget */}
            <div className="p-5 border border-white/5 bg-gray-950/10 rounded-2xl flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-foreground/45 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplet className="h-4 w-4 text-sky-400" /> Fluid Intake Monitoring
                </p>
                <div className="flex items-baseline gap-2 mt-3">
                  <h3 className="text-3xl font-display font-extrabold text-white">{water}</h3>
                  <span className="text-xs text-foreground/40 font-mono">ml / 3L target</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${waterPct}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-foreground/30">
                  <span>Add Intake:</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setWater((p) => Math.min(3000, p + 250))} className="hover:text-white px-2 py-0.5 rounded bg-white/5">+250ml</button>
                    <button onClick={() => setWater((p) => Math.min(3000, p + 500))} className="hover:text-white px-2 py-0.5 rounded bg-white/5">+500ml</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medications Schedules Reminders */}
          <div className="border border-white/5 bg-gray-950/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BellRing className="h-4 w-4 text-emerald-400 animate-bounce" />
                Medications & Scheduling Clocks
              </h3>
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                ⏰ GMT ACTIVE
              </span>
            </div>

            {/* List */}
            <div className="space-y-3">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 bg-white/[0.01] border rounded-xl flex items-center justify-between transition-all ${
                    r.takenToday
                      ? "border-emerald-500/20 bg-emerald-950/10 opacity-70"
                      : "border-white/5 hover:border-violet-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleMarkTaken(r.id)}
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        r.takenToday
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-white/20 hover:border-violet-400"
                      }`}
                    >
                      {r.takenToday && <CheckCircle className="h-3 w-3" />}
                    </button>

                    <div>
                      <p className={`text-sm font-semibold ${r.takenToday ? "text-foreground/45 line-through" : "text-white"}`}>
                        {r.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-foreground/45 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-foreground/30" />
                          {r.dosage || "No Dose Details"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-foreground/30" />
                          {r.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteReminder(r.id)}
                    className="text-foreground/20 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* New Reminder Form */}
            <form onSubmit={handleAddMedication} className="mt-5 pt-5 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Medicine name"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                className="bg-white/[0.02] border border-white/15 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
              />
              <input
                type="text"
                placeholder="Dosage (e.g. 500mg)"
                value={newMed.dosage}
                onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                className="bg-white/[0.02] border border-white/15 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                  className="bg-white/[0.02] border border-white/15 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 flex-1 cursor-pointer"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer text-white"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: AI Medical Records vault */}
        <div className="lg:col-span-6 flex flex-col border border-white/5 bg-gray-950/20 backdrop-blur-md rounded-2xl p-6 min-h-[480px]">
          <div className="border-b border-white/5 pb-4 mb-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="h-4.5 w-4.5 text-violet-400" />
              AI Multimodal Medical Records Vault
            </h3>
            <p className="text-[11px] text-foreground/45 mt-0.5">
              Securely analyze and catalog handwritten prescriptions, blood report logs, or radiological summaries.
            </p>
          </div>

          {/* Sample quick summaries selectors */}
          <div className="flex items-center gap-2.5 mb-5 overflow-x-auto pb-1.5">
            <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest shrink-0">
              ⚡ Test samples:
            </span>
            <button
              onClick={() => loadSampleReport("cardio")}
              disabled={ocrLoading}
              className="text-xs bg-violet-950/20 border border-violet-950 px-3 py-1.5 rounded-lg text-violet-300 hover:bg-violet-950/40 hover:border-violet-600 transition-all cursor-pointer whitespace-nowrap"
            >
              📊 Cardiology ECG note
            </button>
            <button
              onClick={() => loadSampleReport("blood")}
              disabled={ocrLoading}
              className="text-xs bg-emerald-950/20 border border-emerald-950 px-3 py-1.5 rounded-lg text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-600 transition-all cursor-pointer whitespace-nowrap"
            >
              🧪 CBC Blood Panel Note
            </button>
          </div>

          {/* Upload panel */}
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-violet-500/20 transition-colors relative mb-6">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={ocrLoading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-foreground/20 animate-pulse" />
              <p className="text-xs text-foreground/80 font-semibold">
                {ocrLoading ? "Scanning Document find terms..." : "Drag details here or select scanned file"}
              </p>
              <p className="text-[10px] text-foreground/40 mt-1">
                Supports screenshots of paper prescriptions, blood lipids list and radiology PDFs.
              </p>
            </div>
          </div>

          {/* Summarizer live output box */}
          {ocrLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/10 border border-white/5 rounded-2xl text-center gap-2 mb-6">
              <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full" />
              <p className="text-xs text-foreground/40 animate-pulse">
                Deploying clinical diagnostic models. Translating jargon metrics...
              </p>
            </div>
          )}

          {ocrResult && !ocrLoading && (
            <div className="p-4 bg-violet-950/10 border border-violet-900/30 rounded-xl mb-6 text-xs leading-relaxed max-h-[250px] overflow-y-auto">
              <p className="font-semibold text-violet-300 flex items-center gap-1 text-xs uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Extracted Translation Summary
              </p>
              <div className="whitespace-pre-wrap text-foreground/85 font-sans">
                {ocrResult}
              </div>
            </div>
          )}

          {/* List of existing summaries */}
          <div className="flex-1 flex flex-col">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Stored Clinical Summaries ({records.length})
            </h4>

            {records.length > 0 ? (
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {records.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className="p-3.5 bg-white/[0.02] border border-white/5 hover:border-violet-500/25 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        📄
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white max-w-[200px] truncate">{r.fileName}</p>
                        <time className="text-[10px] text-foreground/35 font-mono">{r.dateAdded}</time>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-violet-600/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded font-mono font-bold">
                        {r.category}
                      </span>
                      <button
                        onClick={(e) => deleteRecord(r.id, e)}
                        className="text-foreground/20 hover:text-rose-400 p-1.5 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-foreground/30">Your medical vaults are currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record details full summary overlay Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-white/10 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div>
                <span className="text-[10px] bg-violet-600/20 border border-violet-500/30 text-violet-300 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                  {selectedRecord.category}
                </span>
                <h3 className="font-display font-bold text-white text-lg mt-1">{selectedRecord.fileName}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-foreground/42 hover:text-white text-xs font-semibold bg-white/5 px-3 py-1.5 rounded-lg active:scale-95 transition-all outline-none cursor-pointer"
              >
                Close View
              </button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
              {selectedRecord.summary}
            </div>

            <div className="p-4 border-t border-white/5 bg-gray-950 flex items-center gap-2.5 text-xs text-white/40">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Diagnostic record saved and authorized securely inside cloud parameters.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
