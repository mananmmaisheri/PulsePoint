export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
}

export interface UserHealthProfile {
  name: string;
  birthdate: string;
  bloodType: string;
  allergies: string;
  conditions: string; // Chronic conditions
  emergencyContacts: EmergencyContact[];
}

export interface FitnessMetrics {
  stepGoal: number;
  currentSteps: number;
  currentHeartRate: number;
  heartRateHistory: { time: string; bpm: number }[];
  activeCalories: number;
  sleepHours: number;
  waterIntakeMl: number;
}

export interface Reminder {
  id: string;
  name: string; // Medicine or Appointment Name
  type: "medication" | "appointment";
  time: string; // e.g. "08:00" or "14:30"
  dosage?: string; // for medication
  date?: string; // for appointment
  doctor?: string; // for appointment
  daysOfWeek?: string[]; // e.g. ["Mon", "Wed", "Fri"]
  active: boolean;
  takenToday?: boolean;
}

export interface MedicalRecord {
  id: string;
  fileName: string;
  fileType: string;
  dateAdded: string;
  summary: string;
  rawText?: string;
  category: "Prescription" | "Lab Report" | "Discharge Summary" | "General Note";
  fileData?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface HospitalResult {
  title: string;
  uri?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  snippet?: string;
}
