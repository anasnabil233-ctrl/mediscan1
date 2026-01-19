
import React from 'react';
import { 
  Activity, 
  UploadCloud, 
  BrainCircuit, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  Search, 
  History, 
  PlusCircle, 
  Microscope,
  Stethoscope
} from 'lucide-react';

interface HomePageProps {
  onStart: () => void;
  userRole?: string;
}

const HomePage: React.FC<HomePageProps> = ({ onStart, userRole }) => {
  return (
    <div className="flex flex-col w-full animate-fade-in-up">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 pt-16 pb-20 lg:pt-24 lg:pb-32 text-white">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Text Content */}
            <div className="text-center lg:text-right lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest animate-fade-in">
                <Activity size={14} className="animate-pulse" />
                <span>نظام التشخيص الذكي المتكامل</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.15] animate-fade-in-up">
                دقة <span className="text-teal-400">الفحص</span> تبدأ من <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-300 to-blue-400">هنا مع MediScan AI</span>
              </h1>
              
              <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-100">
                استخدم قوة نماذج Gemini 3 لتحليل صور الأشعة السينية والرنين المغناطيسي في ثوانٍ. تقارير طبية شاملة باللغة العربية مدعومة بالذكاء الاصطناعي.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 animate-fade-in-up delay-200">
                <button
                  onClick={onStart}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl text-slate-900 bg-teal-400 hover:bg-teal-300 shadow-xl shadow-teal-500/20 transition-all transform hover:scale-105 active:scale-95 group"
                >
                  {userRole === 'Doctor' ? 'ابدأ فحصاً جديداً' : 'اسكان صورة أشعة'}
                  <ArrowRight className="mr-2 group-hover:translate-x-[-4px] transition-transform" size={24} />
                </button>
                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-sm">
                   <div className="flex -space-x-2 space-x-reverse">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                        </div>
                      ))}
                   </div>
                   <span className="text-slate-400">ينصح به +500 طبيب مختص</span>
                </div>
              </div>
            </div>

            {/* Visual/Image Area with Animation */}
            <div className="mt-16 lg:mt-0 lg:col-span-6 relative perspective-1000">
              <div className="relative mx-auto w-full max-w-lg transform rotate-y-[-8deg] rotate-x-[5deg] group hover:rotate-0 transition-transform duration-700">
                  {/* Decorative Glow */}
                  <div className="absolute inset-0 bg-teal-400/20 blur-[100px] -z-10 animate-pulse"></div>
                  
                  <div className="bg-slate-800 rounded-[40px] p-1 border border-white/10 shadow-2xl overflow-hidden">
                    <div className="bg-slate-900 rounded-[39px] overflow-hidden">
                        {/* Title Bar */}
                        <div className="px-6 py-4 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-teal-500/50"></div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Medical_Scan_Engine_v3.0</span>
                        </div>

                        {/* Image Simulation */}
                        <div className="aspect-[4/3] relative bg-black group-hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                            
                            {/* Scanning Animation */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-teal-400/60 shadow-[0_0_20px_rgba(45,212,191,0.8)] animate-scan z-20"></div>
                            
                            {/* Detection Box */}
                            <div className="absolute top-[20%] left-[30%] w-32 h-32 border-2 border-teal-400/50 rounded-lg animate-pulse">
                                <div className="absolute -top-8 right-0 bg-teal-400 text-[10px] font-black text-slate-900 px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                                    جاري التحليل: منطقة الصدر
                                </div>
                                <div className="absolute inset-0 bg-teal-400/10 backdrop-blur-[1px]"></div>
                            </div>

                            {/* Floating Stats UI */}
                            <div className="absolute bottom-6 left-6 right-6 space-y-3 z-30">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-white/60">نسبة الدقة المتوقعة</span>
                                    <span className="text-teal-400 text-xs font-mono">98.2%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-400 w-[98%] animate-shimmer"></div>
                                </div>
                                <div className="flex gap-2">
                                   <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                      <div className="text-[9px] text-slate-500 mb-1">الحالة</div>
                                      <div className="text-xs font-bold text-white">طبيعي</div>
                                   </div>
                                   <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                      <div className="text-[9px] text-slate-500 mb-1">الزمن</div>
                                      <div className="text-xs font-bold text-white">0.4 ثانية</div>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Logged In Users */}
      <div className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <QuickActionCard 
              icon={<PlusCircle className="text-teal-500" />} 
              title="فحص جديد" 
              desc="ارفع صورة أشعة الآن للتحليل" 
              onClick={onStart} 
              color="teal"
           />
           <QuickActionCard 
              icon={<Search className="text-blue-500" />} 
              title="بحث عن مريض" 
              desc="الوصول السريع لملفات المرضى" 
              onClick={() => {}} 
              color="blue"
           />
           <QuickActionCard 
              icon={<History className="text-purple-500" />} 
              title="سجل الفحوصات" 
              desc="مراجعة التقارير السابقة" 
              onClick={() => {}} 
              color="purple"
           />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-teal-600 font-black uppercase tracking-widest text-sm mb-4">التكنولوجيا الطبية الحديثة</h2>
            <p className="text-3xl md:text-5xl font-black text-slate-900">
              لماذا MediScan AI هو الأفضل؟
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<UploadCloud size={32} />} 
              title="سهولة مطلقة" 
              desc="واجهة مصممة للأطباء تدعم السحب والإفلات. ارفع الصورة واحصل على النتيجة فوراً."
              color="teal"
            />
            <FeatureCard 
              icon={<BrainCircuit size={32} />} 
              title="ذكاء Gemini 3" 
              desc="أحدث نماذج الذكاء الاصطناعي من جوجل لضمان دقة تشخيص تضاهي الخبرات البشرية."
              color="blue"
            />
            <FeatureCard 
              icon={<FileText size={32} />} 
              title="تقارير عربية" 
              desc="يتم صياغة التقرير بلغة طبية عربية دقيقة تشمل الملاحظات، التوصيات، ومستوى الخطورة."
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-slate-900 text-white py-16 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 50 Q 25 20 50 50 T 100 50" fill="none" stroke="teal" strokeWidth="0.5" />
               <path d="M0 60 Q 30 30 60 60 T 100 60" fill="none" stroke="teal" strokeWidth="0.5" />
            </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem label="حالة تم اسكانها" value="+15,000" />
            <StatItem label="دقة الفحص" value="98.5%" />
            <StatItem label="معدل السرعة" value="2.5s" />
            <StatItem label="أمن البيانات" value="AES-256" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-[-8deg] {
          transform: rotateY(-8deg);
        }
        .rotate-x-[5deg] {
          transform: rotateX(5deg);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          position: relative;
          overflow: hidden;
        }
        .animate-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 1.5s infinite;
        }
      `}} />
    </div>
  );
};

const QuickActionCard = ({ icon, title, desc, onClick, color }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void, color: string }) => {
    const colorClasses = {
        teal: 'hover:border-teal-400 hover:shadow-teal-500/10',
        blue: 'hover:border-blue-400 hover:shadow-blue-500/10',
        purple: 'hover:border-purple-400 hover:shadow-purple-500/10'
    };
    
    return (
        <button 
            onClick={onClick}
            className={`bg-white p-6 rounded-3xl shadow-xl border border-slate-100 text-right transition-all transform hover:scale-105 group ${colorClasses[color as keyof typeof colorClasses]}`}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{desc}</p>
                </div>
            </div>
        </button>
    );
};

const FeatureCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => {
    const colorClasses = {
        teal: 'bg-teal-50 text-teal-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600'
    };
    
    return (
        <div className="p-10 rounded-[40px] border border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-200 hover:shadow-2xl transition-all duration-500 group">
            <div className={`w-16 h-16 ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );
};

const StatItem = ({ label, value }: { label: string, value: string }) => (
    <div className="space-y-2">
        <div className="text-3xl md:text-5xl font-black text-teal-400">{value}</div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
);

export default HomePage;
