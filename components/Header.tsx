import React from 'react';
import { Activity, History, LogOut, Users, LayoutDashboard, HeartPulse, UserCog, Stethoscope, Home, Download } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentView: 'home' | 'dashboard' | 'users' | 'profile' | 'specialties';
  onNavigate: (view: 'home' | 'dashboard' | 'users' | 'profile' | 'specialties') => void;
  onOpenHistory?: () => void;
  onLogout?: () => void;
  userRole?: UserRole;
  userName?: string;
  onInstall?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenHistory, onLogout, userRole, userName, onInstall }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-teal-500 p-2 rounded-lg text-white">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">تحليل الأشعة الذكي</h1>
              <p className="text-xs text-slate-500">MediScan AI</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-2">
            
            {/* Install Button (Only visible if PWA install prompt is captured) */}
            {onInstall && (
              <button
                onClick={onInstall}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors animate-pulse"
                title="تثبيت التطبيق"
              >
                <Download size={20} />
                <span className="hidden lg:inline font-medium">تثبيت التطبيق</span>
              </button>
            )}

            {/* Show User Badge */}
            {userName && (
              <span className="text-xs text-slate-400 ml-2 hidden lg:inline-block">
                 مرحباً، {userName}
              </span>
            )}

            {/* Home Link */}
             <button 
                onClick={() => onNavigate('home')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'home' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                title="الرئيسية"
              >
                <Home size={20} />
                <span className="hidden lg:inline font-medium">الرئيسية</span>
              </button>

            {/* Dashboard Link - Hidden for Patient unless they want to upload specifically (Patients default flow is mostly history) */}
            {userRole !== 'Patient' && (
              <button 
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                title="لوحة التحكم"
              >
                <LayoutDashboard size={20} />
                <span className="hidden lg:inline font-medium">الفحص</span>
              </button>
            )}

            {/* Users/Patients Link - For Admin AND Doctor */}
            {(userRole === 'Admin' || userRole === 'Doctor') && (
              <button 
                onClick={() => onNavigate('users')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'users' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                title="المستخدمين"
              >
                <Users size={20} />
                <span className="hidden lg:inline font-medium">{userRole === 'Admin' ? 'المستخدمين' : 'مرضاي'}</span>
              </button>
            )}

             {/* Specialties Link - For Admin (Manage) & Others (View) */}
             <button 
                onClick={() => onNavigate('specialties')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'specialties' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                title="التخصصات"
              >
                <Stethoscope size={20} />
                <span className="hidden lg:inline font-medium">التخصصات</span>
              </button>

             {/* History/My Scans Link */}
             <button 
              onClick={onOpenHistory}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${userRole === 'Patient' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
              title={userRole === 'Patient' ? "فحوصاتي" : "سجل الفحوصات"}
            >
              {userRole === 'Patient' ? <HeartPulse size={20} /> : <History size={20} />}
              <span className="hidden lg:inline font-medium">{userRole === 'Patient' ? 'فحوصاتي' : 'السجل'}</span>
            </button>

            {/* Profile Link - For All */}
            <button 
              onClick={() => onNavigate('profile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
              title="الملف الشخصي"
            >
              <UserCog size={20} />
              <span className="hidden lg:inline font-medium">حسابي</span>
            </button>
            
            {onLogout && (
              <>
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut size={20} />
                  <span className="hidden lg:inline font-medium">خروج</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;