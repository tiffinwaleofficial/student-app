/**
 * Test utility for email verification service
 * This can be used for debugging and testing the email verification functionality
 */

import emailVerificationService from '@/services/emailVerificationService';

export const testEmailVerification = async (email: string) => {
  console.log('🧪 Testing email verification for:', email);
  
  try {
    // Check if service is configured
    const status = emailVerificationService.getStatus();
    console.log('📊 Service status:', status);
    
    if (!status.configured) {
      console.error('❌ Email verification service is not configured');
      return;
    }
    
    // Test email verification
    const result = await emailVerificationService.verifyEmail(email);
    console.log('✅ Verification result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Example usage (for development/debugging):
// testEmailVerification('test@example.com');
// testEmailVerification('tiffinwaleofficial@gmail.com');
