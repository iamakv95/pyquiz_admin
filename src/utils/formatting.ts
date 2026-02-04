import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DATE_FORMATS } from './constants';

dayjs.extend(relativeTime);

// Date formatting
export function formatDate(date: string | Date, format: string = DATE_FORMATS.DISPLAY): string {
  return dayjs(date).format(format);
}

export function formatDateTime(
  date: string | Date,
  format: string = DATE_FORMATS.DISPLAY_WITH_TIME
): string {
  return dayjs(date).format(format);
}

export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function isYesterday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
}

// Number formatting
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Text formatting
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalizeFirst(word))
    .join(' ');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Difficulty formatting
export function formatDifficulty(difficulty: 'easy' | 'medium' | 'hard'): string {
  const map = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  return map[difficulty];
}

// Quiz type formatting
export function formatQuizType(type: 'pyq' | 'practice' | 'daily'): string {
  const map = {
    pyq: 'PYQ',
    practice: 'Practice',
    daily: 'Daily Challenge',
  };
  return map[type];
}

// Quiz scope formatting
export function formatQuizScope(scope: 'exam' | 'subject' | 'topic' | 'subtopic'): string {
  const map = {
    exam: 'Exam',
    subject: 'Subject',
    topic: 'Topic',
    subtopic: 'Subtopic',
  };
  return map[scope];
}

// Report type formatting
export function formatReportType(
  type: 'wrong_question' | 'wrong_answer' | 'typo' | 'image_issue' | 'other'
): string {
  const map = {
    wrong_question: 'Wrong Question',
    wrong_answer: 'Wrong Answer',
    typo: 'Typo',
    image_issue: 'Image Issue',
    other: 'Other',
  };
  return map[type];
}

// Status formatting
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => capitalizeFirst(word))
    .join(' ');
}

// Color coding for difficulty
export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  const colors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red',
  };
  return colors[difficulty];
}

// Color coding for status
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'orange',
    reviewed: 'blue',
    resolved: 'green',
    published: 'green',
    unpublished: 'red',
    active: 'green',
    inactive: 'red',
  };
  return colors[status] || 'default';
}

// Accuracy color coding
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.8) return 'green';
  if (accuracy >= 0.6) return 'orange';
  return 'red';
}

// Format bilingual text for display
export function formatBilingualText(en: string, hi: string, language: 'en' | 'hi' = 'en'): string {
  return language === 'hi' ? hi : en;
}

// Format PYQ metadata
export function formatPYQMetadata(year: number | null, tier: string | null, shift: string | null): string {
  const parts = [];
  if (year) parts.push(year.toString());
  if (tier) parts.push(tier);
  if (shift) parts.push(shift);
  return parts.join(' - ');
}

// Format user name
export function formatUserName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}

// Format email for display (hide part of it)
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;
  const masked = username.substring(0, 2) + '***' + username.substring(username.length - 1);
  return `${masked}@${domain}`;
}

// Format phone number (Indian format)
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  return phone;
}

// Format marks
export function formatMarks(obtained: number, total: number): string {
  return `${obtained}/${total}`;
}

// Format score percentage
export function formatScore(obtained: number, total: number): string {
  const percentage = (obtained / total) * 100;
  return `${obtained}/${total} (${percentage.toFixed(1)}%)`;
}
