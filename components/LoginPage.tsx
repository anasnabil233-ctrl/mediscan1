import React, { useState } from 'react';
import { Activity, Mail, Lock, ArrowLeft, Phone, Key, ChevronRight, CheckCircle2 } from 'lucide-react';
import { loginUser, resetPassword } from '../services/userService';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

type ViewState = 'login' | 'forgot_verify' | 'forgot_reset';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<ViewState>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password State
  const [resetPhone, setResetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Shared UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await loginUser(email, password);
      setIsLoading(false);
      
      if (user) {
        onLogin(user);
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.');
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!email || !resetPhone) {
        setError("يرجى إدخال البريد الإلكتروني ورقم الهاتف");
        setIsLoading(false);
        return;
    }

    setTimeout(() => {
        setIsLoading(false);
        setView('forgot_reset');
    }, 800);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      if (newPassword.length < 3) {
          setError("كلمة المرور قصيرة جداً");
          setIsLoading(false);
          return;
      }
      if (newPassword !== confirmPassword) {
          setError("كلمات المرور غير متطابقة");
          setIsLoading(false);
          return;
      }

      setTimeout(() => {
          const result = resetPassword(email, resetPhone, newPassword);
          setIsLoading(false);
          if (result.success) {
              setSuccessMsg(result.message);
              setTimeout(() => {
                  setView('login');
                  setSuccessMsg(null);
                  setPassword(''); 
                  setResetPhone('');
                  setNewPassword('');
                  setConfirmPassword('');
              }, 2000);
          } else {
              setError(result.message);
          }
      }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        
        <div className="bg-teal-600 p-8 text-center">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك في MediScan AI</h1>
          <p className="text-teal-100 text-sm">منصة ذكية لتحليل الصور الطبية</p>
        </div>

        <div className="p-8">
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fade-in-up">
                <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">البريد الإلكتروني</label>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={20} />
                    </div>
                    <input 
                    type="email" 
                    required
                    className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                </div>

                <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">كلمة المرور</label>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={20} />
                    </div>
                    <input 
                    type="password" 
                    required
                    className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="text-left">
                    <button 
                        type="button"
                        onClick={() => { setError(null); setView('forgot_verify'); }}
                        className="text-xs text-teal-600 hover:text-teal-800 font-bold"
                    >
                        نسيت كلمة المرور؟
                    </button>
                </div>
                </div>

                {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
                )}
                 {successMsg && (
                    <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        {successMsg}
                    </div>
                )}

                <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {isLoading ? (
                    <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الدخول...
                    </>
                ) : (
                    <>
                    تسجيل الدخول
                    <ArrowLeft size={20} />
                    </>
                )}
                </button>
            </form>
          )}

          {/* FORGOT PASS: VERIFY VIEW */}
          {view === 'forgot_verify' && (
              <form onSubmit={handleVerifySubmit} className="space-y-6 animate-fade-in-up">
                <div className="text-center mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">استعادة كلمة المرور</h3>
                    <p className="text-slate-500 text-sm">أدخل بريدك الإلكتروني ورقم الهاتف المرتبط بالحساب</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">البريد الإلكتروني</label>
                    <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                        type="email" 
                        required
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">رقم الهاتف</label>
                    <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                        type="tel" 
                        required
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="01xxxxxxxxx"
                        value={resetPhone}
                        onChange={(e) => setResetPhone(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => { setError(null); setView('login'); }}
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                    >
                        إلغاء
                    </button>
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                         {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'التالي'}
                    </button>
                </div>
              </form>
          )}

          {/* FORGOT PASS: RESET VIEW */}
          {view === 'forgot_reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-6 animate-fade-in-up">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">تعيين كلمة مرور جديدة</h3>
                    <p className="text-slate-500 text-sm">أدخل كلمة المرور الجديدة للحساب: {email}</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">كلمة المرور الجديدة</label>
                    <div className="relative">
                        <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                        type="password" 
                        required
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                        type="password" 
                        required
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                 <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => { setError(null); setView('forgot_verify'); }}
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                    >
                        رجوع
                    </button>
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                         {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'حفظ'}
                    </button>
                </div>
              </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-xs">
              جميع الحقوق محفوظة &copy; MediScan AI 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;