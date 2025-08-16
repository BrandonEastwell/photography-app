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
      eas: {
        "projectId": "8cc1741c-72ff-4705-8194-c2835dacaa45"
      },
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
      output: "single",
      favicon: ""
    },
    splash: {
      backgroundColor: "#181a1b"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [ "expo-font",
        {
          fonts: [ "./assets/fonts/BethEllen-Regular.ttf" ]
        }
      ],
      [ "expo-splash-screen",
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