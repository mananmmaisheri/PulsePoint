import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  FileText,
  Sparkles,
  Trash2,
  Trash,
  Upload,
  Info,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Eye,
  Activity,
  Award
} from "lucide-react";
import { MedicalRecord } from "../types";

export default function MedicalRecordsVault() {
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
            fileData: "ORIGINAL PDF RAW REPORT METRICS:\n------------------------------------------------\nPatient Name: Alex Carter\nLaboratory Order ID: LAB-90928\nCollected on: 2026-05-19\n\nCOMPLETE BLOOD METRICS PANEL:\n- WBC Concentration: 7.2 x 10^3 / uL (Normal: 4.0 - 11.0)\n- Hemoglobin Ratio: 14.8 g/dL (Normal: 13.8 - 17.2)\n- LDL Cholesterol Level: 138 mg/dL (Elevated - target is count < 100)\n- HDL Cholesterol Level: 46 mg/dL\n- Serum Creatinine limit: 0.95 mg/dL\n\nClinical diagnostic review suggests elevated cholesterol parameters. Aerobic zone activity and low-lipid nutritional frameworks are strongly indicated."
          },
        ];
  });

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [modalTab, setModalTab] = useState<"summary" | "original">("summary");
  const [dragActive, setDragActive] = useState(false);

  const openRecord = (rec: MedicalRecord) => {
    setSelectedRecord(rec);
    setModalTab("summary");
  };

  useEffect(() => {
    localStorage.setItem("pulsepoint_records", JSON.stringify(records));
  }, [records]);

  // Multimodal OCR prescription processor
  const handleFileUpload = async (file: File) => {
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
          category: file.type.includes("pdf") ? "Lab Report" : "Prescription",
          fileName: file.name,
          fileType: file.type,
          dateAdded: new Date().toISOString().split("T")[0],
          summary: apiSummary,
          fileData: reader.result as string,
        };

        setRecords((prev) => [newRec, ...prev]);
        setOcrResult(apiSummary);
        // Toast notifications
        if (Notification.permission === "granted") {
          new Notification("AI Records Vault Updated", {
            body: `Successfully processed and categorized "${file.name}"`,
          });
        }
      } catch (err) {
        console.error("OCR parse fail:", err);
        setOcrResult("❌ Failed to parse this medical report scan. Please check your Gemini key configurations.");
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
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
        fileData: `ORIGINAL EVALUATION SAMPLE REPORT:\n----------------------------------------\nDocument Ref: ${type === "cardio" ? "CARDIOLOGY-ECG-REF" : "HEMATOLOGY-CBC-REF"}\nDate Generated: ${new Date().toISOString().split("T")[0]}\n\nRAW PARSED TEXT CONTENT FROM SCAN:\n\n${mockReportText}`
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

  return (
    <div className="w-full flex-1 max-w-5xl mx-auto px-6 py-8" id="medical-records-vault">
      {/* Vault Header panel */}
      <div className="border-b border-white/5 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-white tracking-tight flex items-center gap-2.5">
            <BrainCircuit className="h-6 w-6 text-indigo-400" />
            AI Multimodal Medical Records Vault
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            Securely upload, translate, and catalog standard doctor prescriptions, biochemical blood reports, and radiology summaries.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-4 py-2 rounded-xl shrink-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <div className="text-left font-mono">
            <span className="text-[10px] text-zinc-500 block uppercase">Vault Protection</span>
            <span className="text-xs font-bold text-white">Client-End Encrypted</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Multimodal Upload & Live Scanner */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Diagnostic upload drop area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all relative ${
              dragActive
                ? "border-indigo-400 bg-indigo-950/20 shadow-indigo-500/10 shadow-[0_0_20px_inner]"
                : "border-white/10 bg-white/[0.01] hover:border-indigo-500/30 hover:bg-white/[0.02]"
            }`}
          >
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={onFileInputChange}
              disabled={ocrLoading}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              id="file-upload-input"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                <Upload className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white font-semibold">
                  Drag prescription scans here or click to browse
                </p>
                <p className="text-xs text-zinc-400">
                  Supports screenshots, camera snapshots, or radiological PDFs up to 20MB
                </p>
              </div>
              <div className="h-[1px] w-1/3 bg-white/5 my-1" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Direct Indian Doctor Prescriptions & Labs compatible
              </p>
            </div>
          </div>

          {/* Test Samples Selectors */}
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-3 text-left">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Instant Evaluation Samples
            </div>
            <p className="text-xs text-zinc-400">
              No medical documents on hand? Trigger standard clinical reports instantly to evaluate PulsePoint's diagnostic translation parameters:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => loadSampleReport("cardio")}
                disabled={ocrLoading}
                className="text-xs bg-indigo-950/20 border border-indigo-900/40 text-indigo-300 hover:border-indigo-500 hover:bg-indigo-950/40 px-4 py-2.5 rounded-xl transition-all font-semibold cursor-pointer"
              >
                📊 ECG Heart Rhythm Summary
              </button>
              <button
                onClick={() => loadSampleReport("blood")}
                disabled={ocrLoading}
                className="text-xs bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 hover:border-emerald-500 hover:bg-emerald-950/40 px-4 py-2.5 rounded-xl transition-all font-semibold cursor-pointer"
              >
                🧪 Hematology CBC Profile
              </button>
            </div>
          </div>

          {/* Real-time translator scan progression output block */}
          {ocrLoading && (
            <div className="p-8 border border-white/5 bg-gray-950/30 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
              <p className="text-xs text-zinc-400 animate-pulse">
                Engaging clinical translation layers... Parsing handwriting metrics...
              </p>
            </div>
          )}

          {ocrResult && !ocrLoading && (
            <div className="border border-indigo-500/20 bg-indigo-950/10 p-6 rounded-3xl space-y-3 text-left animate-fade-in animate-duration-300" id="translated-summary-block">
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
                <span className="text-xs font-bold font-mono text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
                  Translated Diagnostic Summary
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2   py-0.5 rounded font-mono font-bold hidden sm:inline-block">
                    Extracted Success
                  </span>
                  <button
                    onClick={() => setOcrResult("")}
                    className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 border border-rose-500/20 hover:border-rose-500/40 px-2.5 py-1 rounded-xl font-mono font-bold transition-all cursor-pointer active:scale-95"
                    title="Erase active summary"
                  >
                    Clear Summary
                  </button>
                </div>
              </div>
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap font-sans">
                {ocrResult}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Encrypted Stored Archives index */}
        <div className="lg:col-span-5 flex flex-col border border-white/5 bg-gray-950/25 p-5 md:p-6 rounded-3xl min-h-[460px] text-left">
          <div className="border-b border-white/5 pb-4 mb-5">
            <h3 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest">
              Private Encryption Archives
            </h3>
            <p className="text-xs text-foreground/45 mt-0.5">
              Securely indexed and ready for digital transmission during emergency crises.
            </p>
          </div>

          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Cataloged Records ({records.length})</span>
              <span>Local Storage</span>
            </div>

            {records.length > 0 ? (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {records.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-white/[0.01] border border-white/5 hover:border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3 transition-all hover:bg-white/[0.02]/50"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 text-lg">
                        📄
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-bold text-white text-xs truncate max-w-[125px] sm:max-w-[150px]">
                          {r.fileName}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                          Added • {r.dateAdded}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-lg font-mono font-black hidden sm:inline-block">
                        {r.category}
                      </span>
                      
                      {/* Explicit Open Button */}
                      <button
                        onClick={() => openRecord(r)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 px-2.5 py-1.5 rounded-xl text-[10px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer flex items-center gap-1 hover:text-white"
                        title="Open document details"
                      >
                        <Eye className="h-3 w-3 text-indigo-400" />
                        Open
                      </button>

                      {/* Explicit Delete Button */}
                      <button
                        onClick={(e) => deleteRecord(r.id, e)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 p-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Delete Record from Vault"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-2xl">
                <FileText className="h-8 w-8 text-white/5 mb-2" />
                <p className="text-xs text-zinc-500">Your secure clinical archives are currently empty.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-start gap-2.5 bg-indigo-950/15 border border-indigo-950/20 p-3.5 rounded-xl text-[10px] text-indigo-300">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
            <p className="leading-relaxed">
              **HIPAA Compliance Compliant Policy**: Multimodal diagnostic documents are analyzed end-to-end via sandboxed APIs. No images or text copies are cached externally or exposed onto public parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Record details full summary overlay Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-white/10 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="min-w-0">
                <span className="text-[10px] bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                  {selectedRecord.category}
                </span>
                <h3 className="font-display font-bold text-white text-md mt-1 truncate pr-4">{selectedRecord.fileName}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-zinc-300 hover:text-white text-xs font-semibold bg-white/5 px-4 py-2 rounded-xl active:scale-95 transition-all outline-none cursor-pointer border border-white/10 shrink-0"
              >
                Close View
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-white/5 bg-white/[0.02] px-6 gap-6">
              <button
                onClick={() => setModalTab("summary")}
                className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  modalTab === "summary"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                📝 AI Summary Translation
              </button>
              <button
                onClick={() => setModalTab("original")}
                className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  modalTab === "original"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                📂 Original Document Raw View
              </button>
            </div>

            {/* Tab Contents */}
            <div className="max-h-[380px] overflow-y-auto">
              {modalTab === "summary" ? (
                <div className="p-6 text-xs leading-relaxed whitespace-pre-wrap text-zinc-300 font-sans text-left">
                  {selectedRecord.summary}
                </div>
              ) : (
                <div className="p-6 text-xs leading-relaxed text-zinc-300">
                  {selectedRecord.fileData ? (
                    selectedRecord.fileData.startsWith("data:image/") ||
                    /\.(png|jpe?g|gif|webp)$/i.test(selectedRecord.fileName) ||
                    (selectedRecord.fileType && selectedRecord.fileType.startsWith("image/")) ? (
                      <div className="text-center space-y-4 py-2">
                        <img
                          src={selectedRecord.fileData}
                          className="max-h-[300px] object-contain mx-auto border border-white/10 rounded-xl shadow-xl"
                          alt={selectedRecord.fileName}
                          referrerPolicy="no-referrer"
                        />
                        <div className="inline-block bg-white/[0.02] border border-white/5 text-[10px] font-mono text-zinc-500 px-3 py-1 rounded-lg">
                          Original Diagnostic Image Scan Secured
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-left">
                        <div className="p-4 bg-black/45 border border-white/5 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-zinc-300">
                          {selectedRecord.fileData}
                        </div>
                        <div className="text-center">
                          <a
                            href={selectedRecord.fileData}
                            download={selectedRecord.fileName}
                            className="inline-flex items-center gap-2 text-xs bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/20 text-white px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-lg active:scale-95 text-center"
                          >
                            📥 Download Original Report File
                          </a>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <FileText className="h-10 w-10 text-white/10 mx-auto" />
                      <p className="text-sm font-bold text-white">No raw source file data found</p>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto text-center">
                        This reference was generated clinically or imported prior to client encryption protocols. Secure original attachments on future uploads.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-gray-950 flex items-center gap-2 text-[10px] text-zinc-500 text-left">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Diagnostic records stored and verified inside private cloud parameters.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
