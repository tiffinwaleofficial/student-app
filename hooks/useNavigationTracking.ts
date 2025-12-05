import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import navigationService from '@/utils/navigationService';

/**
 * Hook to automatically track navigation history
 */
export function useNavigationTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize navigation service
    navigationService.initialize();
  }, []);

  useEffect(() => {
    if (pathname) {
      // Add current route to history
      navigationService.addToHistory(pathname);
    }
  }, [pathname]);

  return {
    currentRoute: pathname,
    getPreviousRoute: () => navigationService.getPreviousRoute(),
    getFallbackRoute: () => navigationService.getFallbackRoute(),
    getSmartBackRoute: () => navigationService.getSmartBackRoute(),
    shouldShowTabs: (route?: string) => navigationService.shouldShowTabs(route || pathname),
  };
}
