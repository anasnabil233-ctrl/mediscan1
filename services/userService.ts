import { User, UserRole } from '../types';
import { supabase } from './supabaseClient';
import { saveUserToDB, getAllUsersFromDB, deleteUserFromDB } from './db';

const USERS_KEY = 'mediscan_users';

// Fallback Mock Data with Valid UUIDs for Supabase compatibility
const MOCK_USERS: User[] = [
  { id: 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', name: 'د. أحمد محمد', email: 'admin@mediscan.ai', phoneNumber: '01000000000', password: '123', role: 'Admin', status: 'Active', lastLogin: Date.now() - 3600000 },
  { id: 'b2c3d4e5-f6a7-4b5c-9d0e-1234567890bc', name: 'د. سارة علي', email: 'sara@mediscan.ai', phoneNumber: '01100000000', password: '123', role: 'Doctor', status: 'Active', lastLogin: Date.now() - 86400000 },
  { id: 'c3d4e5f6-a7b8-4c5d-0e1f-2345678901cd', name: 'أ. سامي السيد', email: 'patient@mediscan.ai', phoneNumber: '01200000000', password: '123', role: 'Patient', status: 'Active', lastLogin: Date.now() - 400000, assignedDoctorId: 'b2c3d4e5-f6a7-4b5c-9d0e-1234567890bc' },
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

/**
 * Refreshes the localStorage cache from IndexedDB.
 * Call this after a cloud sync to make sure the UI sees the new users.
 */
export const refreshLocalUsersFromDB = async (): Promise<User[]> => {
    try {
        const dbUsers = await getAllUsersFromDB();
        if (dbUsers.length > 0) {
            localStorage.setItem(USERS_KEY, JSON.stringify(dbUsers));
            return dbUsers;
        }
    } catch (e) {
        console.error("Error refreshing users from DB:", e);
    }
    return getUsers();
};

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

export const saveUser = async (user: User): Promise<User[]> => {
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
  await saveUserToDB(user);

  // 3. Save to Supabase (Cloud Sync) - Fire and await if possible
  if (supabase && navigator.onLine) {
    try {
        const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone_number: user.phoneNumber,
            assigned_doctor_id: user.assignedDoctorId,
            password: user.password,
            permissions: user.permissions,
            status: user.status
        });
        if (error) console.error("Supabase upsert user error:", error);
    } catch (e) {
        console.error("Supabase connection error:", e);
    }
  }

  return users;
};

export const deleteUser = async (id: string): Promise<User[]> => {
  // 1. Remove from Local Storage
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // 2. Remove from IndexedDB
  await deleteUserFromDB(id);

  // 3. Remove from Supabase
  if (supabase && navigator.onLine) {
    try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) console.error("Supabase delete user error:", error);
        else console.log("User deleted from Supabase");
    } catch (e) {
        console.error("Supabase connection error during delete:", e);
    }
  }

  return users;
};

export const updatePassword = async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) return { success: false, message: 'المستخدم غير موجود' };

  const user = users[userIndex];
  if (user.password !== oldPass) {
    return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
  }

  user.password = newPass;
  users[userIndex] = user;
  
  // Update storages
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  await saveUserToDB(user); 
  
  // Update active session user if same
  const currentUserJson = localStorage.getItem('mediscan_user');
  if (currentUserJson) {
      const currentUser = JSON.parse(currentUserJson);
      if (currentUser.id === userId) {
          currentUser.password = newPass;
          localStorage.setItem('mediscan_user', JSON.stringify(currentUser));
      }
  }

  // Sync to Cloud
  if (supabase && navigator.onLine) {
      try {
        await supabase.from('profiles').update({ password: newPass }).eq('id', userId);
      } catch (e) { console.error("Sync password error", e); }
  }

  return { success: true, message: 'تم تحديث كلمة المرور بنجاح' };
};

export const resetPassword = async (email: string, phone: string, newPass: string): Promise<{ success: boolean; message: string }> => {
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
  await saveUserToDB(user);

  // Sync to Cloud
  if (supabase && navigator.onLine) {
      try {
        await supabase.from('profiles').update({ password: newPass }).eq('id', user.id);
      } catch (e) { console.error("Sync reset password error", e); }
  }

  return { success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.' };
};

export const updateUserProfile = async (userId: string, name: string, email: string, phoneNumber?: string): Promise<{ success: boolean; message: string; user?: User }> => {
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
    await saveUserToDB(user);

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

    // Sync to Cloud
    if (supabase && navigator.onLine) {
        try {
            await supabase.from('profiles').update({ 
                name, 
                email, 
                phone_number: phoneNumber 
            }).eq('id', userId);
        } catch (e) { console.error("Sync profile error", e); }
    }

    return { success: true, message: 'تم تحديث البيانات بنجاح', user };
};