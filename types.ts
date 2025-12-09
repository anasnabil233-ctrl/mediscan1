
export interface AnalysisResult {
  diagnosis: string;
  confidence: string;
  findings: string[];
  recommendations: string[];
  summary: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface AnalysisError {
  message: string;
}

export interface AnalysisOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface SavedRecord {
  id: string;
  userId?: string; // ID of the user who saved/owns the record
  patientName?: string; // Optional name for display
  timestamp: number;
  result: AnalysisResult;
  imageData: string; // Base64
  category?: string; // Type of scan (e.g., X-Ray, MRI)
}

export type UserRole = 'Admin' | 'Doctor' | 'Patient';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string; // Added for password recovery
  password?: string; // Added for profile management simulation
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin?: number;
  assignedDoctorId?: string; // Optional: Links a patient to a specific doctor
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
}