
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة من النظام (Vercel) أو ملف .env
  // Fix: Cast process to any to resolve 'Property cwd does not exist on type Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [
      react()
    ],
    base: './',
    define: {
      // حقن المتغيرات بشكل مباشر ليتم استبدالها في كود المتصفح
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'global': 'window', 
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
          input: {
              // Fix: Cast process to any to resolve 'Property cwd does not exist on type Process'
              main: resolve((process as any).cwd(), 'index.html'),
          }
      }
    },
    server: {
        host: true
    }
  };
});
