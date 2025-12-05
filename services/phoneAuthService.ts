import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signInWithCredential,
  RecaptchaVerifier,
  ConfirmationResult,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { Platform } from 'react-native';

export interface PhoneAuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface OTPVerificationResult {
  success: boolean;
  user?: User;
  error?: string;
}

class PhoneAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;
  
  // Test phone numbers for development
  private testPhoneNumbers = [
    '+919131114837', // Test number
    '+911234567890', // Another test number
  ];

  /**
   * Initialize reCAPTCHA verifier for web platform
   */
  private initializeRecaptcha(): void {
    if (Platform.OS === 'web' && !this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
    }
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Always treat input as 10-digit Indian mobile number and add +91 prefix
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // If user somehow entered with country code, use as is
      return `+${cleaned}`;
    } else {
      throw new Error('Invalid phone number format');
    }
  }

  /**
   * Validate Indian phone number
   */
  private validateIndianPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid 10-digit Indian number or 12-digit with country code
    if (cleaned.length === 10) {
      // Valid Indian mobile number starts with 6, 7, 8, or 9
      return /^[6-9]\d{9}$/.test(cleaned);
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      const number = cleaned.substring(2);
      return /^[6-9]\d{9}$/.test(number);
    }
    
    return false;
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<PhoneAuthResult> {
    try {
      console.log('Original phone number:', phoneNumber);
      
      // Validate phone number
      if (!this.validateIndianPhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'Please enter a valid Indian mobile number'
        };
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log('Formatted phone number for Firebase:', formattedNumber);
      
      // DEVELOPMENT BYPASS: Skip Firebase for test numbers
      if (this.testPhoneNumbers.includes(formattedNumber)) {
        console.log('🧪 Development mode: Bypassing Firebase for test number');
        
        // Create a mock confirmation result for development
        this.confirmationResult = {
          verificationId: 'dev-verification-id',
          confirm: async (code: string) => {
            if (code === '123456') {
              // Return a mock user for development
              return {
                user: {
                  uid: 'dev-user-' + Date.now(),
                  phoneNumber: formattedNumber,
                  displayName: null,
                  email: null,
                  photoURL: null,
                  providerId: 'phone',
                  // Add other required User properties
                } as any
              };
            } else {
              throw new Error('Invalid verification code');
            }
          }
        } as any;

        return {
          success: true
        };
      }
      
      // For production numbers, use Firebase
      // Initialize reCAPTCHA for web
      if (Platform.OS === 'web') {
        this.initializeRecaptcha();
        if (!this.recaptchaVerifier) {
          throw new Error('reCAPTCHA verifier not initialized');
        }
        this.confirmationResult = await signInWithPhoneNumber(
          auth, 
          formattedNumber, 
          this.recaptchaVerifier
        );
      } else {
        // For React Native with real numbers, this requires Firebase Console setup
        throw new Error('For production use, please add this number as a test number in Firebase Console or upgrade to Blaze plan');
      }

      console.log('OTP sent successfully, confirmation result:', this.confirmationResult);

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(otpCode: string): Promise<OTPVerificationResult> {
    try {
      if (!this.confirmationResult) {
        return {
          success: false,
          error: 'No verification in progress. Please request OTP first.'
        };
      }

      // Verify the code
      const result = await this.confirmationResult.confirm(otpCode);
      
      return {
        success: true,
        user: result.user
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(phoneNumber: string): Promise<PhoneAuthResult> {
    // Clear previous confirmation result
    this.confirmationResult = null;
    
    // Send new OTP
    return this.sendOTP(phoneNumber);
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await auth.signOut();
      this.confirmationResult = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Get user phone number
   */
  getUserPhoneNumber(): string | null {
    const user = auth.currentUser;
    return user?.phoneNumber || null;
  }
}

export default new PhoneAuthService();
