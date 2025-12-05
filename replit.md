# TiffinWale Mobile Application

## Overview

TiffinWale is a cross-platform mobile application built with React Native and Expo Router for food delivery and subscription-based meal services targeting bachelors. The app provides meal ordering, subscription management, real-time notifications, chat support, and multi-language support (English/Hindi). It supports iOS, Android, and Web platforms with a focus on web deployment via Vercel.

**Core Purpose:** Enable customers to subscribe to meal plans, track daily meals, manage delivery addresses, make payments, and communicate with support/restaurants through real-time chat.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing:**
- **Expo SDK 54** with React Native and TypeScript
- **Expo Router** for file-based navigation with typed routes
- **Metro bundler** for all platforms (iOS, Android, Web)
- Code splitting and lazy loading optimizations for web builds

**Design Rationale:** Expo Router provides a Next.js-like developer experience with automatic route generation and deep linking support. Metro bundler ensures consistent build behavior across platforms.

**UI/UX Layer:**
- **NativeWind/TailwindCSS** for styling (implied by custom font configurations)
- **Lucide React Native** icons for consistent iconography
- **React Native Reanimated** for smooth animations
- **Custom theme system** with light/dark mode support via ThemeContext
- **Poppins font family** (400, 500, 600, 700 weights) loaded via expo-font

**Design Rationale:** Component-based architecture with reusable UI primitives (buttons, modals, forms) ensures consistency. The theme system allows for brand customization and accessibility.

### State Management

**Primary Store Pattern:**
- **Zustand** stores for global state (auth, subscriptions, meals, orders, chat, notifications, etc.)
- Individual stores for domain separation: `authStore`, `subscriptionStore`, `mealStore`, `orderStore`, `customerStore`, `chatStore`, `marketingStore`, `feedbackStore`, `notificationStore`, `notificationPreferencesStore`

**Design Rationale:** Zustand provides a lightweight, TypeScript-friendly state management solution without boilerplate. Domain-separated stores prevent coupling and improve maintainability.

**Local State:**
- React hooks (`useState`, `useEffect`) for component-level state
- Custom hooks for cross-cutting concerns (`useAuth`, `useNotification`, `usePayment`, `useTheme`, `useTranslation`, `useNavigationTracking`)

### Authentication & Authorization

**Authentication Flow:**
- **Firebase Phone Authentication** (OTP-based) for login/registration
- **JWT tokens** (access + refresh) stored in `SecureStore` (mobile) or `AsyncStorage` (web)
- `AuthProvider` context with centralized auth state
- `SecureTokenManager` handles token storage, retrieval, and lifecycle
- `AuthInterceptor` attaches tokens to API requests and handles token refresh on 401 responses

**Route Protection:**
- `AuthMiddleware` component wraps protected routes
- `ProtectedRoute` and `GuestRoute` helpers for declarative route protection
- Automatic redirects based on authentication state

**Design Rationale:** Firebase Auth provides reliable phone verification. JWT tokens enable stateless API authentication. Secure storage prevents token theft. The interceptor pattern centralizes auth logic and prevents code duplication.

### API Integration

**HTTP Client:**
- **Axios** instance with custom configuration
- Base URL: `https://api.tiffin-wale.com/api` (configured in `apiClient` and Vercel proxy)
- Request/response interceptors for auth tokens and error handling
- Service layer abstraction (`api.auth`, `api.subscriptionPlans`, etc.)

**Design Rationale:** Axios provides a rich feature set (interceptors, request cancellation). Service layer pattern separates API logic from components.

**API Endpoints (Inferred):**
- Auth: login, register, phone verification, token refresh, password management
- Subscriptions: plans, user subscriptions, create/cancel subscription
- Meals: today's meals, upcoming meals, meal history
- Orders: create, list, update, reviews
- Customer: profile, addresses (CRUD), preferences
- Payments: Razorpay integration
- Chat: conversations, messages (real-time via WebSocket)
- Notifications: preferences, FCM token registration
- Marketing: promotions, offers

### Real-time Features

**WebSocket Service:**
- `nativeWebSocketService` for real-time updates (orders, chat, notifications)
- Reconnection logic and event-based message handling

