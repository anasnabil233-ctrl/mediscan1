
import React from 'react';
import { Activity, UploadCloud, BrainCircuit, FileText, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

interface HomePageProps {
  onStart: () => void;
  userRole?: string;
}

const HomePage: React.FC<HomePageProps> = ({ onStart, userRole }) => {
  return (
    <div className="flex flex-col w-full animate-fade-in-up">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
             <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-right">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Text Content */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-bold mb-6">
                <Zap size={16} fill="currentColor" />
                <span>الجيل الجديد من الفحص الطبي</span>
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block xl:inline">اسكان الأشعة الطبية</span>{' '}
                <span className="block text-teal-600 xl:inline">بالذكاء الاصطناعي</span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                منصة MediScan AI تساعد الأطباء والمرضى في الحصول على اسكان فوري ودقيق لصور الأشعة، الرنين المغناطيسي، والأشعة المقطعية باستخدام أحدث تقنيات Gemini 2.5.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-right lg:mx-0">
                <button
                  onClick={onStart}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 md:text-lg shadow-lg shadow-teal-500/30 transition-all transform hover:scale-105"
                >
                  {userRole === 'Doctor' ? 'ابدأ الفحص الآن' : 'اسكان صور الأشعة'}
                  <ArrowRight className="mr-2" size={24} />
                </button>
                <p className="mt-3 text-xs text-slate-400">
                  * يدعم جميع أنواع الصور الطبية (JPG, PNG)
                </p>
              </div>
            </div>

            {/* Visual/Image Area */}
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden bg-white border border-slate-200">
                  <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4">
                      <div className="col-span-2 bg-slate-900 rounded-xl h-48 flex items-center justify-center relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-transparent"></div>
                          <Activity size={64} className="text-teal-500 opacity-50" />
                          
                          {/* Floating Elements */}
                          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
                              <BrainCircuit size={20} className="text-teal-300" />
                          </div>
                      </div>
                      <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                          <div className="h-2 w-12 bg-teal-200 rounded-full mb-2"></div>
                          <div className="h-2 w-20 bg-teal-200 rounded-full"></div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <div className="h-2 w-16 bg-slate-200 rounded-full mb-2"></div>
                           <div className="h-2 w-10 bg-slate-200 rounded-full"></div>
                      </div>
                  </div>
                  <div className="px-6 pb-6">
                      <div className="w-full bg-teal-600 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          إصدار التقرير الطبي
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-bold text-teal-600 tracking-wide uppercase">المميزات</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              لماذا تختار MediScan AI؟
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              
              <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-slate-100">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-teal-100 text-teal-600 mb-4">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-lg leading-6 font-bold text-slate-900">سهولة الاستخدام</h3>
                <p className="mt-2 text-base text-slate-500">
                  واجهة بسيطة تدعم السحب والإفلات. ارفع الصورة واعمل اسكان في ثوانٍ.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-slate-100">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                  <BrainCircuit size={32} />
                </div>
                <h3 className="text-lg leading-6 font-bold text-slate-900">ذكاء اصطناعي متطور</h3>
                <p className="mt-2 text-base text-slate-500">
                  يعتمد على نماذج Gemini 2.5 القوية لاسكان دقيق واكتشاف الحالات المعقدة.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-slate-100">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-purple-100 text-purple-600 mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg leading-6 font-bold text-slate-900">تقارير مفصلة</h3>
                <p className="mt-2 text-base text-slate-500">
                  احصل على تقرير شامل يتضمن الفحص، نسبة الثقة، والتوصيات الطبية باللغة العربية.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {statsSection()}
    </div>
  );
};

const statsSection = () => (
  <div className="bg-teal-800 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-teal-700 divide-x-reverse">
        <div>
          <div className="text-4xl font-bold mb-1">+1000</div>
          <div className="text-teal-200 text-sm">حالة تم اسكانها</div>
        </div>
        <div>
          <div className="text-4xl font-bold mb-1">98%</div>
          <div className="text-teal-200 text-sm">دقة الفحص</div>
        </div>
        <div>
          <div className="text-4xl font-bold mb-1">24/7</div>
          <div className="text-teal-200 text-sm">متاح دائماً</div>
        </div>
        <div>
          <div className="text-4xl font-bold mb-1"><ShieldCheck className="mx-auto" size={32} /></div>
          <div className="text-teal-200 text-sm">بيانات آمنة</div>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;
