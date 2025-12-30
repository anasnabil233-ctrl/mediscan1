
import React from 'react';
import { Home, LayoutDashboard, Users, HeartPulse, History, Database, Stethoscope, Info } from 'lucide-react';
import { UserRole, AppPermission } from '../types';

interface BottomNavProps {
  currentView: 'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database' | 'features';
  onNavigate: (view: 'home' | 'dashboard' | 'users' | 'profile' | 'specialties' | 'database' | 'features') => void;
  onOpenHistory: () => void;
  userRole?: UserRole;
  userPermissions?: AppPermission[];
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onOpenHistory, userRole, userPermissions = [] }) => {
  const hasPermission = (permission: AppPermission) => {
    if (userRole === 'Admin') return true;
    if (userRole === 'Supervisor' && userPermissions.includes(permission)) return true;
    return false;
  };

  const navItemClass = (isActive: boolean) => `
    flex flex-col items-center justify-center w-full h-full py-1 gap-1 text-[10px] font-bold transition-all
    ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}
  `;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        <button onClick={() => onNavigate('home')} className={navItemClass(currentView === 'home')}>
          <Home size={22} />
          <span>الرئيسية</span>
        </button>

        <button onClick={() => onNavigate('features')} className={navItemClass(currentView === 'features')}>
          <Info size={22} />
          <span>عن البرنامج</span>
        </button>

        {userRole !== 'Patient' && (userRole !== 'Supervisor' || hasPermission('view_dashboard')) && (
          <button onClick={() => onNavigate('dashboard')} className={navItemClass(currentView === 'dashboard')}>
            <LayoutDashboard size={22} />
            <span>الفحص</span>
          </button>
        )}

        <button onClick={onOpenHistory} className={navItemClass(false)}>
           {userRole === 'Patient' ? <HeartPulse size={22} /> : <History size={22} />}
           <span>{userRole === 'Patient' ? 'فحوصاتي' : 'السجل'}</span>
        </button>

        {(userRole === 'Admin' || userRole === 'Doctor' || hasPermission('manage_users')) && (
          <button onClick={() => onNavigate('users')} className={navItemClass(currentView === 'users')}>
            <Users size={22} />
            <span>{userRole === 'Doctor' ? 'المرضى' : 'المستخدمين'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomNav;
