import React, { useState, useEffect, useRef } from 'react';
import { Database, Server, HardDrive, Users, RefreshCw, Cloud, Wifi, WifiOff, AlertTriangle, CheckCircle2, Download, Upload, FileJson } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getAllRecordsFromDB, addRecordToDB } from '../services/db';
import { getUsers } from '../services/userService';
import { syncPendingRecords } from '../services/storageService';
import { SavedRecord } from '../types';

const DatabasePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    localRecords: 0,
    remoteRecords: 0,
    pendingSync: 0,
    usersCount: 0,
    lastSyncTime: ''
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Backup/Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Check connection status
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    fetchStats();

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setConnectionStatus('checking');
    try {
      // 1. Get Local DB Stats
      const localRecords = await getAllRecordsFromDB();
      const users = getUsers();
      
      // 2. Get Remote DB Stats (if connected)
      let remoteCount = 0;
      let isConnected = false;

      if (supabase && navigator.onLine) {
        const { count, error } = await supabase
          .from('records')
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          remoteCount = count || 0;
          isConnected = true;
        } else {
            console.error("Supabase connection error:", error);
        }
      }

      setStats({
        localRecords: localRecords.length,
        remoteRecords: remoteCount,
        pendingSync: localRecords.filter(r => !r.synced).length,
        usersCount: users.length,
        lastSyncTime: new Date().toLocaleTimeString('ar-EG')
      });
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');

    } catch (e) {
      console.error("Error fetching database stats:", e);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    if (!isOnline) {
      alert('يجب أن تكون متصلاً بالإنترنت للمزامنة');
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncPendingRecords();
      await fetchStats(); // Refresh stats after sync
    } catch (e) {
      console.error("Manual sync failed:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Backup & Restore Logic ---

  const handleExportBackup = async () => {
    try {
      const records = await getAllRecordsFromDB();
      if (records.length === 0) {
        alert("لا توجد بيانات لتصديرها.");
        return;
      }

      const dataStr = JSON.stringify(records, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mediscan_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      alert("حدث خطأ أثناء تصدير النسخة الاحتياطية.");
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith('.json')) {
      alert("يرجى اختيار ملف JSON صالح.");
      return;
    }

    if (!window.confirm("هل أنت متأكد؟ سيتم دمج البيانات المستوردة مع البيانات الحالية.")) {
        // Reset input so change event can fire again for same file
        event.target.value = '';
        return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        if (!Array.isArray(parsedData)) {
          throw new Error("تنسيق الملف غير صحيح. يجب أن يكون قائمة من السجلات.");
        }

        let importedCount = 0;
        for (const item of parsedData) {
          // Basic validation to check if it looks like a SavedRecord
          if (item.id && item.result && item.timestamp) {
             // Force synced=false so it tries to sync to cloud if re-imported
             // OR keep original state. Let's keep original state but ensure type safety.
             const record = item as SavedRecord;
             await addRecordToDB(record);
             importedCount++;
          }
        }

        alert(`تم استرداد ${importedCount} سجل بنجاح.`);
        await fetchStats();

      } catch (err) {
        console.error("Import error:", err);
        alert("فشل استيراد الملف. تأكد من أن الملف صالح ولم يتعرض للتلف.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-teal-600" />
            إدارة قاعدة البيانات
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            مراقبة حالة البيانات، المزامنة، والنسخ الاحتياطي.
          </p>
        </div>
        <div className="flex items-center gap-3">
             <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                {isOnline ? 'متصل بالإنترنت' : 'غير متصل'}
             </div>
             <button 
              onClick={fetchStats}
              className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Local DB Stat */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <HardDrive size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">محلي (IndexedDB)</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{stats.localRecords}</div>
          <p className="text-sm text-slate-500">إجمالي السجلات المحفوظة محلياً</p>
        </div>

        {/* Remote DB Stat */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
              <Cloud size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">سحابي (Supabase)</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">
             {connectionStatus === 'connected' ? stats.remoteRecords : '---'}
          </div>
          <p className="text-sm text-slate-500">إجمالي السجلات في السحابة</p>
        </div>

        {/* Sync Status Stat */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stats.pendingSync > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
              <RefreshCw size={24} className={stats.pendingSync > 0 ? "animate-spin-slow" : ""} />
            </div>
            {stats.pendingSync > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">مطلوب المزامنة</span>}
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{stats.pendingSync}</div>
          <p className="text-sm text-slate-500">سجلات بانتظار الرفع</p>
        </div>

        {/* Users Stat */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 text-teal-600 p-3 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{stats.usersCount}</div>
          <p className="text-sm text-slate-500">إجمالي المستخدمين المسجلين</p>
        </div>
      </div>

      {/* Actions Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
         {/* Sync Control */}
         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <Server size={18} className="text-slate-600" />
               <h3 className="font-bold text-slate-800">حالة المزامنة السحابية</h3>
            </div>
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${stats.pendingSync === 0 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {stats.pendingSync === 0 ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
                   </div>
                   <div>
                      <h4 className="font-bold text-lg text-slate-800">
                         {stats.pendingSync === 0 ? 'جميع البيانات متزامنة' : 'يوجد بيانات غير متزامنة'}
                      </h4>
                      <p className="text-slate-500 text-sm">
                         آخر تحديث: {stats.lastSyncTime}
                      </p>
                   </div>
                </div>

                <button
                  onClick={handleForceSync}
                  disabled={isSyncing || !isOnline || stats.pendingSync === 0}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} />
                   {isSyncing ? 'جاري المزامنة...' : 'مزامنة السجلات الآن'}
                </button>
            </div>
         </div>

         {/* Backup & Restore */}
         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <FileJson size={18} className="text-slate-600" />
               <h3 className="font-bold text-slate-800">النسخ الاحتياطي والاستعادة</h3>
            </div>
            <div className="p-6">
               <p className="text-sm text-slate-500 mb-6">
                  يمكنك تحميل نسخة كاملة من قاعدة البيانات المحلية (ملف JSON) واستعادتها في أي وقت أو نقلها لجهاز آخر.
               </p>
               
               <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleExportBackup}
                    className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    تحميل نسخة (Backup)
                  </button>

                  <button 
                    onClick={handleImportClick}
                    disabled={isImporting}
                    className="flex-1 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    {isImporting ? 'جاري الاستيراد...' : 'استرداد (Restore)'}
                  </button>
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json,application/json" 
                    onChange={handleFileChange}
                  />
               </div>
            </div>
         </div>
      </div>

       {/* System Info */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <Database size={18} className="text-slate-600" />
               <h3 className="font-bold text-slate-800">تفاصيل النظام</h3>
            </div>
            <div className="p-6 space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 text-sm">إصدار التطبيق</span>
                      <span className="font-mono text-slate-800 dir-ltr">v1.0.0</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 text-sm">المتصفح</span>
                      <span className="font-mono text-slate-800 text-xs truncate max-w-[200px]" title={navigator.userAgent}>
                         {navigator.userAgent}
                      </span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 text-sm">اتصال Supabase</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${connectionStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {connectionStatus === 'checking' ? 'جاري التحقق...' : 
                           connectionStatus === 'connected' ? 'متصل' : 'غير متصل / غير مهيأ'}
                      </span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 text-sm">التخزين المؤقت</span>
                      <span className="font-mono text-slate-800">IndexedDB Active</span>
                   </div>
               </div>
            </div>
         </div>
    </div>
  );
};

export default DatabasePage;