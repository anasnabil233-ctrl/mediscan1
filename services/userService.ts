import { User } from '../types';

const USERS_KEY = 'mediscan_users';

// Added default passwords '123' and phone numbers
const MOCK_USERS: User[] = [
  { id: '1', name: 'د. أحمد محمد', email: 'admin@mediscan.ai', phoneNumber: '01000000000', password: '123', role: 'Admin', status: 'Active', lastLogin: Date.now() - 3600000 },
  { id: '2', name: 'د. سارة علي', email: 'sara@mediscan.ai', phoneNumber: '01100000000', password: '123', role: 'Doctor', status: 'Active', lastLogin: Date.now() - 86400000 },
  { id: '3', name: 'أ. سامي السيد', email: 'patient@mediscan.ai', phoneNumber: '01200000000', password: '123', role: 'Patient', status: 'Active', lastLogin: Date.now() - 400000, assignedDoctorId: '2' },
];

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
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

export const saveUser = (user: User): User[] => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  // If updating existing user, preserve password if not provided in update
  if (index >= 0) {
    if (!user.password) {
      user.password = users[index].password;
    }
    users[index] = user;
  } else {
    // New user default password if not set
    if (!user.password) user.password = '123456';
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
};

export const deleteUser = (id: string): User[] => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
};

export const loginUser = (email: string, password?: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'Active');
  
  if (user) {
    // Check password
    if (password && user.password && user.password !== password) {
      return null;
    }

    // Update last login
    user.lastLogin = Date.now();
    saveUser(user);
    return user;
  }
  return null;
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
  
  // Update current session user in local storage if needed
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
  
  // Check if phone matches
  if (!user.phoneNumber || user.phoneNumber !== phone) {
    return { success: false, message: 'رقم الهاتف غير مطابق للسجلات' };
  }

  user.password = newPass;
  users[userIndex] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return { success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.' };
};

export const updateUserProfile = (userId: string, name: string, email: string, phoneNumber?: string): { success: boolean; message: string; user?: User } => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
  
    if (userIndex === -1) return { success: false, message: 'المستخدم غير موجود' };
  
    // Check if email is taken by another user
    const emailExists = users.some(u => u.email === email && u.id !== userId);
    if (emailExists) return { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' };

    const user = users[userIndex];
    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;
    
    users[userIndex] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update current session
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