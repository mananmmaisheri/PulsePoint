import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import config from "../../firebase-applet-config.json";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(config) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

// Helper Types
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

// User Profile DB Operations
export async function saveUserProfile(uid: string, data: Partial<UserProfileData>) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfileData;
  }
  return null;
}

// Medication DB Operations
export async function addMedication(med: Omit<Medication, "id">): Promise<string> {
  const coll = collection(db, "medications");
  const docRef = await addDoc(coll, {
    ...med,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function fetchMedications(userId: string): Promise<Medication[]> {
  const coll = collection(db, "medications");
  const q = query(coll, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication));
}

export async function updateMedication(id: string, updates: Partial<Medication>) {
  const docRef = doc(db, "medications", id);
  await updateDoc(docRef, updates);
}

export async function deleteMedication(id: string) {
  const docRef = doc(db, "medications", id);
  await deleteDoc(docRef);
}

// Vitals History DB Operations
export async function addVitalRecord(vital: Omit<VitalRecord, "id">): Promise<string> {
  const coll = collection(db, "vitals_history");
  const docRef = await addDoc(coll, {
    ...vital,
    timestamp: serverTimestamp()
  });
  return docRef.id;
}

export async function fetchVitalsHistory(userId: string): Promise<VitalRecord[]> {
  const coll = collection(db, "vitals_history");
  const q = query(coll, where("userId", "==", userId), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VitalRecord));
}

// Medical Records Vault DB Operations
export async function addMedicalRecord(rec: Omit<MedicalRecord, "id">): Promise<string> {
  const coll = collection(db, "medical_records");
  const docRef = await addDoc(coll, {
    ...rec,
    uploadedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function fetchMedicalRecords(userId: string): Promise<MedicalRecord[]> {
  const coll = collection(db, "medical_records");
  const q = query(coll, where("userId", "==", userId), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord));
}

export async function deleteMedicalRecord(id: string) {
  const docRef = doc(db, "medical_records", id);
  await deleteDoc(docRef);
}

// SOS Logs DB Operations
export async function addSOSLog(log: Omit<SOSLog, "id">): Promise<string> {
  const coll = collection(db, "sos_logs");
  const docRef = await addDoc(coll, {
    ...log,
    timestamp: serverTimestamp()
  });
  return docRef.id;
}

export async function fetchSOSLogs(userId: string): Promise<SOSLog[]> {
  const coll = collection(db, "sos_logs");
  const q = query(coll, where("userId", "==", userId), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SOSLog));
}
