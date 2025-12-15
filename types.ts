
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
  synced?: boolean; // True if saved to cloud, false if local only
}

export type UserRole = 'Admin' | 'Doctor' | 'Patient' | 'Supervisor';

export type AppPermission = 
  | 'manage_users'       // Can add/edit users (except Admins)
  | 'view_dashboard'     // Can access the main scanning dashboard
  | 'manage_database'    // Can access database stats and sync
  | 'manage_specialties' // Can add/edit specialties
  | 'view_reports';      // Can view patient reports

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
  permissions?: AppPermission[]; // List of specific permissions for Supervisors
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