**Chat System:**
- Real-time messaging with support and restaurant partners
- Media upload support (images, documents via Cloudinary)
- Typing indicators and online status
- Message persistence via backend API

**Notifications:**
- **Firebase Cloud Messaging (FCM)** for push notifications
- `firebaseNotificationService` handles FCM token management and message display
- `realtimeNotificationService` coordinates real-time notification delivery
- Toast, Modal, and Banner notification types
- Notification preferences (categories: orders, delivery, subscriptions, promotions, chat, system)
- User-configurable notification channels and quiet hours

**Design Rationale:** WebSockets enable real-time collaboration. FCM provides reliable cross-platform push notifications. Layered notification system (service → provider → UI) ensures flexibility.

### Internationalization (i18n)

**Implementation:**
- **react-i18next** for translation management
- Language files organized by namespace (`common`, `auth`, `profile`, `orders`, `subscription`, `support`)
- Supported languages: English (`en`), Hindi (`hi`)
- `LanguageService` utility for language switching and persistence
- `useTranslation` hook for component-level translations

**Design Rationale:** i18next provides industry-standard i18n with React integration. Namespace separation prevents bundle bloat. Persistent language preference improves UX.

### Navigation & Routing

**Architecture:**
- File-based routing via Expo Router
- Tab-based navigation for main app sections
- Stack navigation for nested screens
- Deep linking support with scheme `tiffinwale://`
- `useNavigationTracking` hook for smart back navigation and analytics

**Route Structure (Inferred):**
```
/(onboarding)/welcome → Guest route
/(auth)/login, /register, /forgot-password → Guest routes
/(tabs)/ → Protected routes
  - Home/Dashboard
  - Orders
  - Profile
  - Chat (implied)
/checkout, /subscription-checkout → Payment flows
/delivery-addresses, /account-information, /notification-preferences → Settings
/help-support, /faq, /policy/* → Support & legal
```

**Design Rationale:** File-based routing reduces configuration. Tab navigation provides familiar mobile UX. Protected route middleware centralizes auth checks.

### Data Persistence

**Local Storage:**
- **SecureStore** (iOS/Android) for sensitive data (tokens, user credentials)
- **AsyncStorage** (Web fallback) for non-sensitive data and web platform
- Custom `SecureTokenManager` abstracts platform differences

**Design Rationale:** SecureStore provides hardware-backed encryption on mobile. AsyncStorage ensures web compatibility. The manager pattern provides a consistent API.

### Payment Integration

**Payment Provider:**
- **Razorpay** integration for payments
- `usePayment` hook encapsulates payment flow
- Support for order payments, subscription payments, and wallet top-ups
- UPI, card, and wallet payment methods

**Payment Flow:**
1. User initiates payment (order/subscription)
2. Frontend calls backend to create Razorpay order
3. Razorpay SDK handles payment UI
4. Payment verification on backend
5. Order/subscription status updated

**Design Rationale:** Razorpay is a leading payment gateway in India. Backend verification prevents payment fraud. The hook pattern simplifies component integration.

### Error Handling & Monitoring

**Error Boundaries:**
- `ErrorBoundary` component wraps app sections
- Graceful fallback UI on crashes
- Error reporting to console (production: could integrate Sentry)

**API Error Handling:**
- Centralized error handling in API client
- User-friendly error messages via notification system
- Retry logic for failed requests (WebSocket, HTTP)

**Design Rationale:** Error boundaries prevent full app crashes. Centralized handling ensures consistent UX.

### Image & Media Management

**Upload Service:**
- `imageUploadService` for profile images, chat media
- `profileImageService` specialized for user avatars
- Cloudinary integration (implied by environment variables)

**Design Rationale:** Cloudinary provides optimized image delivery and transformations. Separate services for different upload types enable specific validation and processing.

### Testing Strategy

**Framework:**
- **Jest** for unit and integration tests
- Test files organized in `testing/` directory: `unit/`, `integration/`, `e2e/`
- Custom test configuration in `testing/config/jest.config.js`

**Coverage Areas (Inferred):**
- API services
- Authentication flows
- State management (Zustand stores)
- Custom hooks
- UI components

**Design Rationale:** Jest provides comprehensive testing utilities. Organized test structure improves maintainability.

### Build & Deployment

