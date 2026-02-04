import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  getPasswordStrength,
  isValidUrl,
  isRequired,
  isValidNumber,
  isPositiveNumber,
  isInRange,
  isValidYear,
  isValidFileSize,
  isValidFileType,
  isValidBilingualContent,
  validateQuestion,
  validateQuiz,
  validateCSVHeaders,
  sanitizeHtml,
  trimObjectStrings,
} from '../validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.in')).toBe(true);
      expect(isValidEmail('admin+tag@company.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate passwords with at least 8 characters', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('12345678')).toBe(true);
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(isValidPassword('pass')).toBe(false);
      expect(isValidPassword('1234567')).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    it('should return weak for short passwords', () => {
      expect(getPasswordStrength('pass')).toBe('weak');
      expect(getPasswordStrength('1234567')).toBe('weak');
    });

    it('should return weak for simple passwords', () => {
      expect(getPasswordStrength('password')).toBe('weak');
      expect(getPasswordStrength('12345678')).toBe('weak');
    });

    it('should return medium for moderately complex passwords', () => {
      expect(getPasswordStrength('Password1')).toBe('medium');
      expect(getPasswordStrength('pass123ABC')).toBe('medium');
    });

    it('should return strong for complex passwords', () => {
      expect(getPasswordStrength('Pass123!')).toBe('strong');
      expect(getPasswordStrength('MyP@ssw0rd')).toBe('strong');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('should return true for valid values', () => {
      expect(isRequired('text')).toBe(true);
      expect(isRequired(123)).toBe(true);
      expect(isRequired([1, 2, 3])).toBe(true);
      expect(isRequired(true)).toBe(true);
    });

    it('should return false for empty values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
      expect(isRequired([])).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('should validate numbers', () => {
      expect(isValidNumber(123)).toBe(true);
      expect(isValidNumber('456')).toBe(true);
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(-10)).toBe(true);
    });

    it('should reject non-numbers', () => {
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(100)).toBe(true);
      expect(isPositiveNumber('50')).toBe(true);
    });

    it('should reject zero and negative numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-5)).toBe(false);
      expect(isPositiveNumber('-10')).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should validate numbers within range', () => {
      expect(isInRange(5, 0, 10)).toBe(true);
      expect(isInRange(0, 0, 10)).toBe(true);
      expect(isInRange(10, 0, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      expect(isInRange(-1, 0, 10)).toBe(false);
      expect(isInRange(11, 0, 10)).toBe(false);
    });
  });

  describe('isValidYear', () => {
    it('should validate reasonable years', () => {
      expect(isValidYear(2023)).toBe(true);
      expect(isValidYear(2000)).toBe(true);
      expect(isValidYear(1950)).toBe(true);
    });

    it('should reject invalid years', () => {
      expect(isValidYear(1800)).toBe(false);
      expect(isValidYear(2100)).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should validate file size', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(isValidFileSize(file, 1000)).toBe(true);
    });

    it('should reject oversized files', () => {
      const file = new File(['a'.repeat(1000)], 'test.txt', { type: 'text/plain' });
      expect(isValidFileSize(file, 100)).toBe(false);
    });
  });

  describe('isValidFileType', () => {
    it('should validate allowed file types', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      expect(isValidFileType(file, ['image/jpeg', 'image/png'])).toBe(true);
    });

    it('should reject disallowed file types', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      expect(isValidFileType(file, ['image/jpeg', 'image/png'])).toBe(false);
    });
  });

  describe('isValidBilingualContent', () => {
    it('should validate when both languages have content', () => {
      expect(isValidBilingualContent('English text', 'हिंदी पाठ')).toBe(true);
    });

    it('should reject when either language is missing', () => {
      expect(isValidBilingualContent('', 'हिंदी पाठ')).toBe(false);
      expect(isValidBilingualContent('English text', '')).toBe(false);
      expect(isValidBilingualContent('', '')).toBe(false);
    });
  });

  describe('validateQuestion', () => {
    const validQuestion = {
      question_text: 'What is 2+2?',
      question_text_hi: '2+2 क्या है?',
      options: [
        { text: '3', text_hi: '३' },
        { text: '4', text_hi: '४' },
        { text: '5', text_hi: '५' },
        { text: '6', text_hi: '६' },
      ],
      correct_option: 1,
      explanation: 'The answer is 4',
      explanation_hi: 'उत्तर 4 है',
      topic_id: 'topic-123',
      difficulty: 'easy' as const,
    };

    it('should validate a correct question', () => {
      const result = validateQuestion(validQuestion);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject question without English text', () => {
      const result = validateQuestion({ ...validQuestion, question_text: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text (English) is required');
    });

    it('should reject question without Hindi text', () => {
      const result = validateQuestion({ ...validQuestion, question_text_hi: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text (Hindi) is required');
    });

    it('should reject question without exactly 4 options', () => {
      const result = validateQuestion({
        ...validQuestion,
        options: [
          { text: '3', text_hi: '३' },
          { text: '4', text_hi: '४' },
        ],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Exactly 4 options are required');
    });

    it('should reject question with invalid correct option', () => {
      const result = validateQuestion({ ...validQuestion, correct_option: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct option must be between 0 and 3');
    });

    it('should reject question without topic', () => {
      const result = validateQuestion({ ...validQuestion, topic_id: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Topic is required');
    });

    it('should reject question with invalid difficulty', () => {
      const result = validateQuestion({ ...validQuestion, difficulty: 'invalid' as any });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid difficulty level is required');
    });
  });

  describe('validateQuiz', () => {
    const validQuiz = {
      title: 'Math Quiz',
      title_hi: 'गणित प्रश्नोत्तरी',
      type: 'practice' as const,
      scope: 'topic' as const,
      scope_id: 'topic-123',
      duration_minutes: 30,
      total_marks: 100,
    };

    it('should validate a correct quiz', () => {
      const result = validateQuiz(validQuiz);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject quiz without title', () => {
      const result = validateQuiz({ ...validQuiz, title: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Quiz title (English) is required');
    });

    it('should reject quiz with invalid type', () => {
      const result = validateQuiz({ ...validQuiz, type: 'invalid' as any });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid quiz type is required');
    });

    it('should reject quiz with invalid scope', () => {
      const result = validateQuiz({ ...validQuiz, scope: 'invalid' as any });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid quiz scope is required');
    });

    it('should reject quiz without duration', () => {
      const result = validateQuiz({ ...validQuiz, duration_minutes: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duration must be a positive number');
    });

    it('should reject quiz without total marks', () => {
      const result = validateQuiz({ ...validQuiz, total_marks: -10 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total marks must be a positive number');
    });
  });

  describe('validateCSVHeaders', () => {
    it('should validate when all required headers are present', () => {
      const headers = ['name', 'email', 'age', 'city'];
      const required = ['name', 'email'];
      expect(validateCSVHeaders(headers, required)).toBe(true);
    });

    it('should reject when required headers are missing', () => {
      const headers = ['name', 'age'];
      const required = ['name', 'email'];
      expect(validateCSVHeaders(headers, required)).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML tags', () => {
      const result = sanitizeHtml('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should handle plain text', () => {
      const result = sanitizeHtml('Plain text');
      expect(result).toBe('Plain text');
    });
  });

  describe('trimObjectStrings', () => {
    it('should trim all string values', () => {
      const obj = {
        name: '  John  ',
        email: 'john@example.com  ',
        age: 25,
      };
      const result = trimObjectStrings(obj);
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
      expect(result.age).toBe(25);
    });

    it('should not modify non-string values', () => {
      const obj = {
        count: 10,
        active: true,
        data: null,
      };
      const result = trimObjectStrings(obj);
      expect(result).toEqual(obj);
    });
  });
});
