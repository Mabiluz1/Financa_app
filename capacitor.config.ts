import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.financaapp',
  appName: 'Finança App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
