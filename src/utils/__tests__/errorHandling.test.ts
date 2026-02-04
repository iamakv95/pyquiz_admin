import { describe, it, expect, vi } from 'vitest';
import {
  createAppError,
  parseSupabaseError,
  parseAPIError,
  handleAsync,
  retryWithBackoff,
  isNetworkError,
  isAuthError,
  getErrorStatusCode,
  formatValidationErrors,
  safeJSONParse,
} from '../errorHandling';
import { ERROR_MESSAGES } from '../constants';

describe('errorHandling utilities', () => {
  describe('createAppError', () => {
    it('should create an error with message', () => {
      const error = createAppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AppError');
    });

    it('should include optional properties', () => {
      const error: any = createAppError('Test error', {
        code: 'TEST_ERROR',
        statusCode: 400,
        details: { field: 'value' },
      });
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'value' });
    });
  });

  describe('parseSupabaseError', () => {
    it('should parse duplicate key error', () => {
      const error: any = {
        code: '23505',
        message: 'duplicate key value',
      };
      const result = parseSupabaseError(error);
      expect(result).toContain('already exists');
    });

    it('should parse foreign key constraint error', () => {
      const error: any = {
        code: '23503',
        message: 'foreign key constraint',
      };
      const result = parseSupabaseError(error);
      expect(result).toContain('referenced by other records');
    });

    it('should parse not null constraint error', () => {
      const error: any = {
        code: '23502',
        message: 'not null constraint',
      };
      const result = parseSupabaseError(error);
      expect(result).toContain('Required field is missing');
    });

    it('should parse unauthorized error', () => {
      const error: any = {
        code: '42501',
        message: 'permission denied',
      };
      const result = parseSupabaseError(error);
      expect(result).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    it('should parse not found error', () => {
      const error: any = {
        code: 'PGRST116',
        message: 'not found',
      };
      const result = parseSupabaseError(error);
      expect(result).toBe(ERROR_MESSAGES.NOT_FOUND);
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');
      const result = parseSupabaseError(error);
      expect(result).toBe('Generic error');
    });
  });

  describe('parseAPIError', () => {
    it('should parse 400 error', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      };
      const result = parseAPIError(error);
      expect(result).toBe('Bad request');
    });

    it('should parse 401 error', () => {
      const error = {
        response: {
          status: 401,
        },
      };
      const result = parseAPIError(error);
      expect(result).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    it('should parse 404 error', () => {
      const error = {
        response: {
          status: 404,
        },
      };
      const result = parseAPIError(error);
      expect(result).toBe(ERROR_MESSAGES.NOT_FOUND);
    });

    it('should parse 500 error', () => {
      const error = {
        response: {
          status: 500,
        },
      };
      const result = parseAPIError(error);
      expect(result).toBe(ERROR_MESSAGES.SERVER_ERROR);
    });

    it('should handle network errors', () => {
      const error = {
        request: {},
      };
      const result = parseAPIError(error);
      expect(result).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('should handle unknown errors', () => {
      const error = {
        message: 'Unknown error',
      };
      const result = parseAPIError(error);
      expect(result).toBe('Unknown error');
    });
  });

  describe('handleAsync', () => {
    it('should return data on success', async () => {
      const promise = Promise.resolve('success');
      const [data, error] = await handleAsync(promise);
      expect(data).toBe('success');
      expect(error).toBeNull();
    });

    it('should return error on failure', async () => {
      const promise = Promise.reject(new Error('failure'));
      const [data, error] = await handleAsync(promise);
      expect(data).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('failure');
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(fn, {
        maxRetries: 2,
        initialDelay: 10,
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      
      await expect(
        retryWithBackoff(fn, {
          maxRetries: 2,
          initialDelay: 10,
        })
      ).rejects.toThrow('fail');
      
      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      expect(isNetworkError(new Error('network error'))).toBe(true);
      expect(isNetworkError(new Error('fetch failed'))).toBe(true);
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
    });

    it('should not detect non-network errors', () => {
      expect(isNetworkError(new Error('validation error'))).toBe(false);
      expect(isNetworkError(new Error('not found'))).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should detect auth errors', () => {
      expect(isAuthError(new Error('auth failed'))).toBe(true);
      expect(isAuthError(new Error('unauthorized'))).toBe(true);
      expect(isAuthError(new Error('401 error'))).toBe(true);
    });

    it('should not detect non-auth errors', () => {
      expect(isAuthError(new Error('validation error'))).toBe(false);
      expect(isAuthError(new Error('not found'))).toBe(false);
    });
  });

  describe('getErrorStatusCode', () => {
    it('should get status code from response', () => {
      const error = {
        response: { status: 404 },
      };
      expect(getErrorStatusCode(error)).toBe(404);
    });

    it('should get status code from error object', () => {
      const error = {
        statusCode: 500,
      };
      expect(getErrorStatusCode(error)).toBe(500);
    });

    it('should return null if no status code', () => {
      const error = {};
      expect(getErrorStatusCode(error)).toBeNull();
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation errors', () => {
      const errors = {
        email: ['Email is required', 'Email is invalid'],
        password: ['Password is too short'],
      };
      const result = formatValidationErrors(errors);
      expect(result).toContain('email: Email is required, Email is invalid');
      expect(result).toContain('password: Password is too short');
    });

    it('should handle empty errors', () => {
      const result = formatValidationErrors({});
      expect(result).toBe('');
    });
  });

  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSONParse('{"key":"value"}', {});
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJSONParse('invalid json', fallback);
      expect(result).toEqual(fallback);
    });

    it('should handle arrays', () => {
      const result = safeJSONParse('[1,2,3]', []);
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
