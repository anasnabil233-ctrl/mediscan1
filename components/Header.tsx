
import React from 'react';
import { History, LogOut, Users, LayoutDashboard, HeartPulse, UserCog, Stethoscope, Home, Download, Database, Info } from 'lucide-react';
import { UserRole, AppPermission } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentView: 'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database' | 'features';
  onNavigate: (view: 'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database' | 'features') => void;
  onOpenHistory?: () => void;
  onLogout?: () => void;
  userRole?: UserRole;
  userPermissions?: AppPermission[];
  userName?: string;
  onInstall?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenHistory, onLogout, userRole, userPermissions = [], userName, onInstall }) => {
  const hasPermission = (permission: AppPermission) => {
    if (userRole === 'Admin') return true;
    if (userRole === 'Supervisor' && userPermissions.includes(permission)) return true;
    return false;
  };

  const btnClass = (view: string) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === view ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`;

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
            {onInstall && (
              <button onClick={onInstall} className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors animate-pulse">
                <Download size={18} />
                <span className="hidden md:inline font-medium">تثبيت</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-2">
                <button onClick={() => onNavigate('home')} className={btnClass('home')}>
                    <Home size={20} /> <span className="font-medium">الرئيسية</span>
                </button>
                
                {/* Features Link */}
                <button onClick={() => onNavigate('features')} className={btnClass('features')}>
                    <Info size={20} /> <span className="font-medium">عن البرنامج</span>
                </button>

                {userRole !== 'Patient' && (userRole !== 'Supervisor' || hasPermission('view_dashboard')) && (
                <button onClick={() => onNavigate('dashboard')} className={btnClass('dashboard')}>
                    <LayoutDashboard size={20} /> <span className="font-medium">الفحص</span>
                </button>
                )}

                {(userRole === 'Admin' || userRole === 'Doctor' || hasPermission('manage_users')) && (
                <button onClick={() => onNavigate('users')} className={btnClass('users')}>
                    <Users size={20} /> <span className="font-medium">{userRole === 'Doctor' ? 'مرضاي' : 'المستخدمين'}</span>
                </button>
                )}

                <button onClick={onOpenHistory} className={btnClass('history')}>
                {userRole === 'Patient' ? <HeartPulse size={20} /> : <History size={20} />}
                <span className="font-medium">{userRole === 'Patient' ? 'فحوصاتي' : 'السجل'}</span>
                </button>
            </div>

            <button onClick={() => onNavigate('profile')} className={btnClass('profile')} title="الملف الشخصي">
              <UserCog size={22} />
              <span className="hidden md:inline font-medium">حسابي</span>
            </button>
            
            {onLogout && (
              <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 px-2 py-2 md:px-3 rounded-lg hover:bg-red-50 transition-colors">
                <LogOut size={22} />
                <span className="hidden md:inline font-medium">خروج</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
