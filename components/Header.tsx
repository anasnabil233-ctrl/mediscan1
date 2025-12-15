import React from 'react';
import { History, LogOut, Users, LayoutDashboard, HeartPulse, UserCog, Stethoscope, Home, Download, Database } from 'lucide-react';
import { UserRole, AppPermission } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentView: 'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database';
  onNavigate: (view: 'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database') => void;
  onOpenHistory?: () => void;
  onLogout?: () => void;
  userRole?: UserRole;
  userPermissions?: AppPermission[];
  userName?: string;
  onInstall?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenHistory, onLogout, userRole, userPermissions = [], userName, onInstall }) => {
  
  // Helper to check permission
  const hasPermission = (permission: AppPermission) => {
    if (userRole === 'Admin') return true;
    if (userRole === 'Supervisor' && userPermissions.includes(permission)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <Logo size={36} className="shadow-sm rounded-xl" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800">MediScan AI</h1>
              <p className="text-[10px] md:text-xs text-slate-500">تحليل الأشعة الذكي</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-2">
            
            {/* Install Button (Mobile optimized) */}
            {onInstall && (
              <button
                onClick={onInstall}
                className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors animate-pulse"
                title="تثبيت التطبيق"
              >
                <Download size={18} />
                <span className="hidden md:inline font-medium">تثبيت</span>
              </button>
            )}

            {/* Desktop Navigation (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-2">
                {/* Home Link */}
                <button 
                    onClick={() => onNavigate('home')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'home' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                >
                    <Home size={20} />
                    <span className="font-medium">الرئيسية</span>
                </button>

                {/* Dashboard Link */}
                {userRole !== 'Patient' && (userRole !== 'Supervisor' || hasPermission('view_dashboard')) && (
                <button 
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">الفحص</span>
                </button>
                )}

                {/* Users Link */}
                {(userRole === 'Admin' || userRole === 'Doctor' || hasPermission('manage_users')) && (
                <button 
                    onClick={() => onNavigate('users')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'users' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                >
                    <Users size={20} />
                    <span className="font-medium">{userRole === 'Doctor' ? 'مرضاي' : 'المستخدمين'}</span>
                </button>
                )}

                {/* Specialties Link */}
                {(userRole === 'Admin' || userRole === 'Doctor' || userRole === 'Patient' || hasPermission('manage_specialties')) && (
                <button 
                    onClick={() => onNavigate('specialties')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'specialties' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                >
                    <Stethoscope size={20} />
                    <span className="font-medium">التخصصات</span>
                </button>
                )}

                {/* Database Link */}
                {hasPermission('manage_database') && (
                <button 
                    onClick={() => onNavigate('database')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === 'database' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                >
                    <Database size={20} />
                    <span className="font-medium">البيانات</span>
                </button>
                )}

                {/* History Link */}
                <button 
                onClick={onOpenHistory}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${userRole === 'Patient' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                >
                {userRole === 'Patient' ? <HeartPulse size={20} /> : <History size={20} />}
                <span className="font-medium">{userRole === 'Patient' ? 'فحوصاتي' : 'السجل'}</span>
                </button>
            </div>

            {/* Always Visible Items (Profile & Logout) */}
            <button 
              onClick={() => onNavigate('profile')}
              className={`flex items-center gap-2 px-2 py-2 md:px-3 rounded-lg transition-colors ${currentView === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
              title="الملف الشخصي"
            >
              <UserCog size={22} />
              <span className="hidden md:inline font-medium">حسابي</span>
            </button>
            
            {onLogout && (
              <>
                <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 px-2 py-2 md:px-3 rounded-lg hover:bg-red-50 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut size={22} />
                  <span className="hidden md:inline font-medium">خروج</span>
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