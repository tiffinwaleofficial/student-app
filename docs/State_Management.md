# TiffinWale Student App - State Management Guide

## 🗃️ Zustand State Management

The TiffinWale Student App uses **Zustand** for state management, providing a simple, type-safe, and performant solution for managing application state.

## 🏗️ Store Architecture

### **Why Zustand?**
- **Lightweight**: Minimal boilerplate compared to Redux
- **Type-safe**: Full TypeScript support
- **Simple**: Easy to understand and implement
- **Performant**: Optimized re-rendering
- **Flexible**: Can be used with or without React context

## 📊 Store Structure Overview

```
store/
├── authStore.ts         # Authentication & user session
├── mealStore.ts         # Meal data & operations
├── restaurantStore.ts   # Partner/restaurant data
├── subscriptionStore.ts # Subscription management
├── notificationStore.ts # Real-time notifications
└── feedbackStore.ts     # User feedback & support
```

---

## 🔐 Auth Store (`authStore.ts`)

### **Purpose**
Manages user authentication, JWT tokens, and user session data.

### **State Structure**
```typescript
interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  
  // Loading states
  isLoading: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

### **Key Features**
- **Automatic token refresh** on API 401 errors
- **Secure token storage** using Expo SecureStore
- **User session persistence** across app restarts
- **Error handling** for authentication failures

### **Usage Example**
```typescript
import { useAuthStore } from '@/store/authStore';

function LoginScreen() {
  const { 
    login, 
    isLoginLoading, 
    error, 
    clearError 
  } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({ email, password });
      // Navigate to app after successful login
    } catch (err) {
      // Error is automatically set in store
    }
  };

  return (
    // UI components
  );
}
```

---

## 🍽️ Meal Store (`mealStore.ts`)

### **Purpose**
Manages meal data, today's meals, meal history, ratings, and skip functionality.

### **State Structure**
```typescript
interface MealState {
  // Meal data
  todaysMeals: Meal[];
  mealHistory: Meal[];
  upcomingMeals: Meal[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchTodaysMeals: () => Promise<void>;
  fetchMealHistory: (page?: number) => Promise<void>;
  fetchUpcomingMeals: () => Promise<void>;
  rateMeal: (mealId: string, rating: number, comment?: string) => Promise<void>;
  skipMeal: (mealId: string, reason: string) => Promise<void>;
  refreshMeals: () => Promise<void>;
  clearError: () => void;
}
```

### **Key Features**
- **Real-time meal data** from backend API
- **Pagination support** for meal history
- **Rating system** with comments
- **Skip functionality** with reason tracking
- **Pull-to-refresh** support
- **Optimistic updates** for better UX

### **Usage Example**
```typescript
import { useMealStore } from '@/store/mealStore';

function HomeScreen() {
  const { 
    todaysMeals, 
    isLoading, 
    fetchTodaysMeals,
    rateMeal 
  } = useMealStore();

  useEffect(() => {
    fetchTodaysMeals();
  }, []);

  const handleRating = async (mealId: string, rating: number) => {
    await rateMeal(mealId, rating, "Great meal!");
  };

  return (
    // UI components
  );
}
```

---

## 🏪 Restaurant Store (`restaurantStore.ts`)

### **Purpose**
Manages partner/restaurant data, search functionality, and menu information.

### **State Structure**
```typescript
interface RestaurantState {
  // Restaurant data
  restaurants: Partner[];
  selectedRestaurant: Partner | null;
  featuredRestaurants: Partner[];
  nearbyRestaurants: Partner[];
  
  // Search & filters
  searchQuery: string;
  filteredRestaurants: Partner[];
  categories: string[];
  selectedCategory: string | null;
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchRestaurants: () => Promise<void>;
  fetchRestaurantDetails: (id: string) => Promise<void>;
  searchRestaurants: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  fetchNearbyRestaurants: (lat: number, lng: number) => Promise<void>;
  clearError: () => void;
}
```

### **Key Features**
- **Live restaurant data** from partners API
- **Local search functionality** with query filtering
- **Category-based filtering**
- **Featured restaurant highlighting**
- **Nearby restaurant discovery** with geolocation
- **Restaurant details** with menu information

### **Usage Example**
```typescript
import { useRestaurantStore } from '@/store/restaurantStore';

function RestaurantListScreen() {
  const { 
    restaurants, 
    searchQuery,
    searchRestaurants,
    fetchRestaurants 
  } = useRestaurantStore();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <View>
      <TextInput
        value={searchQuery}
        onChangeText={searchRestaurants}
        placeholder="Search restaurants..."
      />
      {/* Restaurant list */}
    </View>
  );
}
```

---

## 📅 Subscription Store (`subscriptionStore.ts`)

### **Purpose**
Manages subscription plans, user subscriptions, and subscription operations.

### **State Structure**
```typescript
interface SubscriptionState {
  // Subscription data
  plans: SubscriptionPlan[];
  userSubscriptions: UserSubscription[];
  activeSubscription: UserSubscription | null;
  
