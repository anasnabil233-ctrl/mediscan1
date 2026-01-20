
import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import UsersPage from './components/UsersPage';
import ProfilePage from './components/ProfilePage';
import DatabasePage from './components/DatabasePage';
import SpecialtiesPage from './components/SpecialtiesPage';
import ChatWidget from './components/ChatWidget';
import HistoryModal from './components/HistoryModal';
import BottomNav from './components/BottomNav';
import { analyzeMedicalImage, fileToGenerativePart } from './services/geminiService';
import { AppState, AnalysisResult, SavedRecord, User, AnalysisOptions } from './types';
import { saveRecord, loadHistory, deleteRecord, syncAllData } from './services/storageService';
import { getPatients } from './services/userService';

/**
 * Main application component for MediScan AI.
 * Handles authentication, navigation, and the core diagnostic workflow.
 */
const App: React.FC = () => {
  // App state management
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mediscan_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database' | 'features'>('home');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [patients, setPatients] = useState<User[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [lastSelectedImage, setLastSelectedImage] = useState<{ base64: string; mimeType: string; category: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // Initialize data and sync when user logs in
  useEffect(() => {
    const init = async () => {
      if (currentUser) {
        const history = await loadHistory();
        setRecords(history);
        setPatients(getPatients());
        await syncAllData();
      }
    };
    init();
  }, [currentUser]);

  // PWA installation logic
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('mediscan_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mediscan_user');
    setCurrentView('home');
    setShowLogin(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  /**
   * Triggers medical image analysis using Gemini API.
   */
  const handleFileSelect = async (file: File, category: string, scanDate: string | undefined, options: AnalysisOptions) => {
    setAppState(AppState.ANALYZING);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64 = await fileToGenerativePart(file);
      const result = await analyzeMedicalImage(base64, file.type, options);
      setAnalysisResult(result);
      setAppState(AppState.SUCCESS);
      setLastSelectedImage({ base64, mimeType: file.type, category });
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setError(err.message || "حدث خطأ غير متوقع أثناء تحليل الصورة.");
    }
  };

  /**
   * Saves analysis result to local and remote database.
   */
  const handleSaveResult = async (targetPatientId?: string) => {
    if (!analysisResult || !lastSelectedImage) return false;

    const newRecord: SavedRecord = {
      id: crypto.randomUUID(),
      userId: targetPatientId || currentUser?.id,
      patientName: targetPatientId ? patients.find(p => p.id === targetPatientId)?.name : currentUser?.name,
      timestamp: Date.now(),
      result: analysisResult,
      imageData: lastSelectedImage.base64,
      category: lastSelectedImage.category,
      synced: false
    };

    const success = await saveRecord(newRecord);
    if (success) {
      const history = await loadHistory();
      setRecords(history);
    }
    return success;
  };

  const handleDeleteRecord = async (id: string) => {
    const updated = await deleteRecord(id);
    setRecords(updated);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setError(null);
    setAnalysisResult(null);
  };

  // Render landing or login pages for unauthenticated users
  if (!currentUser) {
    if (showLogin) {
      return <LoginPage onLogin={handleLogin} />;
    }
    if (currentView === 'features') {
       return <FeaturesPage onStart={() => setShowLogin(true)} isLoggedIn={false} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} onExploreFeatures={() => setCurrentView('features')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLogout={handleLogout}
        userRole={currentUser.role}
        userPermissions={currentUser.permissions}
        userName={currentUser.name}
        onInstall={deferredPrompt ? handleInstall : undefined}
      />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {currentView === 'home' && (
            <HomePage onStart={() => setCurrentView('dashboard')} userRole={currentUser.role} />
          )}

          {currentView === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-slate-900 mb-2">تحليل الصور الطبية</h2>
                <p className="text-slate-500">ارفع صورة الأشعة الخاصة بك للحصول على تحليل فوري مدعوم بالذكاء الاصطناعي</p>
              </div>

              {/* FIXED: Removed Redundant comparison causing TS2367 Error */}
              {appState === AppState.IDLE && (
                <FileUpload onFileSelect={handleFileSelect} disabled={false} />
              )}

              {appState === AppState.ANALYZING && (
                <div className="flex flex-col items-center justify-center p-12 space-y-6 animate-pulse">
                   <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-xl font-bold text-slate-700">جاري تحليل الصورة بواسطة Gemini AI...</p>
                </div>
              )}

              {/* Error Handling UI */}
              {appState === AppState.ERROR && error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl mb-8 flex flex-col items-center gap-4 text-center animate-fade-in-up">
                      <div className="bg-red-100 p-3 rounded-full">
                         <AlertCircle size={32} className="text-red-500" />
                      </div>
                      <div>
                          <h3 className="font-bold text-lg mb-1">تنبيه من النظام</h3>
                          <p className="text-sm opacity-90 leading-relaxed max-w-sm mx-auto">{error}</p>
                      </div>
                      <div className="flex gap-4 mt-2">
                          <button 
                              onClick={handleReset} 
                              className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                          >
                              <RefreshCcw size={18} />
                              محاولة مرة أخرى
                          </button>
                      </div>
                  </div>
              )}

              {appState === AppState.SUCCESS && analysisResult && (
                <div className="space-y-6">
                  <ResultsView 
                    result={analysisResult} 
                    onSave={handleSaveResult} 
                    userRole={currentUser.role}
                    patients={patients}
                  />
                  <div className="flex justify-center">
                    <button 
                      onClick={handleReset}
                      className="text-teal-600 font-bold hover:underline flex items-center gap-2"
                    >
                      <RefreshCcw size={18} />
                      إجراء فحص آخر
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'users' && <UsersPage currentUser={currentUser} />}
          {currentView === 'profile' && <ProfilePage currentUser={currentUser} onUpdateUser={setCurrentUser} />}
          {currentView === 'database' && <DatabasePage />}
          {currentView === 'specialties' && <SpecialtiesPage currentUser={currentUser} />}
          {currentView === 'features' && <FeaturesPage onStart={() => setCurrentView('dashboard')} isLoggedIn={true} />}
        </div>
      </main>

      <Footer />
      <BottomNav 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onOpenHistory={() => setIsHistoryOpen(true)}
        userRole={currentUser.role}
        userPermissions={currentUser.permissions}
      />
      <ChatWidget currentUser={currentUser} />
      
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        records={records} 
        onSelect={(record) => {
          setAnalysisResult(record.result);
          setAppState(AppState.SUCCESS);
          setLastSelectedImage({ base64: record.imageData, mimeType: 'image/png', category: record.category || '' });
          setCurrentView('dashboard');
          setIsHistoryOpen(false);
        }}
        onDelete={handleDeleteRecord}
        currentUser={currentUser}
      />
    </div>
  );
};

export default App;
