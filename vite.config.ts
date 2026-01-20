
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // تحميل كافة المتغيرات بما فيها التي لا تبدأ بـ VITE_ من النظام (Vercel)
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // اختيار المفتاح المتاح (الأولوية لـ VITE_ ثم العادي)
  const actualApiKey = env.VITE_API_KEY || env.API_KEY || '';

  return {
    plugins: [
      react()
    ],
    base: './',
    define: {
      // حقن المفتاح بشكل صارم ليتم استبداله في الملفات أثناء الـ Build
      'process.env.API_KEY': JSON.stringify(actualApiKey),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'global': 'window', 
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
          input: {
              main: resolve((process as any).cwd(), 'index.html'),
          }
      }
    },
    server: {
        host: true
    }
  };
});
