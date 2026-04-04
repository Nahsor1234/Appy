
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pulsyvibe',
  appName: 'PulsyVibe',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // When you have a live URL, uncomment the line below and add your domain
    // url: 'https://your-live-pulsyvibe-app.vercel.app',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      releaseType: 'APK'
    }
  }
};

export default config;