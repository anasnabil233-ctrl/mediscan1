import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto py-8">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3 text-right">
          <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
          <p className="text-sm text-amber-800">
            <strong>إخلاء مسؤولية طبي:</strong> هذا التطبيق يستخدم الذكاء الاصطناعي لأغراض توضيحية وتعليمية فقط. النتائج المعروضة ليست تشخيصًا طبيًا نهائيًا ولا تغني عن استشارة الطبيب المختص. لا تعتمد على هذه النتائج لاتخاذ قرارات علاجية.
          </p>
        </div>
        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} MediScan AI. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;