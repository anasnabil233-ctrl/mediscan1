import React, { useState, useEffect } from 'react';
import { User, UserRole, Specialty } from '../types';
import { getSpecialties, saveSpecialty, deleteSpecialty } from '../services/specialtyService';
import { Stethoscope, Plus, Search, Edit2, Trash2, X, Save, ShieldCheck, Activity } from 'lucide-react';

interface SpecialtiesPageProps {
  currentUser: User;
}

const SpecialtiesPage: React.FC<SpecialtiesPageProps> = ({ currentUser }) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Specialty | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Specialty>>({
    name: '',
    description: ''
  });

  const isAdmin = currentUser.role === 'Admin';

  useEffect(() => {
    setSpecialties(getSpecialties());
  }, []);

  const filteredList = specialties.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: Specialty) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newItem: Specialty = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      name: formData.name,
      description: formData.description || ''
    };

    const updatedList = saveSpecialty(newItem);
    setSpecialties(updatedList);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التخصص؟')) {
      const updatedList = deleteSpecialty(id);
      setSpecialties(updatedList);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-teal-600" />
            التخصصات الطبية
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            استعرض التخصصات الطبية المتاحة في المركز
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            إضافة تخصص جديد
          </button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
         <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="بحث عن تخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
             
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
                    <Activity size={24} />
                </div>
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
             </div>

             <h3 className="font-bold text-lg text-slate-800 mb-2">{item.name}</h3>
             <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
            <Stethoscope size={48} className="mx-auto mb-4 opacity-50" />
            <p>لا توجد تخصصات مطابقة للبحث</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in-up overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingItem ? 'تعديل التخصص' : 'إضافة تخصص جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم التخصص</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="مثال: طب القلب"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الوصف</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="وصف مختصر للتخصص..."
                />
              </div>

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

export default SpecialtiesPage;