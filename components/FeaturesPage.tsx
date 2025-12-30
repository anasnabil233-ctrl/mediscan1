
import React from 'react';
import { BrainCircuit, Languages, FileCheck, ShieldCheck, Users, Smartphone, Zap, ArrowLeft, Microscope, Activity } from 'lucide-react';
import Logo from './Logo';

interface FeaturesPageProps {
  onStart: () => void;
  isLoggedIn: boolean;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onStart, isLoggedIn }) => {
  const features = [
    {
      title: "ذكاء اصطناعي متطور",
      description: "يعتمد على أقوى نماذج Gemini 3 لتحليل صور الأشعة (X-ray, MRI, CT) بدقة تضاهي الخبراء.",
      icon: <BrainCircuit className="text-teal-600" size={32} />,
      bg: "bg-teal-50"
    },
    {
      title: "دعم كامل للغة العربية",
      description: "واجهة عربية بالكامل مع تقارير طبية مصاغة بلغة عربية سليمة ومفهومة.",
      icon: <Languages className="text-blue-600" size={32} />,
      bg: "bg-blue-50"
    },
    {
      title: "تقارير فورية وشاملة",
      description: "استخراج النتائج في ثوانٍ معدودة تشمل التشخيص، نسبة الثقة، والتوصيات الطبية.",
      icon: <FileCheck className="text-purple-600" size={32} />,
      bg: "bg-purple-50"
    },
    {
      title: "خصوصية وأمان عالي",
      description: "تشفير كامل لبيانات المرضى وصور الأشعة مع حفظها بشكل آمن في السحابة.",
      icon: <ShieldCheck className="text-green-600" size={32} />,
      bg: "bg-green-50"
    },
    {
      title: "نظام إدارة متكامل",
      description: "حسابات مخصصة للأطباء والمرضى مع إمكانية التواصل الفوري عبر نظام دردشة مدمج.",
      icon: <Users className="text-amber-600" size={32} />,
      bg: "bg-amber-50"
    },
    {
      title: "تجربة تطبيق هاتف",
      description: "يعمل كتطبيق ويب تقدمي (PWA) يمكن تثبيته على الأندرويد والآيفون والعمل بدون إنترنت.",
      icon: <Smartphone className="text-rose-600" size={32} />,
      bg: "bg-rose-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-600/5 -skew-x-12 transform origin-right"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 p-4 bg-white rounded-3xl shadow-xl animate-bounce-slow">
              <Logo size={80} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
              مرحباً بك في <span className="text-teal-600">MediScan AI</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed mb-10">
              المنصة الرائدة في الشرق الأوسط لتحليل الصور الطبية باستخدام الذكاء الاصطناعي، 
              نهدف إلى تمكين الأطباء ومساعدة المرضى عبر تشخيص أسرع وأدق.
            </p>
            <button 
              onClick={onStart}
              className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 flex items-center gap-3 transform hover:scale-105"
            >
              {isLoggedIn ? "ابدأ الفحص الآن" : "استكشف البرنامج"}
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-teal-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white mb-2">99%</div>
              <div className="text-teal-200 text-sm">دقة التحليل</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white mb-2">24/7</div>
              <div className="text-teal-200 text-sm">توفر الخدمة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white mb-2">+10k</div>
              <div className="text-teal-200 text-sm">صورة تم تحليلها</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white mb-2">10s</div>
              <div className="text-teal-200 text-sm">سرعة الاستجابة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">مميزات البرنامج</h2>
          <div className="w-24 h-1.5 bg-teal-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-8 rounded-3xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-xl transition-all group"
            >
              <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">كيف يعمل MediScan AI؟</h2>
            <p className="text-slate-500">ثلاث خطوات بسيطة للحصول على تقريرك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-teal-200 hidden md:block -z-0"></div>
            
            {[
              { step: "01", title: "رفع الصورة", desc: "قم برفع صورة الأشعة من جهازك أو التقاطها مباشرة.", icon: <Zap className="text-white" /> },
              { step: "02", title: "تحليل الذكاء الاصطناعي", desc: "يقوم النظام بفحص كل بكسل في الصورة لتحديد العلامات المرضية.", icon: <Microscope className="text-white" /> },
              { step: "03", title: "استلام التقرير", desc: "احصل على تقرير طبي مفصل باللغة العربية مع إمكانية حفظه.", icon: <Activity className="text-white" /> }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-lg mb-6 border-4 border-white text-xl font-black">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
          <ShieldCheck className="text-amber-600 shrink-0" size={24} />
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>تنبيه هام:</strong> MediScan AI هو أداة مساعدة تعتمد على الذكاء الاصطناعي. النتائج المقدمة هي للاسترشاد الطبي فقط ولا تعتبر تشخيصاً نهائياً. يجب دائماً استشارة طبيب مختص قبل اتخاذ أي قرارات طبية.
          </p>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