  // Loading states
  isLoading: boolean;
  isCreatingSubscription: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchPlans: () => Promise<void>;
  fetchUserSubscriptions: () => Promise<void>;
  createSubscription: (planId: string) => Promise<void>;
  pauseSubscription: (subscriptionId: string, reason: string) => Promise<void>;
  resumeSubscription: (subscriptionId: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string, reason: string) => Promise<void>;
  clearError: () => void;
}
```

### **Key Features**
- **Live subscription plans** from backend
- **User subscription management**
- **Pause/resume functionality** with reason tracking
- **Subscription cancellation** with feedback
- **Active subscription highlighting**
- **Plan comparison** with features

### **Usage Example**
```typescript
import { useSubscriptionStore } from '@/store/subscriptionStore';

function PlansScreen() {
  const { 
    plans, 
    activeSubscription,
    createSubscription,
    isCreatingSubscription 
  } = useSubscriptionStore();

  const handleSelectPlan = async (planId: string) => {
    await createSubscription(planId);
  };

  return (
    // Plan selection UI
  );
}
```

---

## 🔔 Notification Store (`notificationStore.ts`)

### **Purpose**
Manages real-time notifications, unread counts, and Server-Sent Events (SSE).

### **State Structure**
```typescript
interface NotificationState {
  // Notification data
  notifications: Notification[];
  unreadCount: number;
  
  // Real-time connection
  eventSource: EventSource | null;
  isConnected: boolean;
  
  // Loading states
  isLoading: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  connectSSE: () => void;
  disconnectSSE: () => void;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
}
```

### **Key Features**
- **Real-time notifications** via Server-Sent Events
- **Unread count tracking** with automatic updates
- **Mark as read** functionality
- **Connection management** with auto-reconnection
- **Order status updates** in real-time
- **System announcements** delivery

### **Usage Example**
```typescript
import { useNotificationStore } from '@/store/notificationStore';

function NotificationBell() {
  const { 
    unreadCount, 
    connectSSE, 
    disconnectSSE 
  } = useNotificationStore();

  useEffect(() => {
    connectSSE();
    return () => disconnectSSE();
  }, []);

  return (
    <TouchableOpacity>
      <BellIcon />
      {unreadCount > 0 && (
        <Badge>{unreadCount}</Badge>
      )}
    </TouchableOpacity>
  );
}
```

---

## 💬 Feedback Store (`feedbackStore.ts`)

### **Purpose**
Manages user feedback, support requests, and help system integration.

### **State Structure**
```typescript
interface FeedbackState {
  // Feedback data
  userFeedback: Feedback[];
  
  // Loading states
  isSubmitting: boolean;
  isLoading: boolean;
  
  // Success states
  isSuccess: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  submitFeedback: (feedback: FeedbackData) => Promise<void>;
  fetchUserFeedback: () => Promise<void>;
  clearStatus: () => void;
}
```

### **Key Features**
- **Feedback submission** to backend API
- **Support request handling**
- **Success/error state management**
- **User feedback history**
- **Category-based feedback** routing

### **Usage Example**
```typescript
import { useFeedbackStore } from '@/store/feedbackStore';

function HelpScreen() {
  const { 
    submitFeedback, 
    isSubmitting, 
    isSuccess, 
    error 
  } = useFeedbackStore();

  const handleSubmit = async (feedbackData) => {
    await submitFeedback(feedbackData);
    if (isSuccess) {
      showSuccessMessage("Feedback submitted successfully!");
    }
  };

  return (
    // Feedback form UI
  );
}
```

---

## 🔄 Store Interaction Patterns

### **Cross-Store Communication**
Stores can interact with each other when needed:

```typescript
// In mealStore.ts
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';

