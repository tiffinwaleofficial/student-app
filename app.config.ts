import 'dotenv/config';

// Ensure we can access process.env in TypeScript
declare const process: {
  env: {
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    CLOUDINARY_UPLOAD_PRESET?: string;
    [key: string]: string | undefined;
  };
};

export default {
  expo: {
    name: "TiffinWale",
    slug: "tiffinwale-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "tiffinwale",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png",
      name: "TiffinWale - Food Delivery",
      shortName: "TiffinWale",
      description: "TiffinWale - Delicious meals for bachelors",
      lang: "en",
      scope: "/",
      themeColor: "#FF9B42",
      backgroundColor: "#FFFAF0"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    android: {
      package: "com.tiffinwale_official.tiffinwalemobile",
      usesCleartextTraffic: true,
      networkSecurityConfig: "./android/app/src/main/res/xml/network_security_config.xml",
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ],
      // Enable Hermes for better performance and code splitting
      jsEngine: "hermes"
    },
    // Enable Hermes for iOS as well
    ios: {
      supportsTablet: true,
      jsEngine: "hermes"
    },
    extra: {
      // API URL is now platform-detected in environment.ts
      // Pass other .env variables to the app
      eas: {
        projectId: "13eb86a1-d692-4ef4-8535-0da1c97bea88"
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      },
    }
  }
}; 