import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  const defineConfig: Record<string, string> = {};
  
  if (env.API_KEY) {
    defineConfig['process.env.API_KEY'] = JSON.stringify(env.API_KEY);
  }
  
  if (env.VITE_SUPABASE_URL) {
    defineConfig['process.env.VITE_SUPABASE_URL'] = JSON.stringify(env.VITE_SUPABASE_URL);
  }
  if (env.VITE_SUPABASE_ANON_KEY) {
    defineConfig['process.env.VITE_SUPABASE_ANON_KEY'] = JSON.stringify(env.VITE_SUPABASE_ANON_KEY);
  }

  return {
    plugins: [
      react()
    ],
    base: './',
    define: defineConfig,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
          // Ensure we don't treat sw.js as an external dependency that needs complex handling
          input: {
              main: resolve((process as any).cwd(), 'index.html'),
          }
      }
    },
    // Ensure development server handles fallback correctly
    server: {
        host: true
    }
  };
});