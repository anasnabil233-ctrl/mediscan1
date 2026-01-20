
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة من النظام (Vercel) أو ملف .env
  // استخدام '' كبادئة يسمح بتحميل المتغيرات التي لا تبدأ بـ VITE_ في بيئة الـ Build
  const env = loadEnv(mode, process.cwd(), '');
  
  // تحديد المفتاح النهائي
  const actualApiKey = env.VITE_API_KEY || env.API_KEY || process.env.VITE_API_KEY || process.env.API_KEY || '';

  return {
    plugins: [
      react()
    ],
    base: './',
    define: {
      // حقن المتغيرات بشكل مباشر ليتم استبدالها في كود المتصفح أثناء البناء (Build)
      // ملاحظة: Vite يستبدل هذه السلاسل حرفياً في ملفات الـ JS الناتجة
      'process.env.API_KEY': JSON.stringify(actualApiKey),
      'process.env.VITE_API_KEY': JSON.stringify(actualApiKey),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'global': 'window', 
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
          input: {
              main: resolve(process.cwd(), 'index.html'),
          }
      }
    },
    server: {
        host: true
    }
  };
});
