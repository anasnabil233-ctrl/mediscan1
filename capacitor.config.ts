import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mediscan.ai',
  appName: 'MediScan AI',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Ensure we load from local files for APK, not a url
    androidScheme: 'https'
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  }
};

export default config;