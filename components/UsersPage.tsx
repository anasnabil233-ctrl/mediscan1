import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUser, deleteUser, getDoctors, getPatientsForDoctor } from '../services/userService';
import { Users, UserPlus, Search, Shield, CheckCircle2, XCircle, Trash2, Edit2, Save, X, HeartPulse, Stethoscope, Phone } from 'lucide-react';

interface UsersPageProps {
  currentUser: User;
}

const UsersPage: React.FC<UsersPageProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<User[]>([]);

  const isDoctor = currentUser.role === 'Doctor';

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'Doctor',
    status: 'Active',
    assignedDoctorId: ''
  });

  useEffect(() => {
    if (isDoctor) {
        // Doctors only see their own patients
        setUsers(getPatientsForDoctor(currentUser.id));
        setAvailableDoctors([currentUser]); // Can only assign to themselves
    } else {
        // Admins see everyone
        setUsers(getUsers());
        setAvailableDoctors(getDoctors());
    }
  }, [currentUser, isDoctor]);

  const filteredUsers = users.filter(user => 
    user.name.includes(searchTerm) || user.email.includes(searchTerm)
  );

  const handleOpenModal = (user?: User) => {
    // Refresh doctors list if Admin (Doctor list is static self)
    if (!isDoctor) setAvailableDoctors(getDoctors());

    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        role: isDoctor ? 'Patient' : 'Doctor', // Doctors can only add Patients
        status: 'Active',
        assignedDoctorId: isDoctor ? currentUser.id : '' // Doctors auto-assign themselves
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Strict role enforcement for Doctors
    const finalRole = isDoctor ? 'Patient' : (formData.role as UserRole);
    const finalDoctorId = isDoctor ? currentUser.id : formData.assignedDoctorId;

    const newUser: User = {
      id: editingUser ? editingUser.id : crypto.randomUUID(),
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      role: finalRole,
      status: formData.status as 'Active' | 'Inactive',
      lastLogin: editingUser?.lastLogin,
      // Only save assignedDoctorId if role is Patient
      assignedDoctorId: finalRole === 'Patient' ? finalDoctorId : undefined
    };

    const updatedList = saveUser(newUser);
    
    // Update local state based on role permissions
    if (isDoctor) {
        setUsers(getPatientsForDoctor(currentUser.id));
    } else {
        setUsers(updatedList);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      const updatedList = deleteUser(id);
      if (isDoctor) {
        setUsers(getPatientsForDoctor(currentUser.id));
      } else {
        setUsers(updatedList);
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1 w-fit"><Shield size={12} /> مدير النظام</span>;
      case 'Doctor': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 w-fit">طبيب</span>;
      case 'Patient': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700 flex items-center gap-1 w-fit"><HeartPulse size={12} /> مريض</span>;
    }
  };

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return '-';
    // If doctor, they are likely the doctor, but check list just in case
    if (doctorId === currentUser.id) return currentUser.name;
    
    const doc = users.find(u => u.id === doctorId) || availableDoctors.find(u => u.id === doctorId);
    return doc ? doc.name : 'غير محدد';
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-teal-600" />
            {isDoctor ? 'إدارة مرضاي' : 'إدارة المستخدمين'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isDoctor ? 'إضافة وإدارة سجلات المرضى التابعين لك' : 'إدارة حسابات الأطباء والمرضى'}
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm"
        >
          <UserPlus size={20} />
          {isDoctor ? 'إضافة مريض' : 'إضافة مستخدم'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="بحث بالاسم أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">الدور / الصلاحية</th>
                {!isDoctor && <th className="p-4">الطبيب المعالج</th>}
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
                    {getRoleBadge(user.role)}
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
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              لا توجد نتائج مطابقة للبحث
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in-up overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingUser ? (isDoctor ? 'تعديل بيانات المريض' : 'تعديل بيانات المستخدم') : (isDoctor ? 'إضافة مريض جديد' : 'إضافة مستخدم جديد')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
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

              {/* Assigned Doctor Selection - Only if role is Patient */}
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
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save size={16} />
                  حفظ البيانات
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