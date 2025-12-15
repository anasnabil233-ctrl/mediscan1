import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Calendar, Tag, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisOptions } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File, category: string, scanDate: string | undefined, options: AnalysisOptions) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [scanDate, setScanDate] = useState<string>('');
  const [category, setCategory] = useState<string>('أشعة سينية (X-Ray)');
  
  // Advanced Options State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState<number>(0.5);
  const [maxTokens, setMaxTokens] = useState<string>('8192'); 

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, [scanDate, category, temperature, maxTokens]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  }, [scanDate, category, temperature, maxTokens]);

  const handleFile = (file: File) => {
    // Basic validation for image types
    if (!file.type.startsWith('image/')) {
      alert("يرجى تحميل ملف صورة صالح");
      return;
    }
    setSelectedFileName(file.name);
    
    const options: AnalysisOptions = {
      temperature: temperature,
      maxOutputTokens: maxTokens ? parseInt(maxTokens) : undefined
    };

    onFileSelect(file, category, scanDate || undefined, options);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in-up">
      
      {/* Options Area */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Category Selection */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Tag size={18} className="text-teal-600" />
            نوع الصورة
          </label>
          <div className="relative">
             <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700 appearance-none"
             >
                <option value="أشعة سينية (X-Ray)">أشعة سينية (X-Ray)</option>
                <option value="أشعة الصدر (Chest X-Ray)">أشعة الصدر (Chest X-Ray)</option>
                <option value="أشعة مقطعية (CT Scan)">أشعة مقطعية (CT Scan)</option>
                <option value="رنين مغناطيسي (MRI)">رنين مغناطيسي (MRI)</option>
                <option value="موجات فوق صوتية (Ultrasound)">موجات فوق صوتية (Ultrasound)</option>
                <option value="أخرى">أخرى</option>
             </select>
             <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Calendar size={18} className="text-teal-600" />
            تاريخ الفحص
          </label>
          <input 
            type="date"
            value={scanDate}
            onChange={(e) => setScanDate(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
          />
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className="mb-6">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-slate-500 hover:text-teal-600 text-sm font-semibold transition-colors mx-auto p-2"
        >
          <Settings size={16} />
          خيارات متقدمة (Advanced Options)
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">Temperature</label>
                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{temperature}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                disabled={disabled}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Max Output Tokens</label>
              <input 
                type="number"
                min="1"
                max="32000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                disabled={disabled}
                placeholder="Ex: 4096"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 mb-6 text-center px-4">
         ينصح باستخدام صور حديثة (أقل من 6 أشهر) لضمان دقة التشخيص.
      </div>

      <div 
        className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out text-center cursor-pointer min-h-[200px] flex items-center justify-center
          ${dragActive ? 'border-teal-500 bg-teal-50 scale-[1.02]' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleChange}
          disabled={disabled}
          accept="image/*"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-5 rounded-full transition-colors shadow-sm ${dragActive || selectedFileName ? 'bg-teal-100 text-teal-600' : 'bg-white border border-slate-100 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500'}`}>
            {selectedFileName ? <ImageIcon size={40} /> : <UploadCloud size={40} />}
          </div>
          
          <div className="space-y-1">
            {selectedFileName ? (
               <div className="flex items-center gap-2 text-teal-700 font-medium">
                 <span className="break-all px-4">{selectedFileName}</span>
               </div>
            ) : (
              <>
                <p className="text-lg font-bold text-slate-700">
                  اضغط لالتقاط أو اختيار صورة
                </p>
                <p className="text-sm text-slate-500">
                  يدعم الكاميرا والاستوديو (JPG, PNG)
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;