/**
 * Scalable Email Verification Service
 * Supports multiple email verification providers with easy integration
 */

import { config } from '@/config';

// Email verification result interface
export interface EmailVerificationResult {
  isValid: boolean;
  isDeliverable: boolean;
  reason?: string;
  score?: number;
  provider: string;
  details?: {
    syntax: boolean;
    domain: boolean;
    smtp: boolean;
    disposable: boolean;
    role: boolean;
    free: boolean;
    acceptAll: boolean;
  };
}

// Base interface for email verification providers
export interface EmailVerificationProvider {
  name: string;
  verifyEmail(email: string): Promise<EmailVerificationResult>;
}

// Emailable.com provider implementation
class EmailableProvider implements EmailVerificationProvider {
  name = 'Emailable';
  private apiKey: string;
  private baseUrl = 'https://api.emailable.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async verifyEmail(email: string): Promise<EmailVerificationResult> {
    try {
      console.log('🔍 EmailableProvider: Verifying email:', email);
      
      const response = await fetch(
        `${this.baseUrl}/verify?email=${encodeURIComponent(email)}&api_key=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TiffinWale-StudentApp/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Emailable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📧 EmailableProvider: API response:', data);

      // Map Emailable response to our standard format
      return {
        isValid: data.state === 'deliverable',
        isDeliverable: data.state === 'deliverable',
        reason: data.reason || data.state,
        score: data.score,
        provider: this.name,
        details: {
          syntax: data.syntax === 'valid',
          domain: data.domain === 'valid',
          smtp: data.smtp === 'valid',
          disposable: data.disposable === true,
          role: data.role === true,
          free: data.free === true,
          acceptAll: data.accept_all === true,
        },
      };
    } catch (error) {
      console.error('❌ EmailableProvider: Verification failed:', error);
      throw new Error(`Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Future providers can be added here
// class AbstractAPIProvider implements EmailVerificationProvider { ... }
// class ZeroBounceProvider implements EmailVerificationProvider { ... }

// Email verification service class
class EmailVerificationService {
  private providers: Map<string, EmailVerificationProvider> = new Map();
  private defaultProvider: string = 'Emailable';

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize Emailable provider
    const emailableApiKey = config.emailVerification?.emailableApiKey;
    if (emailableApiKey) {
      this.providers.set('Emailable', new EmailableProvider(emailableApiKey));
      console.log('✅ EmailVerificationService: Emailable provider initialized');
    } else {
      console.warn('⚠️ EmailVerificationService: Emailable API key not found');
    }

    // Future providers can be initialized here
    // if (abstractApiKey) {
    //   this.providers.set('AbstractAPI', new AbstractAPIProvider(abstractApiKey));
    // }
  }

  /**
   * Verify an email address using the default provider
   */
  async verifyEmail(email: string): Promise<EmailVerificationResult> {
    return this.verifyEmailWithProvider(email, this.defaultProvider);
  }

  /**
   * Verify an email address using a specific provider
   */
  async verifyEmailWithProvider(email: string, providerName: string): Promise<EmailVerificationResult> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Email verification provider '${providerName}' not found or not configured`);
    }

    // Basic email format validation before API call
    if (!this.isValidEmailFormat(email)) {
      return {
        isValid: false,
        isDeliverable: false,
        reason: 'Invalid email format',
        provider: providerName,
        details: {
          syntax: false,
          domain: false,
          smtp: false,
          disposable: false,
          role: false,
          free: false,
          acceptAll: false,
        },
      };
    }

    return provider.verifyEmail(email);
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Set the default provider
   */
  setDefaultProvider(providerName: string): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`Provider '${providerName}' not found`);
    }
    this.defaultProvider = providerName;
  }

  /**
   * Basic email format validation
   */
  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Check if service is configured and ready
   */
  isConfigured(): boolean {
    return this.providers.size > 0;
  }

  /**
   * Get service status
   */
  getStatus(): { configured: boolean; providers: string[]; defaultProvider: string } {
    return {
      configured: this.isConfigured(),
      providers: this.getAvailableProviders(),
      defaultProvider: this.defaultProvider,
    };
  }
}

// Export singleton instance
export const emailVerificationService = new EmailVerificationService();
export default emailVerificationService;
