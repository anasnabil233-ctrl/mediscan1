
import React, { useState, useEffect } from 'react';
import { fileToGenerativePart, analyzeMedicalImage } from './services/geminiService';
import { saveRecord, loadHistory, deleteRecord, syncPendingRecords, syncAllData } from './services/storageService';
import { checkConnection } from './services/supabaseClient';
import { AnalysisResult, AppState, SavedRecord, User, AnalysisOptions } from './types';
import { getPatients, refreshLocalUsersFromDB } from './services/userService';
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
import FeaturesPage from './components/FeaturesPage';
import LandingPage from './components/LandingPage';
import ChatWidget from './components/ChatWidget';
import { Activity, HeartPulse, WifiOff, RefreshCw, Database, Cloud, AlertCircle, RefreshCcw } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';

const App: React.FC = () => {
  // Auth & View State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false); 
  const [patientsList, setPatientsList] = useState<User[]>([]);

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database' | 'features'>('home');

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
  const [isInitializing, setIsInitializing] = useState(true); 
  const [dbConnected, setDbConnected] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
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

    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const initializeApp = async () => {
       setIsInitializing(true);
       
       if (navigator.onLine) {
           setIsSyncing(true);
           try {
             const isConnected = await checkConnection();
             setDbConnected(isConnected);
             await syncAllData();
             const freshUsers = await refreshLocalUsersFromDB();
             const storedUserJson = localStorage.getItem('mediscan_user');
             if (storedUserJson) {
                 const storedUser = JSON.parse(storedUserJson);
                 const freshUser = freshUsers.find(u => u.id === storedUser.id);
                 if (freshUser) {
                     localStorage.setItem('mediscan_user', JSON.stringify(freshUser));
                 } else {
                     localStorage.removeItem('mediscan_user');
                 }
             }
           } catch(e) {
             console.error("Initial sync failed:", e);
           } finally {
             setIsSyncing(false);
           }
       }

       const storedUser = localStorage.getItem('mediscan_user');
       if (storedUser) {
          const userObj = JSON.parse(storedUser);
          setCurrentUser(userObj);
          await loadAndFilterHistory(userObj);
          if (userObj.role === 'Admin' || userObj.role === 'Doctor' || userObj.role === 'Supervisor') {
            setPatientsList(getPatients());
          }
       }

       setIsInitializing(false);
    };

    initializeApp();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      CapacitorApp.removeAllListeners();
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllData(); 
      await refreshLocalUsersFromDB(); 
      const storedUserJson = localStorage.getItem('mediscan_user');
      if (storedUserJson) {
          const storedUser = JSON.parse(storedUserJson);
          const allUsers = await refreshLocalUsersFromDB(); 
          const freshUser = allUsers.find(u => u.id === storedUser.id);
          if (freshUser) {
              setCurrentUser(freshUser);
              localStorage.setItem('mediscan_user', JSON.stringify(freshUser));
          }
      }
      if (currentUser) {
        await loadAndFilterHistory(currentUser); 
        if (currentUser.role === 'Admin' || currentUser.role === 'Doctor') {
             setPatientsList(getPatients());
        }
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
    handleSync(); 
    setCurrentView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('mediscan_user');
    setCurrentUser(null);
    setShowLogin(false); 
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
      alert("عذراً، يجب أن تكون متصلاً بالإنترنت لتحليل صور جديدة.");
      return;
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
    } catch (err: any) {
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
    setCurrentView('dashboard');
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteRecord(id);
    if (currentUser) loadAndFilterHistory(currentUser);
    if (currentRecordId === id) setCurrentRecordId(null);
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

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Supervisor' && currentUser.permissions?.includes(permission as any)) return true;
    return false;
  };

  if (isInitializing) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4" dir="rtl">
           <div className="relative">
              <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Cloud className="text-teal-600 animate-pulse" size={24} />
              </div>
           </div>
           <h2 className="text-lg font-bold text-slate-800">جاري تحميل البيانات...</h2>
        </div>
     );
  }

  if (!currentUser) {
    if (showLogin) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return (
      <LandingPage 
        onLoginClick={() => setShowLogin(true)} 
        onExploreFeatures={() => {
          setShowLogin(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 md:pb-0">
      {!isOnline && (
        <div className="bg-slate-800 text-white text-xs py-1 text-center flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <WifiOff size={14} />
          <span>وضع عدم الاتصال.</span>
        </div>
      )}
      {isOnline && isSyncing && (
         <div className="bg-teal-600 text-white text-xs py-1 text-center flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <RefreshCw size={14} className="animate-spin" />
          <span>جاري المزامنة مع السحابة...</span>
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
        {currentView === 'home' && (
          <HomePage 
            onStart={() => setCurrentView('features')} 
            userRole={currentUser.role} 
          />
        )}
        
        {currentView === 'features' && (
          <FeaturesPage 
            onStart={() => setCurrentView('dashboard')} 
            isLoggedIn={!!currentUser} 
          />
        )}

        {currentView === 'profile' && (
            <div className="p-4 md:p-8">
              <ProfilePage currentUser={currentUser} onUpdateUser={handleUpdateCurrentUser} />
            </div>
        )}

        {currentView === 'specialties' && (
            <div className="p-4 md:p-8">
               <SpecialtiesPage currentUser={currentUser} />
            </div>
        )}

        {currentView === 'database' && hasPermission('manage_database') && (
           <div className="p-4 md:p-8">
              <DatabasePage />
           </div>
        )}

        {currentView === 'users' && (currentUser.role === 'Admin' || currentUser.role === 'Doctor' || hasPermission('manage_users')) && (
          <div className="p-4 md:p-8">
             <UsersPage currentUser={currentUser} />
          </div>
        )}

        {currentView === 'dashboard' && (
            <div className="p-4 md:p-8">
                {(currentUser.role !== 'Patient' || appState === AppState.SUCCESS || appState === AppState.ERROR) && (
                    <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {currentUser.role !== 'Patient' && (
                        <div className={`lg:col-span-5 space-y-6 ${appState === AppState.SUCCESS ? 'lg:sticky lg:top-24' : 'mx-auto w-full max-w-2xl lg:col-span-12'}`}>
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                            {previewUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-[4/3] flex items-center justify-center group">
                                <img src={previewUrl} alt="Scan" className="max-h-full max-w-full object-contain" />
                                {appState !== AppState.ANALYZING && (
                                <button onClick={handleReset} className="absolute bottom-4 right-4 bg-white/90 text-slate-800 px-4 py-2 rounded-lg shadow-lg text-sm font-bold flex items-center gap-2">
                                    <RefreshCw size={16} /> تحليل صورة جديدة
                                </button>
                                )}
                            </div>
                            ) : (
                            <FileUpload onFileSelect={handleFileSelect} disabled={appState === AppState.ANALYZING || !isOnline} />
                            )}
                            {appState === AppState.ANALYZING && (
                            <div className="mt-6 text-center py-8">
                                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
                                <h3 className="text-lg font-bold text-slate-800">جاري تحليل الصورة...</h3>
                            </div>
                            )}
                        </div>
                        </div>
                        )}
                        
                        <div className={`${currentUser.role === 'Patient' ? 'lg:col-span-12 max-w-4xl mx-auto' : 'lg:col-span-7'} w-full`}>
                            {appState === AppState.ERROR && error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl mb-8 flex flex-col items-center gap-4 text-center animate-fade-in-up">
                                    <AlertCircle size={48} className="text-red-500" />
                                    <div>
                                        <h3 className="font-bold text-xl mb-2">فشل تحليل الصورة</h3>
                                        <p className="text-sm opacity-90 leading-relaxed max-w-md mx-auto">{error}</p>
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <button 
                                            onClick={handleReset} 
                                            className="bg-white border border-red-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <RefreshCcw size={18} />
                                            إعادة المحاولة
                                        </button>
                                    </div>
                                    <div className="mt-4 p-4 bg-white/50 rounded-xl border border-red-100 text-[10px] text-red-400">
                                        تلميح: تأكد من ضبط VITE_API_KEY في إعدادات Vercel وإعادة عمل Deploy.
                                    </div>
                                </div>
                            )}

                            {appState === AppState.SUCCESS && result && (
                                <ResultsView 
                                result={result} 
                                onSave={(target) => handleSaveResult(target)} 
                                isSaved={!!currentRecordId}
                                userRole={currentUser.role}
                                patients={patientsList}
                                />
                            )}
                        </div>
                    </div>
                    </div>
                )}
            </div>
        )}
      </main>

      <BottomNav 
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenHistory={() => setHistoryOpen(true)}
        userRole={currentUser.role}
        userPermissions={currentUser.permissions}
      />
      <HistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} records={historyRecords} onSelect={handleSelectHistoryItem} onDelete={handleDeleteHistoryItem} currentUser={currentUser} />
      {currentUser && <ChatWidget currentUser={currentUser} />}
      <Footer />
    </div>
  );
};

export default App;
