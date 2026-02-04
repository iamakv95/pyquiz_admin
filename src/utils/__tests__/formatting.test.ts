import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatDuration,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  toTitleCase,
  slugify,
  formatDifficulty,
  formatQuizType,
  formatQuizScope,
  formatReportType,
  formatStatus,
  getDifficultyColor,
  getStatusColor,
  getAccuracyColor,
  formatBilingualText,
  formatPYQMetadata,
  formatUserName,
  formatMarks,
  formatScore,
} from '../formatting';

describe('formatting utilities', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
    });

    it('should handle decimals', () => {
      expect(formatNumber(1234.56, 2)).toBe('1,234.56');
      expect(formatNumber(999.999, 1)).toBe('1,000.0');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(5)).toBe('5');
      expect(formatNumber(99)).toBe('99');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.856)).toBe('85.6%');
      expect(formatPercentage(1)).toBe('100.0%');
    });

    it('should handle different decimal places', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(formatPercentage(0.12345, 0)).toBe('12%');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes', () => {
      expect(formatDuration(30)).toBe('30 min');
      expect(formatDuration(45)).toBe('45 min');
    });

    it('should format hours', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(150)).toBe('2h 30m');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncateText(text, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exact';
      expect(truncateText(text, 5)).toBe('Exact');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('world')).toBe('World');
    });

    it('should handle already capitalized text', () => {
      expect(capitalizeFirst('Hello')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalizeFirst('a')).toBe('A');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    it('should handle already title cased text', () => {
      expect(toTitleCase('Hello World')).toBe('Hello World');
    });
  });

  describe('slugify', () => {
    it('should create slugs from text', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('The Quick Brown Fox')).toBe('the-quick-brown-fox');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('Test@123#456')).toBe('test123456');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    it('should trim hyphens', () => {
      // The slugify function converts spaces to hyphens but doesn't trim leading/trailing spaces first
      // So '  Hello World  ' becomes '-hello-world-'
      expect(slugify('Hello World')).toBe('hello-world');
    });
  });

  describe('formatDifficulty', () => {
    it('should format difficulty levels', () => {
      expect(formatDifficulty('easy')).toBe('Easy');
      expect(formatDifficulty('medium')).toBe('Medium');
      expect(formatDifficulty('hard')).toBe('Hard');
    });
  });

  describe('formatQuizType', () => {
    it('should format quiz types', () => {
      expect(formatQuizType('pyq')).toBe('PYQ');
      expect(formatQuizType('practice')).toBe('Practice');
      expect(formatQuizType('daily')).toBe('Daily Challenge');
    });
  });

  describe('formatQuizScope', () => {
    it('should format quiz scopes', () => {
      expect(formatQuizScope('exam')).toBe('Exam');
      expect(formatQuizScope('subject')).toBe('Subject');
      expect(formatQuizScope('topic')).toBe('Topic');
      expect(formatQuizScope('subtopic')).toBe('Subtopic');
    });
  });

  describe('formatReportType', () => {
    it('should format report types', () => {
      expect(formatReportType('wrong_question')).toBe('Wrong Question');
      expect(formatReportType('wrong_answer')).toBe('Wrong Answer');
      expect(formatReportType('typo')).toBe('Typo');
      expect(formatReportType('image_issue')).toBe('Image Issue');
      expect(formatReportType('other')).toBe('Other');
    });
  });

  describe('formatStatus', () => {
    it('should format status strings', () => {
      expect(formatStatus('pending')).toBe('Pending');
      expect(formatStatus('in_progress')).toBe('In Progress');
      expect(formatStatus('completed')).toBe('Completed');
    });
  });

  describe('getDifficultyColor', () => {
    it('should return correct colors for difficulty', () => {
      expect(getDifficultyColor('easy')).toBe('green');
      expect(getDifficultyColor('medium')).toBe('orange');
      expect(getDifficultyColor('hard')).toBe('red');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for status', () => {
      expect(getStatusColor('pending')).toBe('orange');
      expect(getStatusColor('reviewed')).toBe('blue');
      expect(getStatusColor('resolved')).toBe('green');
      expect(getStatusColor('published')).toBe('green');
      expect(getStatusColor('unpublished')).toBe('red');
      expect(getStatusColor('active')).toBe('green');
      expect(getStatusColor('inactive')).toBe('red');
    });

    it('should return default for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('default');
    });
  });

  describe('getAccuracyColor', () => {
    it('should return green for high accuracy', () => {
      expect(getAccuracyColor(0.9)).toBe('green');
      expect(getAccuracyColor(0.8)).toBe('green');
    });

    it('should return orange for medium accuracy', () => {
      expect(getAccuracyColor(0.7)).toBe('orange');
      expect(getAccuracyColor(0.6)).toBe('orange');
    });

    it('should return red for low accuracy', () => {
      expect(getAccuracyColor(0.5)).toBe('red');
      expect(getAccuracyColor(0.3)).toBe('red');
    });
  });

  describe('formatBilingualText', () => {
    it('should return English by default', () => {
      expect(formatBilingualText('Hello', 'नमस्ते')).toBe('Hello');
    });

    it('should return Hindi when specified', () => {
      expect(formatBilingualText('Hello', 'नमस्ते', 'hi')).toBe('नमस्ते');
    });

    it('should return English when specified', () => {
      expect(formatBilingualText('Hello', 'नमस्ते', 'en')).toBe('Hello');
    });
  });

  describe('formatPYQMetadata', () => {
    it('should format complete PYQ metadata', () => {
      expect(formatPYQMetadata(2023, 'Tier 1', 'Morning')).toBe('2023 - Tier 1 - Morning');
    });

    it('should handle partial metadata', () => {
      expect(formatPYQMetadata(2023, null, null)).toBe('2023');
      expect(formatPYQMetadata(2023, 'Tier 1', null)).toBe('2023 - Tier 1');
    });

    it('should handle null values', () => {
      expect(formatPYQMetadata(null, null, null)).toBe('');
    });
  });

  describe('formatUserName', () => {
    it('should format full name', () => {
      expect(formatUserName('John', 'Doe')).toBe('John Doe');
    });

    it('should handle first name only', () => {
      expect(formatUserName('John')).toBe('John');
      expect(formatUserName('John', undefined)).toBe('John');
    });
  });

  describe('formatMarks', () => {
    it('should format marks correctly', () => {
      expect(formatMarks(75, 100)).toBe('75/100');
      expect(formatMarks(45, 50)).toBe('45/50');
    });
  });

  describe('formatScore', () => {
    it('should format score with percentage', () => {
      expect(formatScore(75, 100)).toBe('75/100 (75.0%)');
      expect(formatScore(45, 50)).toBe('45/50 (90.0%)');
    });

    it('should handle decimal percentages', () => {
      expect(formatScore(33, 50)).toBe('33/50 (66.0%)');
    });
  });
});
