import React, { useState, useEffect } from 'react';
import { fileToGenerativePart, analyzeMedicalImage } from './services/geminiService';
import { saveRecord, loadHistory, deleteRecord, syncPendingRecords, syncAllData } from './services/storageService';
import { checkConnection } from './services/supabaseClient';
import { AnalysisResult, AppState, SavedRecord, User, AnalysisOptions } from './types';
import { getPatients } from './services/userService';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';
import HistoryModal from './components/HistoryModal';
import LoginPage from './components/LoginPage';
import UsersPage from './components/UsersPage';
import ProfilePage from './components/ProfilePage';
import SpecialtiesPage from './components/SpecialtiesPage';
import DatabasePage from './components/DatabasePage';
import HomePage from './components/HomePage';
import ChatWidget from './components/ChatWidget';
import { Activity, HeartPulse, WifiOff, RefreshCw, Database } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patientsList, setPatientsList] = useState<User[]>([]);

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database'>('home');

  // App State (Dashboard)
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentBase64, setCurrentBase64] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  // History State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<SavedRecord[]>([]);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Network State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Hardware Back Button Handler for Android
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (historyOpen) {
            setHistoryOpen(false);
        } else if (currentView !== 'home') {
            setCurrentView('home');
        } else if (!canGoBack) {
            CapacitorApp.exitApp();
        } else {
            window.history.back();
        }
    });

    // Network Listeners
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initial Database Connection & Sync
    const initializeApp = async () => {
       if (navigator.onLine) {
           console.log("App opened: Initiating Database Connection & Sync...");
           setIsSyncing(true);
           
           try {
             // 1. Verify Connection
             const isConnected = await checkConnection();
             setDbConnected(isConnected);
             if (isConnected) {
                 console.log("Database connected successfully.");
             } else {
                 console.warn("Database connection check returned false.");
             }

             // 2. Perform Full Sync (Two-Way)
             const syncResult = await syncAllData();
             console.log("Initial Sync Complete:", syncResult);
           } catch(e) {
             console.error("Initial sync failed:", e);
           } finally {
             setIsSyncing(false);
           }
           
           // Refresh data if user is logged in
           const storedUser = localStorage.getItem('mediscan_user');
           if (storedUser) {
               const user = JSON.parse(storedUser);
               loadAndFilterHistory(user);
           }
       }
    };

    initializeApp();

    // Check auth
    const storedUser = localStorage.getItem('mediscan_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      loadAndFilterHistory(user);
      
      // Load patients list if admin or doctor
      if (user.role === 'Admin' || user.role === 'Doctor' || user.role === 'Supervisor') {
        setPatientsList(getPatients());
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      CapacitorApp.removeAllListeners();
    };
  }, [historyOpen, currentView]); // Dependency array includes historyOpen/currentView for back button logic

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllData(); // Use the robust sync
      if (currentUser) {
        loadAndFilterHistory(currentUser); // Refresh to show synced status
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const loadAndFilterHistory = async (user: User) => {
    setIsLoadingHistory(true);
    try {
      const allRecords = await loadHistory();
      if (user.role === 'Patient') {
        setHistoryRecords(allRecords.filter(r => r.userId === user.id));
      } else {
        setHistoryRecords(allRecords);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLogin = (user: User) => {
    localStorage.setItem('mediscan_user', JSON.stringify(user));
    setCurrentUser(user);
    loadAndFilterHistory(user);
    handleSync(); // Sync on login
    
    if (user.role === 'Admin' || user.role === 'Doctor' || user.role === 'Supervisor') {
      setPatientsList(getPatients());
      setCurrentView('home');
    } else {
        setCurrentView('home'); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mediscan_user');
    setCurrentUser(null);
    handleReset();
    setHistoryRecords([]);
    setPatientsList([]);
    setCurrentView('home');
    setHistoryOpen(false);
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      localStorage.setItem('mediscan_user', JSON.stringify(updatedUser));
  };

  const handleFileSelect = async (file: File, category: string, scanDate: string | undefined, options: AnalysisOptions) => {
    if (!isOnline) {
      alert("عذراً، يجب أن تكون متصلاً بالإنترنت لتحليل صور جديدة. يمكنك تصفح السجل أثناء وضع عدم الاتصال.");
      return;
    }

    if (scanDate) {
      const date = new Date(scanDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 180) {
        if (!window.confirm("تنبيه: تاريخ الأشعة المدخل قديم (أكثر من 6 أشهر). قد لا تعكس الأشعة الحالة الصحية الحالية بدقة. هل أنت متأكد من رغبتك في المتابعة؟")) {
          return;
        }
      }
    }

    try {
      setAppState(AppState.ANALYZING);
      setError(null);
      setResult(null);
      setCurrentRecordId(null);
      setCurrentCategory(category);
      setCurrentView('dashboard');

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const base64Data = await fileToGenerativePart(file);
      setCurrentBase64(base64Data);
      
      const analysisResult = await analyzeMedicalImage(base64Data, file.type, options);
      
      setResult(analysisResult);
      setAppState(AppState.SUCCESS);
      
      if (currentUser?.role === 'Admin' || currentUser?.role === 'Doctor' || currentUser?.role === 'Supervisor') {
        setPatientsList(getPatients());
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ غير متوقع أثناء تحليل الصورة.");
      setAppState(AppState.ERROR);
    }
  };

  const handleSaveResult = async (targetPatientId?: string) => {
    if (result && currentBase64 && currentUser && !isSaving) {
      setIsSaving(true);
      
      const recordOwnerId = targetPatientId || currentUser.id;
      
      let patientName = currentUser.name;
      if (targetPatientId) {
        const targetPatient = patientsList.find(p => p.id === targetPatientId);
        if (targetPatient) patientName = targetPatient.name;
      }

      const newRecord: SavedRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        result: result,
        imageData: currentBase64,
        userId: recordOwnerId,
        patientName: patientName,
        category: currentCategory
      };
      
      const success = await saveRecord(newRecord);
      setIsSaving(false);
      
      if (success) {
        loadAndFilterHistory(currentUser); 
        setCurrentRecordId(newRecord.id); 
        return true;
      } else {
        alert("لم نتمكن من الحفظ. حدث خطأ في قاعدة البيانات.");
        return false;
      }
    }
    return false;
  };

  const handleSelectHistoryItem = (record: SavedRecord) => {
    setResult(record.result);
    setPreviewUrl(`data:image/png;base64,${record.imageData}`);
    setCurrentBase64(record.imageData);
    setCurrentRecordId(record.id);
    setAppState(AppState.SUCCESS);
    setHistoryOpen(false);
    
    if (currentUser?.role !== 'Patient') {
        setCurrentView('dashboard');
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteRecord(id);
    if (currentUser) loadAndFilterHistory(currentUser);
    
    if (currentRecordId === id) {
      setCurrentRecordId(null);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setPreviewUrl(null);
    setCurrentBase64(null);
    setResult(null);
    setError(null);
    setCurrentRecordId(null);
    setCurrentCategory('');
  };

  // Helper to check permission
  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Supervisor' && currentUser.permissions?.includes(permission as any)) return true;
    return false;
  };

  if (!currentUser) {
    return (
        <>
            {isSyncing && (
                <div className="bg-teal-600 text-white text-xs py-1 text-center flex items-center justify-center gap-2 fixed top-0 left-0 right-0 z-[100] pt-[env(safe-area-inset-top)]">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>جاري الاتصال بقاعدة البيانات...</span>
                </div>
            )}
            <LoginPage onLogin={handleLogin} />
        </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 md:pb-0">
      {/* Network Status Bar */}
      {!isOnline && (
        <div className="bg-slate-800 text-white text-xs py-1 text-center flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <WifiOff size={14} />
          <span>وضع عدم الاتصال.</span>
        </div>
      )}
      {isOnline && isSyncing && (
         <div className="bg-teal-600 text-white text-xs py-1 text-center flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <RefreshCw size={14} className="animate-spin" />
          <span>جاري المزامنة...</span>
        </div>
      )}

      <Header 
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenHistory={() => setHistoryOpen(true)} 
        onLogout={handleLogout}
        userRole={currentUser.role}
        userPermissions={currentUser.permissions}
        userName={currentUser.name}
        onInstall={deferredPrompt ? handleInstallClick : undefined}
      />

      <main className="flex-grow">
        
        {/* VIEW: Home */}
        {currentView === 'home' && (
          <HomePage 
            onStart={() => setCurrentView('dashboard')} 
            userRole={currentUser.role} 
          />
        )}

        {/* VIEW: Profile */}
        {currentView === 'profile' && (
            <div className="p-4 md:p-8">
              <ProfilePage currentUser={currentUser} onUpdateUser={handleUpdateCurrentUser} />
            </div>
        )}

        {/* VIEW: Specialties */}
        {currentView === 'specialties' && (
            <div className="p-4 md:p-8">
               <SpecialtiesPage currentUser={currentUser} />
            </div>
        )}

        {/* VIEW: Database Management (Admin Or Supervisor with Permission) */}
        {currentView === 'database' && hasPermission('manage_database') && (
           <div className="p-4 md:p-8">
              <DatabasePage />
           </div>
        )}

        {/* VIEW: Users (Admin Or Doctor Or Supervisor with Permission) */}
        {currentView === 'users' && (currentUser.role === 'Admin' || currentUser.role === 'Doctor' || hasPermission('manage_users')) && (
          <div className="p-4 md:p-8">
             <UsersPage currentUser={currentUser} />
          </div>
        )}

        {/* VIEW: Dashboard (Main) */}
        {currentView === 'dashboard' && (
            <div className="p-4 md:p-8">
                {/* Patient Welcome Screen */}
                {currentUser.role === 'Patient' && appState === AppState.IDLE && (
                <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in-up">
                    <div className="bg-teal-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HeartPulse className="text-teal-600" size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">أهلاً بك، {currentUser.name}</h2>
                    <p className="text-slate-600 mb-8">
                    يمكنك استعراض تاريخ فحوصاتك الطبية وتقارير الأشعة الخاصة بك.
                    </p>
                    <button 
                    onClick={() => setHistoryOpen(true)}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30"
                    >
                    عرض سجل الفحوصات
                    </button>
                </div>
                )}

                {/* Dashboard / Main View */}
                {(currentUser.role !== 'Patient' || appState === AppState.SUCCESS) && (
                    <div className="max-w-7xl mx-auto w-full">
                    
                    {currentUser.role !== 'Patient' && (
                        <div className="text-center mb-10 space-y-2 hidden md:block">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                            تحليل الصور الطبية بالذكاء الاصطناعي
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            قم برفع صور الأشعة للحصول على تشخيص فوري.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Column: Input Area */}
                        {currentUser.role !== 'Patient' && (
                        <div className={`lg:col-span-5 space-y-6 ${appState === AppState.SUCCESS ? 'lg:sticky lg:top-24' : 'mx-auto w-full max-w-2xl lg:col-span-12'}`}>
                        
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                            {previewUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-[4/3] flex items-center justify-center group">
                                <img 
                                src={previewUrl} 
                                alt="Uploaded X-ray" 
                                className="max-h-full max-w-full object-contain" 
                                />
                                {appState !== AppState.ANALYZING && (
                                <button 
                                    onClick={handleReset}
                                    className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-800 px-4 py-2 rounded-lg shadow-lg text-sm font-bold flex items-center gap-2 transition-all"
                                >
                                    <RefreshCw size={16} />
                                    تحليل صورة جديدة
                                </button>
                                )}
                            </div>
                            ) : (
                            <FileUpload onFileSelect={handleFileSelect} disabled={appState === AppState.ANALYZING || !isOnline} />
                            )}

                            {appState === AppState.ANALYZING && (
                            <div className="mt-6 text-center py-8">
                                <div className="relative inline-flex mb-4">
                                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity className="text-teal-500 animate-pulse" size={24} />
                                </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 animate-pulse">جاري تحليل الصورة...</h3>
                            </div>
                            )}

                            {appState === AppState.ERROR && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                                <p className="text-red-600 font-medium mb-2">عذراً، حدث خطأ</p>
                                <p className="text-sm text-red-500 mb-4">{error}</p>
                                <button 
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
                                >
                                    حاول مرة أخرى
                                </button>
                            </div>
                            )}
                        </div>
                        </div>
                        )}

                        {/* Right Column: Results */}
                        {appState === AppState.SUCCESS && result && (
                        <div className={`${currentUser.role === 'Patient' ? 'lg:col-span-12 max-w-4xl mx-auto' : 'lg:col-span-7'} w-full`}>
                            
                            {currentUser.role === 'Patient' && previewUrl && (
                                <div className="mb-6 bg-black rounded-xl overflow-hidden h-64 md:h-96 flex items-center justify-center border border-slate-200 shadow-sm">
                                    <img src={previewUrl} alt="Scan" className="max-h-full max-w-full object-contain" />
                                </div>
                            )}

                            <ResultsView 
                            result={result} 
                            onSave={(target) => {
                                handleSaveResult(target);
                                return true;
                            }} 
                            isSaved={!!currentRecordId}
                            userRole={currentUser.role}
                            patients={patientsList}
                            />
                        </div>
                        )}
                    </div>
                    </div>
                )}
            </div>
        )}
      </main>

      {/* Bottom Nav for Mobile */}
      <BottomNav 
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenHistory={() => setHistoryOpen(true)}
        userRole={currentUser.role}
        userPermissions={currentUser.permissions}
      />

      <HistoryModal 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        records={historyRecords}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistoryItem}
        currentUser={currentUser}
      />

      {currentUser && <ChatWidget currentUser={currentUser} />}

      <Footer />
    </div>
  );
};

export default App;