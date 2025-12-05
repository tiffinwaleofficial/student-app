# TiffinWale Student App - Architecture & Patterns

## 🏗️ Core Architecture Patterns

### 1. **Modular Monorepo Pattern**
```
interface/student-app/          # Frontend (React Native)
├── app/                        # Expo Router pages
├── components/                 # Reusable UI components
├── store/                      # Zustand state stores
├── utils/                      # Utility functions
├── types/                      # TypeScript definitions
└── hooks/                      # Custom React hooks
```

### 2. **State Management Pattern (Zustand)**
Each feature has its own dedicated store following a consistent pattern:

```typescript
interface StoreState {
  // Data
  data: DataType[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  updateData: (id: string, data: Partial<DataType>) => Promise<void>;
  clearError: () => void;
}
```

**Store Dependencies:**
- `AuthStore` → All other stores (authentication required)
- `MealStore` → `ApiClient` (meal data)
- `OrderStore` → `ApiClient` (order management)
- `SubscriptionStore` → `ApiClient` (subscription management)
- `NotificationStore` → `ApiClient` + SSE (real-time updates)

### 3. **API Client Pattern**
Centralized API client with automatic authentication and error handling:

```typescript
// utils/apiClient.ts
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - Auto-add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Auto-refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await authService.refreshAccessToken();
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

### 4. **Authentication Pattern**
JWT-based authentication with automatic token refresh:

```typescript
// Authentication Flow
1. Login → Backend → JWT access/refresh tokens
2. Storage → Expo SecureStore (secure)
3. API Calls → Access token auto-added to headers
4. Refresh → Automatic on 401 errors
5. Logout → Tokens cleared from storage
```

### 5. **Route Guard Pattern**
Protection for different route types:

```typescript
// Route Protection Levels
<RouteGuard requireAuth={true}>          // Protected routes
<RouteGuard requireAuth={false}>          // Public routes
<RouteGuard permissions={['customer']}>  // Role-based access
```

### 6. **Component Architecture Pattern**
Hierarchical component structure:

```
App Root
├── Layout Components (Navigation, Headers)
├── Page Components (Screens)
├── Feature Components (MealCard, OrderCard)
└── UI Components (Buttons, Inputs, Modals)
```

## 🔄 Data Flow Architecture

### **Unidirectional Data Flow**
```
User Action → Store Action → API Call → Store Update → UI Re-render
```

### **Real-time Updates Flow**
```
Backend Event → SSE → NotificationStore → UI Update
```

## 🎨 Design Patterns

### 1. **Component Composition Pattern**
```typescript
// Reusable components with composition
<MealCard>
  <MealHeader />
  <MealContent />
  <MealFooter />
</MealCard>
```

### 2. **Custom Hook Pattern**
```typescript
// Feature-specific hooks
export const useAuth = () => {
  const authStore = useAuthStore();
  // Enhanced auth logic
  return { ...authStore, enhancedMethods };
};
```

### 3. **Error Boundary Pattern**
```typescript
// Graceful error handling
try {
  await apiCall();
} catch (error) {
  store.setError(error.message);
  // Show user-friendly error message
}
```

## 🔧 Utility Patterns

### 1. **Environment Configuration Pattern**
```typescript
// config/environment.ts
const getApiBaseUrl = (): string => {
  const envApiUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (envApiUrl) return envApiUrl;
  throw new Error('API_BASE_URL must be configured');
};
```

### 2. **Type Safety Pattern**
```typescript
// Comprehensive type definitions
export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // ... all properties typed
}
```

### 3. **Validation Pattern**
```typescript
// Input validation utilities
export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password);
};
```

## 🚀 Performance Patterns

### 1. **Lazy Loading Pattern**
```typescript
// Code splitting for large components
const LazyComponent = React.lazy(() => import('./HeavyComponent'));
```

### 2. **Memoization Pattern**
```typescript
// Optimize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

### 3. **Caching Pattern**
```typescript
// Store-level caching
const fetchData = async () => {
  if (cachedData && !isStale) return cachedData;
  const freshData = await api.getData();
  setCachedData(freshData);
  return freshData;
};
```

## 🔐 Security Patterns

### 1. **Token Management Pattern**
```typescript
// Secure token storage and refresh
const tokenManager = {
  store: (token) => SecureStore.setItemAsync('auth_token', token),
  get: () => SecureStore.getItemAsync('auth_token'),
  clear: () => SecureStore.deleteItemAsync('auth_token')
};
```

### 2. **Input Sanitization Pattern**
```typescript
// Sanitize all user inputs
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

## 📱 Navigation Patterns

### 1. **File-based Routing Pattern**
```
app/
├── (auth)/           # Auth flow: /login, /signup
├── (tabs)/           # Tab navigation: /, /orders, /plans
├── restaurant/[id]   # Dynamic route: /restaurant/123
└── modal/           # Modal presentations
```

### 2. **Conditional Navigation Pattern**
```typescript
// Route based on authentication state
{isAuthenticated ? (
  <Redirect href="/(tabs)" />
) : (
  <Redirect href="/(auth)/login" />
)}
```

## 🔄 Real-time Patterns

### 1. **Server-Sent Events Pattern**
```typescript
// Real-time updates
const eventSource = new EventSource(`${API_BASE_URL}/notifications/stream`);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  notificationStore.addNotification(data);
};
```

### 2. **Connection Management Pattern**
```typescript
// Auto-reconnection on connection loss
eventSource.onerror = () => {
  setTimeout(() => {
    notificationStore.reconnectSSE();
  }, 5000);
};
```

## 🧪 Testing Patterns

### 1. **Mock Pattern**
```typescript
// API mocking for tests
jest.mock('@/utils/apiClient', () => ({
  auth: { login: jest.fn() },
  meals: { getToday: jest.fn() }
}));
```

### 2. **Test Utilities Pattern**
```typescript
// Reusable test utilities
export const renderWithProviders = (component) => {
  return render(
    <AuthProvider>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </AuthProvider>
  );
};
```

## 📊 Monitoring Patterns

### 1. **Error Tracking Pattern**
```typescript
// Centralized error handling
const handleError = (error: Error, context: string) => {
  console.error(`[${context}]`, error);
  // Send to error tracking service
  errorTracker.captureException(error, { context });
};
```

### 2. **Performance Monitoring Pattern**
```typescript
// Track performance metrics
const trackPerformance = (action: string, duration: number) => {
  analytics.track('performance', { action, duration });
};
```

---

## 🎯 Pattern Benefits

1. **Maintainability**: Clear separation of concerns
2. **Scalability**: Modular architecture supports growth
3. **Testability**: Isolated components and stores
4. **Performance**: Optimized rendering and data flow
5. **Security**: Comprehensive authentication and validation
6. **Developer Experience**: Type safety and clear patterns

## 🔮 Future Pattern Considerations

1. **Micro-frontend**: Split into smaller, deployable units
2. **GraphQL**: More efficient data fetching
3. **Offline-first**: Local data synchronization
4. **Progressive Enhancement**: Graceful degradation
5. **A/B Testing**: Feature flag patterns

---

**Last Updated**: December 2024  
**Version**: 1.0.0