**Web Deployment:**
- **Vercel** as primary hosting platform
- Static export via `expo export --platform web`
- Custom build script for production (`build:web:prod`)
- Vercel configuration handles SPA routing and API proxying
- Security headers (CSP, XSS protection, frame options)

**Mobile Deployment:**
- **EAS Build** for iOS and Android
- Development, preview, and production build profiles
- EAS Submit for app store deployment

**Design Rationale:** Vercel provides edge deployment and automatic SSL. EAS Build simplifies native builds. Static export ensures fast load times.

**Build Optimizations:**
- Tree shaking and dead code elimination
- Code splitting for lazy loading
- Minification with source maps
- Asset caching via Cache-Control headers

### Accessibility & UX

**Features:**
- Keyboard navigation support (`KeyboardAvoidingWrapper`)
- Safe area handling for notched devices
- Loading states and skeleton screens
- Error states with retry actions
- Offline support (implied by WebSocket reconnection)

**Design Rationale:** Accessibility improves usability for all users. Loading and error states reduce user frustration.

## External Dependencies

### Third-Party Services

**Firebase:**
- **Firebase Authentication** for phone OTP
- **Firebase Cloud Messaging (FCM)** for push notifications
- Configuration via `app.json` and `app.config.ts`

**Razorpay:**
- Payment processing for orders and subscriptions
- Razorpay SDK integration

**Cloudinary:**
- Image and media upload/storage
- Environment variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET`

**Vercel:**
- Web hosting and deployment
- Analytics and Speed Insights (web only)
- API proxying to `https://api.tiffin-wale.com`

**Google Fonts:**
- Poppins font family loaded via CDN and local assets

### Backend API

**Base URL:** `https://api.tiffin-wale.com/api`

**Assumed Endpoints:**
- `/auth/*` - Authentication and user management
- `/subscriptions/*` - Subscription plans and user subscriptions
- `/meals/*` - Meal data and scheduling
- `/orders/*` - Order management
- `/customers/*` - Customer profile and preferences
- `/payments/*` - Payment processing
- `/chat/*` - Chat conversations and messages
- `/notifications/*` - Notification preferences and FCM tokens
- `/marketing/*` - Promotions and offers

**Database:** Not explicitly defined in frontend code, but backend likely uses PostgreSQL or MongoDB (Drizzle ORM mentioned in instructions suggests potential PostgreSQL usage).

### Key NPM Packages

**Core:**
- `expo` ~54.0.0
- `expo-router` - File-based navigation
- `react-native` - Cross-platform UI
- `typescript` - Type safety

**UI & Styling:**
- `expo-linear-gradient` - Gradient backgrounds
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Touch gestures
- `react-native-safe-area-context` - Safe area handling
- `lucide-react-native` - Icons

**State & Data:**
- `zustand` (implied) - State management
- `axios` - HTTP client
- `react-i18next` - Internationalization

**Auth & Security:**
- `expo-secure-store` - Secure storage (mobile)
- `@react-native-async-storage/async-storage` - Storage (web)
- `firebase` - Authentication and FCM

**Media & Files:**
- `expo-image-picker` - Image selection
- `expo-document-picker` - Document selection
- Cloudinary integration (custom service)

**Payments:**
- Razorpay SDK (custom integration)

**Development:**
- `jest` - Testing framework
- `@typescript-eslint/*` - TypeScript linting
- `@vercel/analytics`, `@vercel/speed-insights` - Web analytics (web only)

### Environment Variables

**Required:**
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset

**Inferred (likely in .env but not shown):**
- Firebase configuration (API keys, project ID)
- Razorpay API keys
- Backend API URL (hardcoded as `https://api.tiffin-wale.com`)

**Design Rationale:** Environment variables keep secrets out of source code. Cloudinary requires authentication for uploads.

### Platform-Specific Configurations

**Android:**
- Package: `com.tiffinwale_official.tiffinwalemobile`
- Network security config for cleartext traffic (development)
- Adaptive icon with orange background

**iOS:**
- Tablet support enabled
- Universal links support (implied by scheme)

**Web:**
- PWA configuration with app manifest
- Theme color: `#FF9B42`
- Background color: `#FFFAF0`
- Favicon and app icons
- Custom fonts injected via build script