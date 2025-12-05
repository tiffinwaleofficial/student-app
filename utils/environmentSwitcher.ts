/**
 * Environment Switcher Utility
 * Helps developers easily switch between local and production backends
 */

import { config } from '@/config';

export const environmentSwitcher = {
  /**
   * Get current environment info
   */
  getCurrentEnvironment() {
    return {
      environment: config.environment,
      apiBaseUrl: config.api.baseUrl,
      isDevelopment: config.environment === 'development',
      isProduction: config.environment === 'production',
    };
  },

  /**
   * Log current environment configuration
   */
  logEnvironmentInfo() {
    const info = this.getCurrentEnvironment();
    console.log('🔧 Environment Switcher Info:');
    console.log('  Environment:', info.environment);
    console.log('  API Base URL:', info.apiBaseUrl);
    console.log('  Is Development:', info.isDevelopment);
    console.log('  Is Production:', info.isProduction);
    
    if (info.isDevelopment) {
      console.log('💡 To switch to production: Set EXPO_PUBLIC_APP_ENV=production in .env');
    } else {
      console.log('💡 To switch to development: Set EXPO_PUBLIC_APP_ENV=development in .env');
    }
  },

  /**
   * Test API connectivity
   */
  async testApiConnectivity() {
    const info = this.getCurrentEnvironment();
    console.log(`🔍 Testing API connectivity to: ${info.apiBaseUrl}`);
    
    try {
      const response = await fetch(`${info.apiBaseUrl}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connectivity test successful:', data);
        return { success: true, data };
      } else {
        console.log('❌ API connectivity test failed:', response.status, response.statusText);
        return { success: false, error: `${response.status} ${response.statusText}` };
      }
    } catch (error) {
      console.log('❌ API connectivity test error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// Auto-log environment info in development
if (__DEV__) {
  environmentSwitcher.logEnvironmentInfo();
}

export default environmentSwitcher;
