// Admin Roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CONTENT_MANAGER: 'content_manager',
  MODERATOR: 'moderator',
} as const;

// Question Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// Quiz Types
export const QUIZ_TYPES = {
  PYQ: 'pyq',
  PRACTICE: 'practice',
  DAILY: 'daily',
} as const;

// Quiz Scopes
export const QUIZ_SCOPES = {
  EXAM: 'exam',
  SUBJECT: 'subject',
  TOPIC: 'topic',
  SUBTOPIC: 'subtopic',
} as const;

// Report Types
export const REPORT_TYPES = {
  WRONG_QUESTION: 'wrong_question',
  WRONG_ANSWER: 'wrong_answer',
  TYPO: 'typo',
  IMAGE_ISSUE: 'image_issue',
  OTHER: 'other',
} as const;

// Report Status
export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
} as const;

// Feedback Status
export const FEEDBACK_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
} as const;

// Tag Types
export const TAG_TYPES = {
  CONCEPT: 'concept',
  PATTERN: 'pattern',
  SKILL: 'skill',
  EXAM_BEHAVIOR: 'exam_behavior',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_WITH_TIME: 'DD MMM YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['text/csv', 'application/json'],
} as const;

// Storage Buckets
export const STORAGE_BUCKETS = {
  QUESTION_IMAGES: 'question-images',
  EXPLANATION_IMAGES: 'explanation-images',
  OPTION_IMAGES: 'option-images',
  EXAM_ICONS: 'exam-icons',
  AVATARS: 'avatars',
} as const;

// Exam Categories
export const EXAM_CATEGORIES = {
  SSC: 'SSC',
  UPSSSC: 'UPSSSC',
} as const;

// Indian States
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

// Categories (Reservation)
export const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'] as const;

// Gender Options
export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;

// Theme Options
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Language Options
export const LANGUAGE_OPTIONS = {
  ENGLISH: 'en',
  HINDI: 'hi',
} as const;

// Audit Log Actions
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
  REVIEW: 'review',
  RESOLVE: 'resolve',
  IMPORT: 'import',
  EXPORT: 'export',
} as const;

// Entity Types for Audit Logs
export const ENTITY_TYPES = {
  QUESTION: 'question',
  QUIZ: 'quiz',
  EXAM: 'exam',
  SUBJECT: 'subject',
  TOPIC: 'topic',
  SUBTOPIC: 'subtopic',
  TAG: 'tag',
  USER: 'user',
  ADMIN: 'admin',
  REPORT: 'report',
  FEEDBACK: 'feedback',
  CONFIG: 'config',
} as const;

// API Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  PUBLISHED: 'Published successfully',
  UNPUBLISHED: 'Unpublished successfully',
  IMPORTED: 'Imported successfully',
  EXPORTED: 'Exported successfully',
} as const;
