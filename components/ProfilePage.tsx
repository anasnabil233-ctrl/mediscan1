import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { updatePassword, updateUserProfile } from '../services/userService';
import { User as UserIcon, Shield, Lock, Save, AlertCircle, CheckCircle2, Mail, Key, Phone } from 'lucide-react';

interface ProfilePageProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'password'>('details');
  
  // Profile Details State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Reset fields if user changes
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhoneNumber(currentUser.phoneNumber || '');
  }, [currentUser]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    const result = updateUserProfile(currentUser.id, name, email, phoneNumber);
    if (result.success && result.user) {
      setProfileMsg({ type: 'success', text: result.message });
      onUpdateUser(result.user);
    } else {
      setProfileMsg({ type: 'error', text: result.message });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword.length < 3) {
      setPassMsg({ type: 'error', text: 'كلمة المرور الجديدة قصيرة جداً' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة' });
      return;
    }

    const result = updatePassword(currentUser.id, oldPassword, newPassword);
    
    if (result.success) {
      setPassMsg({ type: 'success', text: result.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassMsg({ type: 'error', text: result.message });
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
        case 'Admin': return 'مدير النظام';
        case 'Doctor': return 'طبيب';
        case 'Patient': return 'مريض';
        default: return role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in-up pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UserIcon className="text-teal-600" size={28} />
          الملف الشخصي
        </h2>
        <p className="text-slate-500 text-sm mt-1">إدارة بيانات حسابك وكلمة المرور</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar / User Card */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="w-24 h-24 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
              {currentUser.name.charAt(0)}
            </div>
            <h3 className="font-bold text-xl text-slate-800">{currentUser.name}</h3>
            <p className="text-slate-500 text-sm mb-4">{currentUser.email}</p>
            
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              <Shield size={12} />
              {getRoleLabel(currentUser.role)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex flex-col">
              <button 
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-3 p-4 transition-colors text-right ${activeTab === 'details' ? 'bg-teal-50 text-teal-700 font-bold border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <UserIcon size={18} />
                البيانات الشخصية
              </button>
              <button 
                onClick={() => setActiveTab('password')}
                className={`flex items-center gap-3 p-4 transition-colors text-right ${activeTab === 'password' ? 'bg-teal-50 text-teal-700 font-bold border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Lock size={18} />
                تغيير كلمة المرور
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[400px]">
            
            {activeTab === 'details' ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                   <h3 className="text-lg font-bold text-slate-800">تعديل البيانات</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                    <div className="relative">
                        <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                        type="text" 
                        required
                        className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                    <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                        type="email" 
                        required
                        className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                    <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                        type="tel" 
                        className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        />
                    </div>
                    <p className="text-xs text-slate-500">يستخدم لاستعادة كلمة المرور</p>
                  </div>
                </div>

                {profileMsg && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {profileMsg.text}
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Save size={18} />
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6 animate-fade-in-up">
                 <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                   <h3 className="text-lg font-bold text-slate-800">تغيير كلمة المرور</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">كلمة المرور الحالية</label>
                    <div className="relative">
                        <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                        type="password" 
                        required
                        className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-4"></div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">كلمة المرور الجديدة</label>
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                        type="password" 
                        required
                        className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="على الأقل 3 أحرف"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">تأكيد كلمة المرور الجديدة</label>
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                        type="password" 
                        required
                        className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                  </div>
                </div>

                {passMsg && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${passMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {passMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {passMsg.text}
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Save size={18} />
                    تحديث كلمة المرور
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;