const rateMeal = async (mealId: string, rating: number) => {
  const { user } = useAuthStore.getState();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Submit rating via API
  await api.meals.rateMeal(mealId, { rating, userId: user.id });
  
  // Add success notification
  useNotificationStore.getState().addNotification({
    type: 'success',
    message: 'Meal rated successfully!',
  });
  
  // Update local state
  set((state) => ({
    ...state,
    todaysMeals: state.todaysMeals.map(meal => 
      meal.id === mealId 
        ? { ...meal, userRating: rating }
        : meal
    ),
  }));
};
```

### **Optimistic Updates**
Implement optimistic updates for better UX:

```typescript
const rateMeal = async (mealId: string, rating: number) => {
  // Optimistic update
  set((state) => ({
    ...state,
    todaysMeals: state.todaysMeals.map(meal => 
      meal.id === mealId 
        ? { ...meal, userRating: rating }
        : meal
    ),
  }));

  try {
    // API call
    await api.meals.rateMeal(mealId, { rating });
  } catch (error) {
    // Revert on error
    set((state) => ({
      ...state,
      todaysMeals: state.todaysMeals.map(meal => 
        meal.id === mealId 
          ? { ...meal, userRating: null }
          : meal
      ),
      error: 'Failed to rate meal',
    }));
  }
};
```

## 🛠️ Store Utilities

### **Common Patterns**
All stores follow consistent patterns for:

#### **Loading States**
```typescript
const fetchData = async () => {
  set({ isLoading: true, error: null });
  
  try {
    const data = await api.someEndpoint();
    set({ data, isLoading: false });
  } catch (error) {
    set({ 
      error: error.message, 
      isLoading: false 
    });
  }
};
```

#### **Error Handling**
```typescript
const clearError = () => set({ error: null });

const handleError = (error: unknown) => {
  const message = error instanceof Error 
    ? error.message 
    : 'An unexpected error occurred';
  
  set({ error: message });
};
```

#### **Refresh Functionality**
```typescript
const refresh = async () => {
  set({ isRefreshing: true });
  await fetchData();
  set({ isRefreshing: false });
};
```

## 📱 Integration with Components

### **Using Stores in Components**
```typescript
import { useMealStore } from '@/store/mealStore';

function MyComponent() {
  // Select only needed state
  const todaysMeals = useMealStore((state) => state.todaysMeals);
  const isLoading = useMealStore((state) => state.isLoading);
  const fetchMeals = useMealStore((state) => state.fetchTodaysMeals);

  // Or select multiple at once
  const { todaysMeals, isLoading, fetchTodaysMeals } = useMealStore(
    (state) => ({
      todaysMeals: state.todaysMeals,
      isLoading: state.isLoading,
      fetchTodaysMeals: state.fetchTodaysMeals,
    })
  );

  useEffect(() => {
    fetchTodaysMeals();
  }, [fetchTodaysMeals]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={todaysMeals}
      renderItem={({ item }) => <MealCard meal={item} />}
    />
  );
}
```

### **Performance Optimization**
```typescript
// Use selectors to prevent unnecessary re-renders
const todaysMealCount = useMealStore(
  (state) => state.todaysMeals.length
);

// Memoize expensive computations
const expensiveComputation = useMealStore(
  useCallback(
    (state) => state.todaysMeals.filter(meal => meal.isAvailable),
    []
  )
);
```

## 🔍 Debugging Stores

### **DevTools Integration**
```typescript
import { devtools } from 'zustand/middleware';

const useMealStore = create<MealState>()(
  devtools(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'meal-store', // Name in Redux DevTools
    }
  )
);
```

### **Logging Middleware**
```typescript
const logger = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous state:', get());
      set(...args);
      console.log('New state:', get());
    },
    get,
    api
  );

const useMealStore = create(logger(mealStoreImplementation));
```

## ✅ Best Practices

### **Do's**
- ✅ **Keep stores focused**: One store per domain/feature
- ✅ **Use TypeScript**: Full type safety for all state
- ✅ **Handle errors**: Comprehensive error states
- ✅ **Loading states**: Show loading indicators
- ✅ **Optimistic updates**: Better user experience
- ✅ **Clear errors**: Reset error states appropriately

### **Don'ts**
- ❌ **Don't mutate state directly**: Always use `set()`
- ❌ **Don't put everything in one store**: Keep them focused
- ❌ **Don't ignore errors**: Always handle error cases
- ❌ **Don't forget loading states**: Users need feedback
- ❌ **Don't over-select**: Only select what you need

---

This state management architecture provides a solid foundation for the TiffinWale Student App, ensuring maintainable, performant, and type-safe state management across all features. 