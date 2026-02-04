import type { PostgrestError } from '@supabase/supabase-js';
import { ERROR_MESSAGES } from './constants';

/**
 * Create an application error
 */
export function createAppError(
  message: string,
  options: {
    code?: string;
    statusCode?: number;
    details?: any;
  } = {}
): Error {
  const error = new Error(message);
  error.name = 'AppError';
  (error as any).code = options.code;
  (error as any).statusCode = options.statusCode;
  (error as any).details = options.details;
  return error;
}

/**
 * Parse Supabase error and return user-friendly message
 */
export function parseSupabaseError(error: PostgrestError | Error): string {
  if ('code' in error && error.code) {
    // Supabase PostgrestError
    const postgrestError = error as PostgrestError;

    switch (postgrestError.code) {
      case '23505':
        return 'This record already exists. Please use a different value.';
      case '23503':
        return 'Cannot delete this record because it is referenced by other records.';
      case '23502':
        return 'Required field is missing.';
      case '42501':
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 'PGRST116':
        return ERROR_MESSAGES.NOT_FOUND;
      default:
        return postgrestError.message || ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  // Generic error
  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Parse API error response
 */
export function parseAPIError(error: any): string {
  if (error.response) {
    // HTTP error response
    const status = error.response.status;

    switch (status) {
      case 400:
        return error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  if (error.request) {
    // Network error
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Other errors
  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Handle async errors with try-catch wrapper
 */
export async function handleAsync<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as Error];
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
    }
  }

  throw lastError!;
}

/**
 * Log error to console (can be extended to send to error tracking service)
 */
export function logError(error: Error, context?: Record<string, any>): void {
  console.error('Error:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * Create error handler for React Query mutations
 */
export function createMutationErrorHandler(
  onError?: (error: Error) => void
) {
  return (error: unknown) => {
    const errorMessage = error instanceof Error
      ? parseSupabaseError(error)
      : ERROR_MESSAGES.UNKNOWN_ERROR;

    logError(error as Error);

    if (onError) {
      onError(new Error(errorMessage));
    }

    return errorMessage;
  };
}

/**
 * Validate and throw error if condition is not met
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw createAppError(message);
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('Network request failed')
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: Error): boolean {
  return (
    error.message.includes('auth') ||
    error.message.includes('unauthorized') ||
    error.message.includes('401')
  );
}

/**
 * Get error status code from error object
 */
export function getErrorStatusCode(error: any): number | null {
  if (error.response?.status) {
    return error.response.status;
  }

  if (error.statusCode) {
    return error.statusCode;
  }

  return null;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n');
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    logError(error as Error, { json });
    return fallback;
  }
}

/**
 * Wrap function with error boundary
 */
export function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  onError?: (error: Error) => void
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result.catch((error) => {
          logError(error);
          if (onError) onError(error);
          throw error;
        });
      }

      return result;
    } catch (error) {
      logError(error as Error);
      if (onError) onError(error as Error);
      throw error;
    }
  }) as T;
}
