import React, { useState } from 'react';
import { AnalysisResult, User, UserRole } from '../types';
import { CheckCircle2, AlertCircle, FileText, ClipboardList, Activity, Save, Check, User as UserIcon, Loader2 } from 'lucide-react';

interface ResultsViewProps {
  result: AnalysisResult;
  onSave?: (targetPatientId?: string) => Promise<boolean> | boolean;
  isSaved?: boolean;
  userRole?: UserRole;
  patients?: User[];
}

const ResultsView: React.FC<ResultsViewProps> = ({ 
  result, 
  onSave, 
  isSaved: initialIsSaved = false,
  userRole,
  patients = []
}) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  const canAssignPatient = (userRole === 'Admin' || userRole === 'Doctor') && !isSaved;

  const handleSave = async () => {
    if (onSave && !isSaved && !isSaving) {
      // التحقق من اختيار المريض إذا كان المستخدم طبيباً أو مديراً
      if (canAssignPatient && !selectedPatientId) {
        alert("يرجى اختيار المريض أولاً لحفظ التقرير في سجله.");
        return;
      }
      
      setIsSaving(true);
      try {
        const success = await onSave(selectedPatientId || undefined);
        if (success) {
          setIsSaved(true);
        }
      } catch (error) {
        console.error("Save error:", error);
        alert("حدث خطأ أثناء محاولة حفظ التقرير.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">تقرير التحليل</h2>
            <p className="text-slate-500 text-sm">تم الإنشاء بواسطة Gemini 3 AI</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
            {/* Patient Selection Dropdown */}
            {canAssignPatient && (
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon size={16} />
                </div>
                <select
                  className="pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none min-w-[200px]"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="">-- اختر المريض --</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaved || isSaving}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                isSaved 
                ? 'bg-slate-100 text-slate-500 cursor-default' 
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md disabled:opacity-70'
              }`}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isSaved ? <Check size={18} /> : <Save size={18} />)}
              {isSaving ? 'جاري الحفظ...' : (isSaved ? 'تم الحفظ' : 'حفظ التقرير')}
            </button>
            <div className={`px-4 py-2 rounded-full border font-bold text-sm flex items-center gap-2 w-fit ${getSeverityColor(result.severity)}`}>
              <Activity size={18} />
              <span>{result.severity === 'Low' ? 'منخفض' : result.severity === 'Moderate' ? 'متوسط' : result.severity === 'High' ? 'مرتفع' : 'حرج'}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-slate-500 text-sm font-medium block">التشخيص المحتمل</span>
            <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="text-teal-500" size={24} />
              {result.diagnosis}
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-slate-500 text-sm font-medium block">نسبة الثقة</span>
             <div className="flex items-center gap-2">
                <div className="h-2 w-full max-w-[150px] bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-teal-500" 
                        style={{ width: result.confidence.includes('عالية') ? '90%' : result.confidence.includes('متوسطة') ? '60%' : '30%' }}
                    ></div>
                </div>
                <span className="text-sm font-bold text-slate-700">{result.confidence}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary & Findings */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4 text-teal-700">
                <FileText size={20} />
                <h3 className="font-bold text-lg">الملخص والملاحظات</h3>
              </div>
              <div className="prose prose-sm max-w-none text-slate-600 mb-6">
                <p>{result.summary}</p>
              </div>
              
              <h4 className="font-bold text-slate-800 text-sm mb-3">الملاحظات السريرية:</h4>
              <ul className="space-y-2">
                {result.findings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg text-sm">
                        <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-teal-400 shrink-0"></span>
                        {finding}
                    </li>
                ))}
              </ul>
           </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-fit">
            <div className="flex items-center gap-2 mb-4 text-teal-700">
                <ClipboardList size={20} />
                <h3 className="font-bold text-lg">التوصيات والخطوات التالية</h3>
            </div>
            <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg hover:bg-teal-50/30 transition-colors">
                        <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={18} />
                        <span className="text-slate-700 text-sm font-medium">{rec}</span>
                    </div>
                ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-xs leading-relaxed">
                يرجى ملاحظة أن هذه التوصيات مستمدة من تحليل الذكاء الاصطناعي ويجب مراجعتها من قبل مقدم الرعاية الصحية المختص قبل اتخاذ أي إجراء.
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;