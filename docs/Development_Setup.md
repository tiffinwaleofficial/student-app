# TiffinWale Student App - Development Setup Guide

## 🚀 Getting Started

This guide will help you set up the TiffinWale Student App development environment on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### **Required Software**
- **Node.js** (v18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** or **yarn** (Package Manager)
  - npm comes with Node.js
  - Or install yarn: `npm install -g yarn`

- **Expo CLI** (Development toolchain)
  ```bash
  npm install -g @expo/cli
  ```

- **Git** (Version control)
  - Download from [git-scm.com](https://git-scm.com/)

### **Mobile Development**
- **Expo Go** app on your mobile device
  - iOS: Download from App Store
  - Android: Download from Google Play Store

### **Optional but Recommended**
- **Android Studio** (for Android emulator)
- **Xcode** (for iOS simulator - macOS only)
- **VS Code** (Recommended code editor)

## 🛠️ Installation Steps

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd Tiffin-Wale/interface/student-app
```

### **2. Install Dependencies**
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### **3. Environment Configuration**
Create environment configuration in `app.config.js`:

```javascript
export default {
  expo: {
    name: "TiffinWale Student",
    slug: "tiffinwale-student",
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || "http://127.0.0.1:3001",
      environment: process.env.NODE_ENV || "development",
    },
  },
};
```

### **4. Start the Development Server**
```bash
# Start Expo development server
npx expo start

# Or with specific options
npx expo start --clear  # Clear cache
npx expo start --tunnel # Use tunnel for external access
```

## 📱 Running on Devices

### **Option 1: Expo Go App (Recommended for Development)**
1. Install Expo Go on your mobile device
2. Scan the QR code displayed in your terminal/browser
3. The app will load on your device

### **Option 2: iOS Simulator (macOS only)**
```bash
npx expo start --ios
```

### **Option 3: Android Emulator**
```bash
npx expo start --android
```

## 🔧 Development Tools Setup

### **VS Code Extensions**
Install these recommended extensions:
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Expo Tools**
- **GitLens**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**

### **VS Code Settings**
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 🏗️ Project Structure Overview

```
interface/student-app/
├── app/                     # Expo Router pages
│   ├── (auth)/             # Authentication screens
│   ├── (tabs)/             # Main app tabs
│   └── restaurant/         # Restaurant detail screens
├── components/             # Reusable UI components
├── store/                  # Zustand state management
├── utils/                  # Utility functions & API client
├── types/                  # TypeScript type definitions
├── assets/                 # Images, fonts, etc.
├── hooks/                  # Custom React hooks
└── docs/                   # Documentation (this folder!)
```

## 🔗 Backend Setup

The student app requires the TiffinWale backend to be running:

### **Start the Backend**
```bash
# Navigate to backend directory
cd ../../monolith_backend

# Install dependencies
npm install

# Start the development server
npm run start:dev
```

The backend will run on `http://localhost:3001` by default.

### **Backend Health Check**
Verify the backend is running:
```bash
curl http://localhost:3001/ping
# Should return: {"message":"pong","timestamp":"..."}
```

## 📊 Available Scripts

### **Development**
```bash
npx expo start          # Start development server
npx expo start --clear  # Start with cache cleared
npx expo start --offline # Start in offline mode
```

### **Building**
```bash
npx expo build:ios      # Build for iOS
npx expo build:android  # Build for Android
```

### **Linting & Formatting**
```bash
npm run lint            # Check for linting errors
npm run lint:fix        # Auto-fix linting errors
npm run format          # Format code with Prettier
```

### **Testing**
```bash
npm test               # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

## 🔐 Authentication Setup

### **Test Credentials**
For development, you can create test accounts or use these credentials:

```
Email: test.student@tiffinwale.com
Password: TestPassword123!
```

### **Creating Test Users**
Use the backend script to create test users:
```bash
cd ../../monolith_backend
node scripts/create-test-admin.js
```

## 🐛 Troubleshooting

### **Common Issues**

#### **Metro bundler issues**
```bash
npx expo start --clear
# Or
rm -rf node_modules && npm install
```

#### **iOS Simulator not opening**
```bash
sudo xcode-select --install
npx expo install
```

#### **Android emulator issues**
- Ensure Android Studio is properly installed
- Check that ANDROID_HOME environment variable is set
- Restart the emulator

#### **Network connection issues**
```bash
# Use tunnel mode
npx expo start --tunnel

# Or use local IP
npx expo start --lan
```

#### **TypeScript errors**
```bash
# Restart TypeScript service in VS Code
Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

### **Backend Connection Issues**

#### **CORS errors**
Ensure the backend allows your frontend origin in CORS settings.

#### **API not responding**
1. Check if backend is running on port 3001
2. Verify API_BASE_URL in your config
3. Check network connectivity

#### **Authentication errors**
1. Clear app data/storage
2. Check JWT token validity
3. Verify user credentials

## 🔄 Hot Reload & Fast Refresh

The app supports:
- **Hot Reload**: Automatically reloads when files change
- **Fast Refresh**: Preserves component state during updates

If hot reload isn't working:
```bash
# In development server console
r - reload the app
```

## 📦 Adding New Dependencies

### **Install packages**
```bash
# For regular dependencies
npm install package-name

# For development dependencies
npm install --save-dev package-name

# For Expo managed packages
npx expo install package-name
```

### **Important for Expo**
Always use `npx expo install` for packages that need Expo compatibility:
```bash
npx expo install react-native-safe-area-context
npx expo install @react-navigation/native
```

## 🚀 Deployment Preparation

### **Production Build**
```bash
# Create production build
eas build --platform all

# Or platform specific
eas build --platform ios
eas build --platform android
```

### **Environment Variables**
Set production environment variables:
```bash
export API_BASE_URL=https://your-production-api.com
export NODE_ENV=production
```

## 📚 Learning Resources

### **Documentation**
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### **Debugging Tools**
- [Flipper](https://fbflipper.com/) - Mobile app debugger
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Expo Dev Tools](https://docs.expo.dev/workflow/debugging/)

## ✅ Development Checklist

Before starting development, ensure:

- [ ] Node.js v18+ installed
- [ ] Expo CLI installed globally
- [ ] Repository cloned and dependencies installed
- [ ] Backend server running on port 3001
- [ ] Mobile device with Expo Go OR emulator set up
- [ ] VS Code with recommended extensions
- [ ] Network connectivity between frontend and backend
- [ ] Test credentials available

## 🎯 Next Steps

1. **Explore the codebase**: Start with `app/(tabs)/index.tsx` for the home screen
2. **Check the stores**: Look at `store/` directory for state management
3. **Review API integration**: Examine `utils/apiClient.ts`
4. **Read the documentation**: Review other docs in this folder
5. **Start coding**: Begin with small changes and gradually build up

---

**Happy coding! 🚀**

If you encounter any issues, refer to the [Technical Architecture](./Technical_Architecture.md) document or check the [API Integration Guide](./API_Integration_Guide.md) for more detailed information. 