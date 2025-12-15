import React, { useState, useEffect } from 'react';
import { User, UserRole, AppPermission } from '../types';
import { getUsers, saveUser, deleteUser, getDoctors, getPatientsForDoctor } from '../services/userService';
import { Users, UserPlus, Search, Shield, CheckCircle2, XCircle, Trash2, Edit2, Save, X, HeartPulse, Stethoscope, Phone, Briefcase, Lock, Loader2 } from 'lucide-react';

interface UsersPageProps {
  currentUser: User;
}

const PERMISSIONS_LIST: { id: AppPermission; label: string }[] = [
    { id: 'view_dashboard', label: 'إجراء فحوصات وتحليل صور' },
    { id: 'manage_users', label: 'إدارة المستخدمين (إضافة/تعديل)' },
    { id: 'manage_database', label: 'الوصول لقاعدة البيانات والمزامنة' },
    { id: 'manage_specialties', label: 'إدارة التخصصات الطبية' },
    { id: 'view_reports', label: 'الاطلاع على تقارير المرضى' },
];

const UsersPage: React.FC<UsersPageProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const isDoctor = currentUser.role === 'Doctor';

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'Doctor',
    status: 'Active',
    assignedDoctorId: '',
    permissions: []
  });

  useEffect(() => {
    if (isDoctor) {
        setUsers(getPatientsForDoctor(currentUser.id));
        setAvailableDoctors([currentUser]); 
    } else {
        setUsers(getUsers());
        setAvailableDoctors(getDoctors());
    }
  }, [currentUser, isDoctor]);

  const filteredUsers = users.filter(user => 
    user.name.includes(searchTerm) || user.email.includes(searchTerm)
  );

  const handleOpenModal = (user?: User) => {
    if (!isDoctor) setAvailableDoctors(getDoctors());

    if (user) {
      setEditingUser(user);
      setFormData({
          ...user,
          permissions: user.permissions || [] 
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        role: isDoctor ? 'Patient' : 'Doctor', 
        status: 'Active',
        assignedDoctorId: isDoctor ? currentUser.id : '',
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsProcessing(true);
    try {
        const finalRole = isDoctor ? 'Patient' : (formData.role as UserRole);
        const finalDoctorId = isDoctor ? currentUser.id : formData.assignedDoctorId;
        const finalPermissions = finalRole === 'Supervisor' ? (formData.permissions || []) : undefined;

        const newUser: User = {
          id: editingUser ? editingUser.id : crypto.randomUUID(),
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: finalRole,
          status: formData.status as 'Active' | 'Inactive',
          lastLogin: editingUser?.lastLogin,
          assignedDoctorId: finalRole === 'Patient' ? finalDoctorId : undefined,
          permissions: finalPermissions
        };

        // Await the async save
        const updatedList = await saveUser(newUser);
        
        if (isDoctor) {
            setUsers(getPatientsForDoctor(currentUser.id));
        } else {
            setUsers(updatedList);
        }
        
        setIsModalOpen(false);
    } catch (error) {
        console.error("Error saving user:", error);
        alert("حدث خطأ أثناء حفظ المستخدم.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذفه من قاعدة البيانات أيضاً.')) {
      setIsProcessing(true);
      try {
          // Await the async delete
          const updatedList = await deleteUser(id);
          if (isDoctor) {
            setUsers(getPatientsForDoctor(currentUser.id));
          } else {
            setUsers(updatedList);
          }
      } catch (error) {
          console.error("Error deleting user:", error);
          alert("فشل حذف المستخدم.");
      } finally {
          setIsProcessing(false);
      }
    }
  };

  const togglePermission = (permId: AppPermission) => {
      const currentPerms = formData.permissions || [];
      if (currentPerms.includes(permId)) {
          setFormData({ ...formData, permissions: currentPerms.filter(p => p !== permId) });
      } else {
          setFormData({ ...formData, permissions: [...currentPerms, permId] });
      }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1 w-fit"><Shield size={12} /> مدير</span>;
      case 'Supervisor': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1 w-fit"><Briefcase size={12} /> مشرف</span>;
      case 'Doctor': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 w-fit">طبيب</span>;
      case 'Patient': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700 flex items-center gap-1 w-fit"><HeartPulse size={12} /> مريض</span>;
    }
  };

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return '-';
    if (doctorId === currentUser.id) return currentUser.name;
    const doc = users.find(u => u.id === doctorId) || availableDoctors.find(u => u.id === doctorId);
    return doc ? doc.name : 'غير محدد';
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-teal-600" />
            {isDoctor ? 'إدارة مرضاي' : 'إدارة المستخدمين'}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            {isDoctor ? 'سجلات المرضى' : 'إدارة الحسابات والصلاحيات'}
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors shadow-sm text-sm"
        >
          <UserPlus size={18} />
          {isDoctor ? 'إضافة مريض' : 'إضافة مستخدم'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        {isProcessing && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
                    <Loader2 className="animate-spin text-teal-600 mb-2" size={32} />
                    <span className="text-sm font-bold text-slate-600">جاري المعالجة...</span>
                </div>
            </div>
        )}

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-slate-100">
             {filteredUsers.map((user) => (
                 <div key={user.id} className="p-4 flex items-start gap-3">
                     <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
                        {user.name.charAt(0)}
                     </div>
                     <div className="flex-grow">
                         <div className="flex justify-between items-start">
                             <div>
                                 <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                                 <p className="text-xs text-slate-500">{user.email}</p>
                             </div>
                             {getRoleBadge(user.role)}
                         </div>
                         
                         <div className="mt-2 flex items-center justify-between">
                            <div className="flex gap-2 text-xs text-slate-500">
                                {user.status === 'Active' ? <span className="text-green-600">نشط</span> : <span className="text-slate-400">غير نشط</span>}
                                <span>•</span>
                                <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-EG') : 'لم يدخل'}</span>
                            </div>

                            <div className="flex gap-2">
                                {user.role === 'Admin' && currentUser.role !== 'Admin' ? null : (
                                    <>
                                        <button onClick={() => handleOpenModal(user)} className="p-1.5 bg-slate-100 text-slate-600 rounded">
                                            <Edit2 size={16} />
                                        </button>
                                        {user.id !== currentUser.id && (
                                            <button onClick={() => handleDelete(user.id)} className="p-1.5 bg-red-50 text-red-600 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                         </div>
                     </div>
                 </div>
             ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">الدور</th>
                {!isDoctor && <th className="p-4">الطبيب</th>}
                <th className="p-4">الحالة</th>
                <th className="p-4">آخر دخول</th>
                <th className="p-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                        {getRoleBadge(user.role)}
                        {user.role === 'Supervisor' && user.permissions && user.permissions.length > 0 && (
                            <span className="text-[10px] text-slate-400">
                                {user.permissions.length} صلاحيات
                            </span>
                        )}
                    </div>
                  </td>
                  {!isDoctor && (
                    <td className="p-4 text-sm text-slate-600">
                        {user.role === 'Patient' ? (
                        <span className="flex items-center gap-1">
                            <Stethoscope size={14} className="text-slate-400" />
                            {getDoctorName(user.assignedDoctorId)}
                        </span>
                        ) : '-'}
                    </td>
                  )}
                  <td className="p-4">
                    {user.status === 'Active' ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle2 size={12} /> نشط
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded-full w-fit">
                        <XCircle size={12} /> غير نشط
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                       {user.role === 'Admin' && currentUser.role !== 'Admin' ? null : (
                         <>
                            <button 
                                onClick={() => handleOpenModal(user)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                                <Edit2 size={18} />
                            </button>
                            {user.id !== currentUser.id && (
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              لا توجد نتائج مطابقة للبحث
            </div>
          )}
      </div>

      {/* Add/Edit Modal (Reused) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingUser ? 'تعديل البيانات' : (isDoctor ? 'إضافة مريض جديد' : 'إضافة مستخدم جديد')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="اختياري - لاستعادة كلمة المرور"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الصلاحية</label>
                  <select 
                    className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${isDoctor ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
                    value={isDoctor ? 'Patient' : formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    disabled={isDoctor}
                  >
                    {!isDoctor && <option value="Admin">مدير النظام (Admin)</option>}
                    {!isDoctor && <option value="Doctor">طبيب (Doctor)</option>}
                    {!isDoctor && <option value="Supervisor">مشرف (Supervisor)</option>}
                    <option value="Patient">مريض (Patient)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الحالة</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                  >
                    <option value="Active">نشط</option>
                    <option value="Inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              {/* Permissions Selection - Only for Supervisor */}
              {formData.role === 'Supervisor' && (
                  <div className="space-y-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <label className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-2">
                        <Lock size={16} />
                        صلاحيات المشرف
                    </label>
                    <div className="space-y-2">
                        {PERMISSIONS_LIST.map((perm) => (
                            <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    className="accent-indigo-600 w-4 h-4"
                                    checked={(formData.permissions || []).includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                />
                                <span className="text-sm text-slate-700">{perm.label}</span>
                            </label>
                        ))}
                    </div>
                  </div>
              )}

              {/* Assigned Doctor Selection */}
              {(formData.role === 'Patient' || isDoctor) && (
                 <div className="space-y-2 bg-teal-50 p-3 rounded-lg border border-teal-100">
                    <label className="text-sm font-bold text-teal-800 flex items-center gap-2">
                      <Stethoscope size={16} />
                      الطبيب المعالج
                    </label>
                    
                    {isDoctor ? (
                        <div className="flex items-center gap-2 text-teal-700 text-sm font-medium">
                            <span>{currentUser.name} (أنت)</span>
                        </div>
                    ) : (
                        <>
                        <select 
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        value={formData.assignedDoctorId || ''}
                        onChange={(e) => setFormData({...formData, assignedDoctorId: e.target.value})}
                        >
                        <option value="">-- اختر الطبيب --</option>
                        {availableDoctors.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                        ))}
                        </select>
                        <p className="text-xs text-slate-500">سيتمكن المريض من التواصل فقط مع الطبيب المختار.</p>
                        </>
                    )}
                 </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;