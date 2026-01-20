
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // جلب المتغيرات من ملفات .env ومن النظام (Vercel)
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // دمج المتغيرات التي قد تكون باسم API_KEY أو VITE_API_KEY
  const actualApiKey = env.VITE_API_KEY || env.API_KEY || (process as any).env.API_KEY || '';

  return {
    plugins: [
      react()
    ],
    base: './',
    define: {
      // حقن المتغيرات بشكل مباشر ليتم استبدالها في كود المتصفح أثناء عملية البناء
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
