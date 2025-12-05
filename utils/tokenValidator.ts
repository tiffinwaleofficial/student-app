import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  needsRefresh: boolean;
  error?: string;
}

/**
 * Comprehensive token validation utility
 */
export class TokenValidator {
  private static instance: TokenValidator;
  private validationCache: Map<string, { result: TokenValidationResult; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  static getInstance(): TokenValidator {
    if (!TokenValidator.instance) {
      TokenValidator.instance = new TokenValidator();
    }
    return TokenValidator.instance;
  }

  /**
   * Validate token with caching to prevent excessive API calls
   */
  async validateToken(url?: string): Promise<TokenValidationResult> {
    const cacheKey = url || 'global';
    const cached = this.validationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('🔍 TokenValidator: Using cached validation result');
      return cached.result;
    }

    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        const result = { isValid: false, isExpired: true, needsRefresh: false, error: 'No token found' };
        this.validationCache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
      }

      // Basic format validation
      if (token.length < 10 || !token.includes('.')) {
        const result = { isValid: false, isExpired: true, needsRefresh: false, error: 'Invalid token format' };
        this.validationCache.set(cacheKey, { result, timestamp: Date.now() });
        await this.clearInvalidTokens();
        return result;
      }

      // JWT expiration check
      const isExpired = await this.isTokenExpired(token);
      if (isExpired) {
        const result = { isValid: false, isExpired: true, needsRefresh: true, error: 'Token expired' };
        this.validationCache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
      }

      // Token is valid
      const result = { isValid: true, isExpired: false, needsRefresh: false };
      this.validationCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;

    } catch (error) {
      console.error('❌ TokenValidator: Validation error:', error);
      const result = { 
        isValid: false, 
        isExpired: true, 
        needsRefresh: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      this.validationCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }
  }

  /**
   * Check if JWT token is expired
   */
  private async isTokenExpired(token: string): Promise<boolean> {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('🔍 TokenValidator: Token expired');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ TokenValidator: Error decoding token:', error);
      return true; // If we can't decode, assume expired
    }
  }

  /**
   * Clear invalid tokens from storage
   */
  private async clearInvalidTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      console.log('🧹 TokenValidator: Cleared invalid tokens');
    } catch (error) {
      console.error('❌ TokenValidator: Error clearing tokens:', error);
    }
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
    console.log('🧹 TokenValidator: Cleared validation cache');
  }

  /**
   * Get token info without validation
   */
  async getTokenInfo(): Promise<{ exists: boolean; length: number; format: string }> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return {
        exists: !!token,
        length: token?.length || 0,
        format: token?.includes('.') ? 'JWT' : 'Unknown'
      };
    } catch (error) {
      console.error('❌ TokenValidator: Error getting token info:', error);
      return { exists: false, length: 0, format: 'Error' };
    }
  }
}

// Export singleton instance
export const tokenValidator = TokenValidator.getInstance();
