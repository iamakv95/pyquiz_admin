// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8;
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';

  let strength = 0;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength === 3) return 'medium';
  return 'strong';
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Required field validation
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// Number validation
export function isValidNumber(value: any): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}

export function isPositiveNumber(value: any): boolean {
  return isValidNumber(value) && Number(value) > 0;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// Year validation
export function isValidYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
}

// File validation
export function isValidFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// Bilingual content validation
export function isValidBilingualContent(en: string, hi: string): boolean {
  return isRequired(en) && isRequired(hi);
}

// Question validation
export interface QuestionValidation {
  isValid: boolean;
  errors: string[];
}

export function validateQuestion(question: {
  question_text: string;
  question_text_hi: string;
  options: Array<{ text: string; text_hi: string }>;
  correct_option: number;
  explanation: string;
  explanation_hi: string;
  topic_id: string;
  difficulty: string;
}): QuestionValidation {
  const errors: string[] = [];

  // Validate question text
  if (!isRequired(question.question_text)) {
    errors.push('Question text (English) is required');
  }
  if (!isRequired(question.question_text_hi)) {
    errors.push('Question text (Hindi) is required');
  }

  // Validate options
  if (!question.options || question.options.length !== 4) {
    errors.push('Exactly 4 options are required');
  } else {
    question.options.forEach((option, index) => {
      if (!isRequired(option.text)) {
        errors.push(`Option ${index + 1} text (English) is required`);
      }
      if (!isRequired(option.text_hi)) {
        errors.push(`Option ${index + 1} text (Hindi) is required`);
      }
    });
  }

  // Validate correct option
  if (!isInRange(question.correct_option, 0, 3)) {
    errors.push('Correct option must be between 0 and 3');
  }

  // Validate explanation
  if (!isRequired(question.explanation)) {
    errors.push('Explanation (English) is required');
  }
  if (!isRequired(question.explanation_hi)) {
    errors.push('Explanation (Hindi) is required');
  }

  // Validate topic
  if (!isRequired(question.topic_id)) {
    errors.push('Topic is required');
  }

  // Validate difficulty
  if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
    errors.push('Valid difficulty level is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Quiz validation
export interface QuizValidation {
  isValid: boolean;
  errors: string[];
}

export function validateQuiz(quiz: {
  title: string;
  title_hi: string;
  type: string;
  scope: string;
  scope_id: string;
  duration_minutes: number;
  total_marks: number;
}): QuizValidation {
  const errors: string[] = [];

  // Validate title
  if (!isRequired(quiz.title)) {
    errors.push('Quiz title (English) is required');
  }
  if (!isRequired(quiz.title_hi)) {
    errors.push('Quiz title (Hindi) is required');
  }

  // Validate type
  if (!['pyq', 'practice', 'daily'].includes(quiz.type)) {
    errors.push('Valid quiz type is required');
  }

  // Validate scope
  if (!['exam', 'subject', 'topic', 'subtopic'].includes(quiz.scope)) {
    errors.push('Valid quiz scope is required');
  }

  // Validate scope_id
  if (!isRequired(quiz.scope_id)) {
    errors.push('Scope selection is required');
  }

  // Validate duration
  if (!isPositiveNumber(quiz.duration_minutes)) {
    errors.push('Duration must be a positive number');
  }

  // Validate total marks
  if (!isPositiveNumber(quiz.total_marks)) {
    errors.push('Total marks must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// CSV validation
export function validateCSVHeaders(headers: string[], requiredHeaders: string[]): boolean {
  return requiredHeaders.every((required) => headers.includes(required));
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Trim all string values in an object
export function trimObjectStrings<T extends Record<string, any>>(obj: T): T {
  const result: any = { ...obj };
  Object.keys(result).forEach((key) => {
    if (typeof result[key] === 'string') {
      result[key] = result[key].trim();
    }
  });
  return result as T;
}
