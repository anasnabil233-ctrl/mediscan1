
import React from 'react';
import { 
  ArrowLeft, 
  BrainCircuit, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Search, 
  CheckCircle, 
  Microscope,
  Stethoscope,
  Activity,
  ChevronDown
} from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onLoginClick: () => void;
  onExploreFeatures: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onExploreFeatures }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} className="shadow-lg rounded-xl" />
            <span className="text-xl font-black tracking-tight text-slate-800">MediScan <span className="text-teal-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-teal-600 transition-colors">المميزات</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">كيف يعمل؟</a>
            <a href="#mobile" className="hover:text-teal-600 transition-colors">تطبيق الهاتف</a>
          </div>
          <button 
            onClick={onLoginClick}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            دخول الأطباء
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-right space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-black uppercase tracking-widest animate-fade-in">
                <Zap size={14} fill="currentColor" />
                <span>مستقبل التشخيص الطبي هنا</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] animate-fade-in-up">
                اسكان صور الأشعة <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-blue-600">بذكاء اصطناعي فائق</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-100">
                منصة MediScan AI توفر للأطباء اسكاناً فورياً وشاملاً لصور X-Ray و MRI و CT Scan بدقة تصل إلى 99%، مع تقارير طبية مفصلة باللغة العربية.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-200">
                <button 
                  onClick={onLoginClick}
                  className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  ابدأ التجربة الآن
                  <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onExploreFeatures}
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
                >
                  استكشف المميزات
                </button>
              </div>
            </div>

            {/* Interactive Demo Simulation */}
            <div className="relative group perspective-1000 hidden lg:block">
              <div className="relative z-10 bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 transform rotate-y-[-10deg] rotate-x-[5deg] group-hover:rotate-0 transition-transform duration-700">
                <div className="aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
                  
                  {/* Scan Line Animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-teal-400/50 shadow-[0_0_20px_rgba(45,212,191,0.8)] animate-scan"></div>
                  
                  {/* AI Detection Markers */}
                  <div className="absolute top-1/4 right-1/3 w-20 h-20 border-2 border-teal-400 rounded-lg animate-pulse">
                    <div className="absolute -top-6 right-0 bg-teal-400 text-[10px] font-bold text-slate-900 px-1.5 py-0.5 rounded">تشخيص: كسر</div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                    <div className="flex items-center justify-between text-white mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest">فحص Gemini 3</span>
                      <span className="text-xs font-mono">98.4% دقة</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 w-[98%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Blobs */}
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
          {[
            { val: "99%", label: "دقة الفحص", sub: "بمعايير عالمية" },
            { val: "10s", label: "سرعة الفحص", sub: "لكل صورة أشعة" },
            { val: "+15k", label: "اسكان مكتمل", sub: "تمت بنجاح" },
            { val: "24/7", label: "دعم فني", sub: "متوفر دائماً" }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-teal-400">{stat.val}</div>
              <div className="text-lg font-bold">{stat.label}</div>
              <div className="text-slate-400 text-xs">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-32 max-w-7xl mx-auto px-4">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-teal-600 font-black uppercase tracking-widest text-sm">لماذا MediScan AI؟</h2>
          <p className="text-3xl md:text-5xl font-black text-slate-900">مميزات تجعل الفحص أسهل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "اسكان ذكي فوري", 
              desc: "باستخدام أحدث نماذج Google Gemini 3، يتم فحص أدق التفاصيل في صور الأشعة واكتشاف الكسور والأورام والالتهابات.",
              icon: <BrainCircuit className="text-teal-600" size={32} />,
              bg: "bg-teal-50"
            },
            { 
              title: "خصوصية بيانات كاملة", 
              desc: "تشفير بيانات المرضى وحماية الصور الطبية وفق أعلى المعايير الأمنية العالمية لضمان سرية المعلومات.",
              icon: <ShieldCheck className="text-blue-600" size={32} />,
              bg: "bg-blue-50"
            },
            { 
              title: "واجهة عربية متطورة", 
              desc: "تطبيق مصمم خصيصاً للمجتمع الطبي العربي، مع تقارير واضحة وسهلة الفهم للمريض والطبيب.",
              icon: <Activity className="text-purple-600" size={32} />,
              bg: "bg-purple-50"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-10 rounded-[40px] border border-slate-100 bg-white hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500">
              <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile/APK Showcase */}
      <section id="mobile" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-[60px] p-12 md:p-20 border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-50/50 via-transparent to-transparent"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div className="space-y-8">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <Smartphone size={32} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                  تطبيقك الطبي <br />
                  <span className="text-teal-600">في جيبك دائماً</span>
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed">
                  يمكنك تثبيت MediScan AI كبرنامج أصلي على هاتفك الأندرويد أو آيفون مباشرة من المتصفح، مما يتيح لك الوصول السريع والعمل في وضع عدم الاتصال.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                    <CheckCircle className="text-teal-500" size={20} />
                    <span className="text-sm font-bold text-slate-700">دعم APK للأندرويد</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                    <CheckCircle className="text-teal-500" size={20} />
                    <span className="text-sm font-bold text-slate-700">مزامنة سحابية فورية</span>
                  </div>
                </div>
                <button 
                  onClick={onLoginClick}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-teal-600 transition-all shadow-xl active:scale-95"
                >
                  تثبيت البرنامج الآن
                </button>
              </div>
              
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Phone Mockup Frame */}
                  <div className="w-[280px] h-[580px] bg-slate-900 rounded-[50px] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                    <div className="absolute inset-0 bg-white">
                      <div className="p-4 pt-10">
                         <div className="flex items-center justify-between mb-6">
                            <Logo size={32} />
                            <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                         </div>
                         <div className="space-y-4">
                            <div className="h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                               <Activity className="text-slate-300" size={32} />
                            </div>
                            <div className="space-y-2">
                               <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                               <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                               <div className="h-20 bg-teal-50 rounded-xl"></div>
                               <div className="h-20 bg-blue-50 rounded-xl"></div>
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
      </section>

      {/* Footer Disclaimer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Logo size={32} />
              <span className="font-bold text-slate-800">MediScan AI</span>
            </div>
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} ميدي سكان. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-teal-600 transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-teal-600 transition-colors">الشروط والأحكام</a>
            </div>
          </div>
          <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-3xl text-center">
            <p className="text-xs text-amber-800 leading-relaxed max-w-4xl mx-auto">
              تنبيه طبي: MediScan AI هو أداة مساعدة تعتمد على الذكاء الاصطناعي. النتائج المقدمة هي للاسترشاد الطبي فقط ولا تعتبر تشخيصاً نهائياً. يجب دائماً استشارة طبيب مختص قبل اتخاذ أي قرارات علاجية.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <button 
          onClick={onLoginClick}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-2xl shadow-teal-500/40 active:scale-95 transition-transform"
        >
          دخول النظام
        </button>
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
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}} />
    </div>
  );
};

export default LandingPage;
