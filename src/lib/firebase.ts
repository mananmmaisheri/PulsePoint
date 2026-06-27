// /src/lib/firebase.ts
// 100% Offline-First Local Storage Engine replacing the remote database setup.

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string;
  isGuest: boolean;
  birthdate?: string;
  bloodType?: string;
  allergies?: string;
  conditions?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  joinedDate?: string;
  createdAt?: any;
}

export interface Medication {
  id?: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  takenToday: boolean;
  history: string[];
  createdAt?: any;
}

export interface VitalRecord {
  id?: string;
  userId: string;
  timestamp: any;
  bpm: number;
  bloodOxygen: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  waterIntake: number;
  sleepHours: number;
}

export interface MedicalRecord {
  id?: string;
  userId: string;
  fileName: string;
  fileType: string;
  uploadedAt: any;
  category: string;
  summary: string;
  doctorName?: string;
  fileData: string; // Base64 content
}

export interface SOSLog {
  id?: string;
  userId: string;
  timestamp: any;
  location: { lat: number; lng: number };
  status: "triggered" | "resolved";
  message: string;
}

// Dummy auth and db objects to satisfy imports without errors
export const auth = {
  currentUser: { uid: "pulsepoint-local-user-id", email: "clinician@pulsepoint.ai" },
  signOut: async () => {}
};

export const db = {};

// Helper: safe localStorage access
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// User Profile DB Operations
export async function saveUserProfile(uid: string, data: Partial<UserProfileData>) {
  const profiles = getLocalItem<Record<string, UserProfileData>>("pulsepoint_offline_profiles", {});
  const existing = profiles[uid] || {
    uid,
    email: "clinician@pulsepoint.ai",
    displayName: "Dr. Jordan Henderson",
    isGuest: false,
    joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
  };
  profiles[uid] = { ...existing, ...data, createdAt: existing.createdAt || new Date().toISOString() };
  setLocalItem("pulsepoint_offline_profiles", profiles);
}

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const profiles = getLocalItem<Record<string, UserProfileData>>("pulsepoint_offline_profiles", {});
  return profiles[uid] || {
    uid,
    email: "clinician@pulsepoint.ai",
    displayName: "Dr. Jordan Henderson",
    isGuest: false,
    joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    birthdate: "1994-08-15",
    bloodType: "A-Positive",
    allergies: "No declared allergies",
    conditions: "Healthy Baseline",
    emergencyContact: "Emergency Dispatch",
    emergencyPhone: "911"
  };
}

// Medication DB Operations
export async function addMedication(med: Omit<Medication, "id">): Promise<string> {
  const medications = getLocalItem<Medication[]>("pulsepoint_offline_medications", []);
  const id = "med_" + Math.random().toString(36).substring(2, 11);
  const newMed: Medication = { ...med, id, createdAt: new Date().toISOString() };
  medications.push(newMed);
  setLocalItem("pulsepoint_offline_medications", medications);
  return id;
}

export async function fetchMedications(userId: string): Promise<Medication[]> {
  const medications = getLocalItem<Medication[]>("pulsepoint_offline_medications", []);
  return medications.filter(m => m.userId === userId);
}

export async function updateMedication(id: string, updates: Partial<Medication>) {
  const medications = getLocalItem<Medication[]>("pulsepoint_offline_medications", []);
  const idx = medications.findIndex(m => m.id === id);
  if (idx !== -1) {
    medications[idx] = { ...medications[idx], ...updates };
    setLocalItem("pulsepoint_offline_medications", medications);
  }
}

export async function deleteMedication(id: string) {
  const medications = getLocalItem<Medication[]>("pulsepoint_offline_medications", []);
  const filtered = medications.filter(m => m.id !== id);
  setLocalItem("pulsepoint_offline_medications", filtered);
}

// Vitals History DB Operations
export async function addVitalRecord(vital: Omit<VitalRecord, "id">): Promise<string> {
  const vitals = getLocalItem<VitalRecord[]>("pulsepoint_offline_vitals", []);
  const id = "vital_" + Math.random().toString(36).substring(2, 11);
  const newVital: VitalRecord = { ...vital, id, timestamp: new Date().toISOString() };
  vitals.push(newVital);
  setLocalItem("pulsepoint_offline_vitals", vitals);
  return id;
}

export async function fetchVitalsHistory(userId: string): Promise<VitalRecord[]> {
  const vitals = getLocalItem<VitalRecord[]>("pulsepoint_offline_vitals", []);
  return vitals.filter(v => v.userId === userId);
}

// Medical Records Vault DB Operations
export async function addMedicalRecord(rec: Omit<MedicalRecord, "id">): Promise<string> {
  const records = getLocalItem<MedicalRecord[]>("pulsepoint_offline_records", []);
  const id = "rec_" + Math.random().toString(36).substring(2, 11);
  const newRec: MedicalRecord = { ...rec, id, uploadedAt: new Date().toISOString() };
  records.push(newRec);
  setLocalItem("pulsepoint_offline_records", records);
  return id;
}

export async function fetchMedicalRecords(userId: string): Promise<MedicalRecord[]> {
  const records = getLocalItem<MedicalRecord[]>("pulsepoint_offline_records", []);
  return records.filter(r => r.userId === userId);
}

export async function deleteMedicalRecord(id: string) {
  const records = getLocalItem<MedicalRecord[]>("pulsepoint_offline_records", []);
  const filtered = records.filter(r => r.id !== id);
  setLocalItem("pulsepoint_offline_records", filtered);
}

// SOS Logs DB Operations
export async function addSOSLog(log: Omit<SOSLog, "id">): Promise<string> {
  const logs = getLocalItem<SOSLog[]>("pulsepoint_offline_sos", []);
  const id = "sos_" + Math.random().toString(36).substring(2, 11);
  const newLog: SOSLog = { ...log, id, timestamp: new Date().toISOString() };
  logs.push(newLog);
  setLocalItem("pulsepoint_offline_sos", logs);
  return id;
}

export async function fetchSOSLogs(userId: string): Promise<SOSLog[]> {
  const logs = getLocalItem<SOSLog[]>("pulsepoint_offline_sos", []);
  return logs.filter(l => l.userId === userId);
}
