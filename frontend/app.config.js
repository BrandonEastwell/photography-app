import * as dotenv from 'dotenv';
dotenv.config();

export default {
  expo: {
    name: "frontend",
    slug: "frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "",
    scheme: "frontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    extra: {
      API_URL: process.env.API_URL,
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "",
        backgroundColor: "#181a1b"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: ""
    },
    splash: {
      backgroundColor: "#181a1b"
    },
    plugins: [
      "expo-secure-store",
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#181a1b"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
};