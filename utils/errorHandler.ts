/**
 * Error handling utilities for the application
 */

import { AxiosError } from 'axios';
import i18n from '@/i18n/config';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Convert various error types to user-friendly messages
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Handle Axios errors
    if ('response' in error && error.response) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data as any;

      switch (status) {
        case 400:
          if (data?.message) {
            return data.message;
          }
          if (data?.errors && Array.isArray(data.errors)) {
            return data.errors.map((err: any) => err.message || err).join(', ');
          }
          return i18n.t('errors:invalidRequest');

        case 401:
          return i18n.t('errors:authenticationFailed');

        case 403:
          return i18n.t('errors:noPermission');

        case 404:
          return i18n.t('errors:resourceNotFound');

        case 409:
          return data?.message || i18n.t('errors:conflictOccurred');

        case 422:
          if (data?.errors && Array.isArray(data.errors)) {
            return data.errors.map((err: any) => err.message || err).join(', ');
          }
          return data?.message || i18n.t('errors:validationFailed');

        case 429:
          return i18n.t('errors:tooManyRequests');

        case 500:
          return i18n.t('errors:serverError');

        case 503:
          return i18n.t('errors:serviceUnavailable');

        default:
          return data?.message || i18n.t('errors:unexpectedError');
      }
    }

    // Handle network errors
    if ('code' in error) {
      const networkError = error as any;
      switch (networkError.code) {
        case 'NETWORK_ERROR':
          return i18n.t('errors:networkError');
        case 'TIMEOUT_ERROR':
          return i18n.t('errors:timeoutError');
        case 'ECONNREFUSED':
          return i18n.t('errors:connectionRefused');
        case 'ENOTFOUND':
          return i18n.t('errors:serverNotFound');
        default:
          return error.message;
      }
    }

    // Handle Axios network errors without response
    if (error.message && error.message.toLowerCase().includes('network error')) {
      return i18n.t('errors:networkError');
    }

    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return i18n.t('errors:unexpectedError');
};

/**
 * Convert API validation errors to field-specific messages
 */
export const getValidationErrors = (error: unknown): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data as any;

    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err: any) => {
        if (err.field && err.errors) {
          errors[err.field] = Array.isArray(err.errors) ? err.errors.join(', ') : err.errors;
        }
      });
    }
  }

  return errors;
};

/**
 * Check if an error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    if ('code' in error) {
      const networkError = error as any;
      return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'ECONNREFUSED', 'ENOTFOUND'].includes(networkError.code);
    }
    
    if ('response' in error) {
      return false; // Has response, so not a network error
    }
    
    // Check for common network error messages
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('connection') || 
           message.includes('timeout') ||
           message.includes('fetch');
  }
  
  return false;
};

/**
 * Check if an error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: unknown, context?: string): string => {
  const contextStr = context ? `[${context}] ` : '';
  
  if (error instanceof Error) {
    if ('response' in error) {
      const axiosError = error as AxiosError;
      return `${contextStr}HTTP ${axiosError.response?.status}: ${getErrorMessage(error)}`;
    }
    return `${contextStr}${error.name}: ${error.message}`;
  }
  
  return `${contextStr}Unknown error: ${String(error)}`;
};

/**
 * Common error messages for specific scenarios
 */
export const ErrorMessages = {
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  LOGIN_FAILED: 'Invalid email or password. Please try again.',
  REGISTRATION_FAILED: 'Registration failed. Please check your information and try again.',
  PASSWORD_REQUIREMENTS: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&).',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This resource already exists.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;
