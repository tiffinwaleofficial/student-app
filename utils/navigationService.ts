import AsyncStorage from '@react-native-async-storage/async-storage';

const NAVIGATION_HISTORY_KEY = 'navigationHistory';
const MAX_HISTORY_SIZE = 10;

export interface NavigationHistoryItem {
  route: string;
  timestamp: number;
  params?: any;
}

class NavigationService {
  private history: NavigationHistoryItem[] = [];
  private initialized = false;

  /**
   * Initialize navigation service by loading history from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storedHistory = await AsyncStorage.getItem(NAVIGATION_HISTORY_KEY);
      if (storedHistory) {
        this.history = JSON.parse(storedHistory);
      }
      this.initialized = true;
      console.log('🧭 NavigationService: Initialized with history:', this.history);
    } catch (error) {
      console.error('❌ NavigationService: Failed to initialize:', error);
      this.history = [];
      this.initialized = true;
    }
  }

  /**
   * Add a route to navigation history
   */
  async addToHistory(route: string, params?: any): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const historyItem: NavigationHistoryItem = {
      route,
      timestamp: Date.now(),
      params,
    };

    // Remove any existing entry for this route to avoid duplicates
    this.history = this.history.filter(item => item.route !== route);

    // Add to beginning of history
    this.history.unshift(historyItem);

    // Keep only the last MAX_HISTORY_SIZE items
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history = this.history.slice(0, MAX_HISTORY_SIZE);
    }

    // Save to storage
    try {
      await AsyncStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(this.history));
      console.log('🧭 NavigationService: Added to history:', route, 'Total items:', this.history.length);
    } catch (error) {
      console.error('❌ NavigationService: Failed to save history:', error);
    }
  }

  /**
   * Get the previous route from history
   */
  getPreviousRoute(): NavigationHistoryItem | null {
    if (!this.initialized || this.history.length < 2) {
      return null;
    }

    // Return the second item (first is current route)
    return this.history[1];
  }

  /**
   * Get the current route from history
   */
  getCurrentRoute(): NavigationHistoryItem | null {
    if (!this.initialized || this.history.length === 0) {
      return null;
    }

    return this.history[0];
  }

  /**
   * Get full navigation history
   */
  getHistory(): NavigationHistoryItem[] {
    return [...this.history];
  }

  /**
   * Clear navigation history
   */
  async clearHistory(): Promise<void> {
    this.history = [];
    try {
      await AsyncStorage.removeItem(NAVIGATION_HISTORY_KEY);
      console.log('🧭 NavigationService: History cleared');
    } catch (error) {
      console.error('❌ NavigationService: Failed to clear history:', error);
    }
  }

  /**
   * Get the best fallback route based on history
   */
  getFallbackRoute(): string {
    const previous = this.getPreviousRoute();
    
    // If we have a previous route and it's a tab route, use it
    if (previous && this.isTabRoute(previous.route)) {
      return previous.route;
    }

    // Check if any route in history is a tab route
    const lastTabRoute = this.history.find(item => this.isTabRoute(item.route));
    if (lastTabRoute) {
      return lastTabRoute.route;
    }

    // Default fallback to dashboard
    return '/(tabs)';
  }

  /**
   * Check if a route is a tab route
   */
  private isTabRoute(route: string): boolean {
    const tabRoutes = [
      '/(tabs)',
      '/(tabs)/index',
      '/(tabs)/orders',
      '/(tabs)/track',
      '/(tabs)/plans',
      '/(tabs)/profile',
    ];
    
    return tabRoutes.includes(route) || route.startsWith('/(tabs)/');
  }

  /**
   * Check if we should show tabs for a given route
   */
  shouldShowTabs(route: string): boolean {
    // Show tabs for all tab routes
    if (this.isTabRoute(route)) {
      return true;
    }

    // Don't show tabs for onboarding, auth, or modal screens
    const noTabRoutes = [
      '/(onboarding)/',
      '/(auth)/',
      '/modal/',
      '/my-profile',
      '/account-information',
      '/delivery-addresses',
      '/payment-methods',
      '/change-password',
      '/help-support',
      '/terms-conditions',
      '/privacy-policy',
      '/subscription-checkout',
      '/checkout',
      '/checkout-success',
      '/subscription-details',
      '/active-subscription-plan',
    ];

    return !noTabRoutes.some(noTabRoute => route.includes(noTabRoute));
  }

  /**
   * Get smart back navigation route
   */
  getSmartBackRoute(): string {
    const previous = this.getPreviousRoute();
    
    // If previous route exists and is not the same as current, use it
    if (previous && previous.route !== this.getCurrentRoute()?.route) {
      return previous.route;
    }

    // Otherwise use fallback logic
    return this.getFallbackRoute();
  }
}

export const navigationService = new NavigationService();
export default navigationService;
