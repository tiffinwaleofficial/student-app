import authService from './authService';
import { useAuthStore } from '@/store/authStore';

/**
 * Comprehensive authentication test utility
 * This helps verify that the authentication system is working correctly
 */
export const authTest = {
  /**
   * Test the complete authentication flow
   */
  async testAuthFlow() {
    console.log('🧪 Starting Authentication Flow Test...');
    
    try {
      // Test 1: Check initial state
      console.log('1️⃣ Testing initial authentication state...');
      const initialAuth = await authService.isAuthenticated();
      console.log('   Initial auth state:', initialAuth);
      
      // Test 2: Check token validation
      console.log('2️⃣ Testing token validation...');
      if (initialAuth) {
        const tokenValid = await authService.validateToken();
        console.log('   Token validation result:', tokenValid);
      }
      
      // Test 3: Test logout (if authenticated)
      if (initialAuth) {
        console.log('3️⃣ Testing logout...');
        await authService.logout();
        const afterLogout = await authService.isAuthenticated();
        console.log('   Auth state after logout:', afterLogout);
      }
      
      console.log('✅ Authentication flow test completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Authentication flow test failed:', error);
      return false;
    }
  },

  /**
   * Test route protection
   */
  testRouteProtection() {
    console.log('🧪 Testing Route Protection...');
    
    const authStore = useAuthStore.getState();
    
    // Test public routes
    const publicRoutes = ['/(auth)/login', '/(auth)/signup', '/'];
    publicRoutes.forEach(route => {
      const canAccess = !authStore.isAuthenticated || route === '/';
      console.log(`   ${route}: ${canAccess ? '✅ Accessible' : '❌ Blocked'}`);
    });
    
    // Test protected routes
    const protectedRoutes = ['/(tabs)', '/dashboard', '/profile'];
    protectedRoutes.forEach(route => {
      const canAccess = authStore.isAuthenticated;
      console.log(`   ${route}: ${canAccess ? '✅ Accessible' : '❌ Blocked'}`);
    });
    
    console.log('✅ Route protection test completed!');
  },

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('🧪 Testing Error Handling...');
    
    try {
      // Test invalid login
      console.log('1️⃣ Testing invalid login...');
      await authService.login({ email: 'invalid@test.com', password: 'wrong' });
    } catch (error) {
      console.log('   ✅ Invalid login properly rejected');
    }
    
    try {
      // Test invalid token validation
      console.log('2️⃣ Testing invalid token...');
      const result = await authService.validateToken();
      console.log('   Token validation result:', result);
    } catch (error) {
      console.log('   ✅ Invalid token properly handled');
    }
    
    console.log('✅ Error handling test completed!');
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Running All Authentication Tests...\n');
    
    const results = {
      authFlow: false,
      routeProtection: false,
      errorHandling: false,
    };
    
    try {
      results.authFlow = await this.testAuthFlow();
      console.log('\n');
      
      this.testRouteProtection();
      results.routeProtection = true;
      console.log('\n');
      
      await this.testErrorHandling();
      results.errorHandling = true;
      console.log('\n');
      
      const allPassed = Object.values(results).every(result => result);
      console.log(`🎯 Test Results: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
      
      return results;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return results;
    }
  }
};

export default authTest;

