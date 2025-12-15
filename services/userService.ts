import { User, UserRole } from '../types';
import { supabase } from './supabaseClient';
import { saveUserToDB, getAllUsersFromDB } from './db';

const USERS_KEY = 'mediscan_users';

// Fallback Mock Data
const MOCK_USERS: User[] = [
  { id: '1', name: 'د. أحمد محمد', email: 'admin@mediscan.ai', phoneNumber: '01000000000', password: '123', role: 'Admin', status: 'Active', lastLogin: Date.now() - 3600000 },
  { id: '2', name: 'د. سارة علي', email: 'sara@mediscan.ai', phoneNumber: '01100000000', password: '123', role: 'Doctor', status: 'Active', lastLogin: Date.now() - 86400000 },
  { id: '3', name: 'أ. سامي السيد', email: 'patient@mediscan.ai', phoneNumber: '01200000000', password: '123', role: 'Patient', status: 'Active', lastLogin: Date.now() - 400000, assignedDoctorId: '2' },
];

/**
 * Initializes users by checking LocalStorage, then DB, then Mock.
 * Ensures DB is synced with current state.
 */
const initializeUsers = async () => {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
        // Ensure these exist in DB too
        const users = JSON.parse(stored) as User[];
        for (const u of users) {
            await saveUserToDB(u);
        }
    } else {
        // Try DB
        const dbUsers = await getAllUsersFromDB();
        if (dbUsers.length > 0) {
            localStorage.setItem(USERS_KEY, JSON.stringify(dbUsers));
        } else {
            // Fallback to Mock
            localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
            for (const u of MOCK_USERS) {
                await saveUserToDB(u);
            }
        }
    }
};
// Trigger initialization
initializeUsers();

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    return MOCK_USERS;
  }
  return JSON.parse(stored);
};

export const getPatients = (): User[] => {
  return getUsers().filter(user => user.role === 'Patient' && user.status === 'Active');
};

export const getPatientsForDoctor = (doctorId: string): User[] => {
  return getUsers().filter(user => user.role === 'Patient' && user.status === 'Active' && user.assignedDoctorId === doctorId);
};

export const getDoctors = (): User[] => {
  return getUsers().filter(user => (user.role === 'Doctor' || user.role === 'Admin') && user.status === 'Active');
};

export const getUserById = (id: string): User | undefined => {
  return getUsers().find(user => user.id === id);
};

// --- Authentication ---

export const loginUser = async (email: string, password?: string): Promise<User | null> => {
  // 1. Try Supabase Login
  if (supabase && password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          // Map DB profile to User type
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            status: 'Active', // Assuming active if can login
            phoneNumber: profile.phone_number,
            assignedDoctorId: profile.assigned_doctor_id,
            lastLogin: Date.now()
          };
        }
      }
    } catch (err) {
      console.warn("Supabase login failed, trying local...", err);
    }
  }

  // 2. Fallback to Local Mock Data
  console.log("Using local mock authentication");
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'Active');
  
  if (user) {
    if (password && user.password && user.password !== password) {
      return null;
    }
    user.lastLogin = Date.now();
    saveUser(user); // Update last login in local storage AND DB
    return user;
  }
  return null;
};

// --- User Management ---

export const saveUser = (user: User): User[] => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index >= 0) {
    if (!user.password) {
      user.password = users[index].password;
    }
    users[index] = user;
  } else {
    if (!user.password) user.password = '123456';
    users.push(user);
  }
  
  // 1. Save to Local Storage (RAM/Session)
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // 2. Save to IndexedDB (Persistence for Backup)
  saveUserToDB(user);

  return users;
};

export const deleteUser = (id: string): User[] => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  // Note: We are not deleting from IndexedDB in this snippet to keep it simple, 
  // but a real implementation should handle soft deletes.
  return users;
};

export const updatePassword = (userId: string, oldPass: string, newPass: string): { success: boolean; message: string } => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) return { success: false, message: 'المستخدم غير موجود' };

  const user = users[userIndex];
  if (user.password !== oldPass) {
    return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
  }

  user.password = newPass;
  users[userIndex] = user;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  saveUserToDB(user); // Persist to DB
  
  const currentUserJson = localStorage.getItem('mediscan_user');
  if (currentUserJson) {
      const currentUser = JSON.parse(currentUserJson);
      if (currentUser.id === userId) {
          currentUser.password = newPass;
          localStorage.setItem('mediscan_user', JSON.stringify(currentUser));
      }
  }

  return { success: true, message: 'تم تحديث كلمة المرور بنجاح' };
};

export const resetPassword = (email: string, phone: string, newPass: string): { success: boolean; message: string } => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  if (userIndex === -1) {
    return { success: false, message: 'البريد الإلكتروني غير مسجل' };
  }

  const user = users[userIndex];
  if (!user.phoneNumber || user.phoneNumber !== phone) {
    return { success: false, message: 'رقم الهاتف غير مطابق للسجلات' };
  }

  user.password = newPass;
  users[userIndex] = user;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  saveUserToDB(user); // Persist to DB

  return { success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.' };
};

export const updateUserProfile = (userId: string, name: string, email: string, phoneNumber?: string): { success: boolean; message: string; user?: User } => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
  
    if (userIndex === -1) return { success: false, message: 'المستخدم غير موجود' };
  
    const emailExists = users.some(u => u.email === email && u.id !== userId);
    if (emailExists) return { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' };

    const user = users[userIndex];
    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;
    
    users[userIndex] = user;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    saveUserToDB(user); // Persist to DB

    const currentUserJson = localStorage.getItem('mediscan_user');
    if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        if (currentUser.id === userId) {
            currentUser.name = name;
            currentUser.email = email;
            currentUser.phoneNumber = phoneNumber;
            localStorage.setItem('mediscan_user', JSON.stringify(currentUser));
        }
    }

    return { success: true, message: 'تم تحديث البيانات بنجاح', user };
};