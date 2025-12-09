import React from 'react';
import { SavedRecord, User } from '../types';
import { getUserById } from '../services/userService';
import { X, Calendar, ArrowLeft, Trash2, Activity, Stethoscope, Tag } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SavedRecord[];
  onSelect: (record: SavedRecord) => void;
  onDelete: (id: string) => void;
  currentUser: User | null;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, records, onSelect, onDelete, currentUser }) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Logic to determine assigned doctor display
  let doctorDisplay = { name: 'لم يتم تعيين طبيب', assigned: false };
  
  if (currentUser?.role === 'Patient') {
      if (currentUser.assignedDoctorId) {
          const doc = getUserById(currentUser.assignedDoctorId);
          if (doc) {
              doctorDisplay = { name: doc.name, assigned: true };
          }
      }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-teal-600" size={24} />
            سجل الفحوصات
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex-grow">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={32} />
              </div>
              <p>لا يوجد فحوصات محفوظة حتى الآن</p>
            </div>
          ) : (
            records.map((record) => (
              <div 
                key={record.id} 
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-300 transition-all shadow-sm hover:shadow-md group cursor-pointer relative"
                onClick={() => onSelect(record)}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                    <img 
                      src={`data:image/png;base64,${record.imageData}`} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        {/* Display Category & Diagnosis */}
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 text-lg">{record.result.diagnosis}</h4>
                          {record.category && (
                             <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                                <Tag size={10} />
                                {record.category}
                             </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                          <Calendar size={12} />
                          {formatDate(record.timestamp)}
                        </p>
                        
                        {/* Display Assigned Doctor for Patient */}
                        {currentUser?.role === 'Patient' && (
                           <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md w-fit ${doctorDisplay.assigned ? 'text-teal-700 bg-teal-50' : 'text-slate-500 bg-slate-100'}`}>
                              <Stethoscope size={12} />
                              <span>الطبيب المعالج: {doctorDisplay.name}</span>
                           </div>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${getSeverityColor(record.result.severity)}`}>
                        {record.result.severity === 'Low' ? 'منخفض' : 
                         record.result.severity === 'Moderate' ? 'متوسط' : 
                         record.result.severity === 'High' ? 'مرتفع' : 'حرج'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mt-2 line-clamp-1">
                      {record.result.summary}
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.')) {
                        onDelete(record.id);
                      }
                    }}
                    className="p-2 bg-white text-red-500 hover:bg-red-50 rounded-full border border-slate-200 shadow-sm transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                   <button 
                    className="p-2 bg-teal-500 text-white hover:bg-teal-600 rounded-full shadow-sm transition-colors"
                    title="عرض التفاصيل"
                  >
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;