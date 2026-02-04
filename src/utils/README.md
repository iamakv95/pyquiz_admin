# Utility Functions Documentation

This directory contains reusable utility functions used throughout the PyQuiz Admin Web Application.

## Table of Contents

- [Constants](#constants)
- [Validation](#validation)
- [Formatting](#formatting)
- [Permissions](#permissions)
- [CSV Import/Export](#csv-importexport)
- [Image Optimization](#image-optimization)
- [Error Handling](#error-handling)
- [Toast Notifications](#toast-notifications)

## Constants

**File:** `constants.ts`

Contains all application-wide constants including:

- Admin roles
- Difficulty levels
- Quiz types and scopes
- Report and feedback types
- Pagination settings
- Date formats
- File upload limits
- Storage bucket names
- Error and success messages

**Usage:**
```typescript
import { ADMIN_ROLES, DIFFICULTY_LEVELS, PAGINATION } from '@/utils/constants';

const role = ADMIN_ROLES.SUPER_ADMIN;
const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
```

## Validation

**File:** `validation.ts`

Provides validation functions for various data types and forms.

### Key Functions:

- `isValidEmail(email: string): boolean` - Validate email format
- `isValidPassword(password: string): boolean` - Validate password strength
- `isValidUrl(url: string): boolean` - Validate URL format
- `isRequired(value: any): boolean` - Check if value is not empty
- `isValidNumber(value: any): boolean` - Check if value is a valid number
- `isPositiveNumber(value: any): boolean` - Check if value is positive
- `isInRange(value: number, min: number, max: number): boolean` - Check if value is in range
- `validateQuestion(question): QuestionValidation` - Validate question data
- `validateQuiz(quiz): QuizValidation` - Validate quiz data

**Usage:**
```typescript
import { isValidEmail, validateQuestion } from '@/utils/validation';

if (!isValidEmail(email)) {
  // Show error
}

const validation = validateQuestion(questionData);
if (!validation.isValid) {
  console.error(validation.errors);
}
```

## Formatting

**File:** `formatting.ts`

Provides formatting functions for dates, numbers, text, and application-specific data.

### Key Functions:

**Date Formatting:**
- `formatDate(date, format?)` - Format date
- `formatDateTime(date, format?)` - Format date with time
- `formatRelativeTime(date)` - Format as relative time (e.g., "2 hours ago")

**Number Formatting:**
- `formatNumber(num, decimals?)` - Format number with commas
- `formatPercentage(value, decimals?)` - Format as percentage
- `formatDuration(minutes)` - Format duration (e.g., "2h 30m")
- `formatFileSize(bytes)` - Format file size (e.g., "2.5 MB")

**Text Formatting:**
- `truncateText(text, maxLength)` - Truncate text with ellipsis
- `capitalizeFirst(text)` - Capitalize first letter
- `toTitleCase(text)` - Convert to title case
- `slugify(text)` - Convert to URL-friendly slug

**Application-Specific:**
- `formatDifficulty(difficulty)` - Format difficulty level
- `formatQuizType(type)` - Format quiz type
- `formatReportType(type)` - Format report type
- `formatPYQMetadata(year, tier, shift)` - Format PYQ metadata

**Usage:**
```typescript
import { formatDate, formatPercentage, truncateText } from '@/utils/formatting';

const date = formatDate(new Date(), 'DD MMM YYYY');
const accuracy = formatPercentage(0.856); // "85.6%"
const preview = truncateText(longText, 100);
```

## Permissions

**File:** `permissions.ts`

Provides role-based access control utilities.

### Key Functions:

- `hasPermission(userRole, permission): boolean` - Check if user has permission
- `hasRole(userRole, allowedRoles): boolean` - Check if user has any of the roles
- `isSuperAdmin(userRole): boolean` - Check if user is super admin
- `canManageContent(userRole): boolean` - Check if user can manage content
- `canEditQuestions(userRole): boolean` - Check if user can edit questions
- `getRoleDisplayName(role): string` - Get role display name

**Usage:**
```typescript
import { hasPermission, PERMISSIONS } from '@/utils/permissions';

if (hasPermission(userRole, PERMISSIONS.CREATE_QUESTIONS)) {
  // Show create button
}
```

## CSV Import/Export

**File:** `csv.ts`

Provides utilities for importing and exporting questions via CSV.

### Key Functions:

- `generateCSVTemplate(): string` - Generate CSV template
- `downloadCSVTemplate()` - Download CSV template file
- `parseCSV(csvText): QuestionCSVRow[]` - Parse CSV text to rows
- `validateQuestionRow(row, index): string[]` - Validate CSV row
- `csvRowToQuestionData(row)` - Convert CSV row to question data
- `exportQuestionsToCSV(questions)` - Export questions to CSV file

**Usage:**
```typescript
import { parseCSV, validateQuestionRow, csvRowToQuestionData } from '@/utils/csv';

const rows = parseCSV(csvText);
rows.forEach((row, index) => {
  const errors = validateQuestionRow(row, index);
  if (errors.length === 0) {
    const questionData = csvRowToQuestionData(row);
    // Save question
  }
});
```

## Image Optimization

**File:** `imageOptimization.ts`

Provides utilities for optimizing, resizing, and converting images.

### Key Functions:

- `optimizeImage(file, options?): Promise<Blob>` - Resize and compress image
- `convertToWebP(file, quality?): Promise<Blob>` - Convert to WebP format
- `createThumbnail(file, size?): Promise<Blob>` - Create thumbnail
- `getImageDimensions(file): Promise<{width, height}>` - Get image dimensions
- `validateImageFile(file, options?): Promise<{valid, error?}>` - Validate image
- `fileToDataURL(file): Promise<string>` - Convert file to data URL
- `downloadImage(url, filename): Promise<void>` - Download image from URL
- `cropImage(file, aspectRatio, quality?): Promise<Blob>` - Crop image

**Usage:**
```typescript
import { optimizeImage, validateImageFile } from '@/utils/imageOptimization';

// Validate image
const validation = await validateImageFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  minWidth: 800,
  minHeight: 600,
});

if (validation.valid) {
  // Optimize image
  const optimized = await optimizeImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
  });
  // Upload optimized image
}
```

## Error Handling

**File:** `errorHandling.ts`

Provides utilities for handling and formatting errors.

### Key Functions:

- `createAppError(message, options?): Error` - Create application error
- `parseSupabaseError(error): string` - Parse Supabase error to user-friendly message
- `parseAPIError(error): string` - Parse API error to user-friendly message
- `handleAsync<T>(promise): Promise<[T | null, Error | null]>` - Handle async with tuple
- `retryWithBackoff<T>(fn, options?): Promise<T>` - Retry function with exponential backoff
- `logError(error, context?)` - Log error to console (and error tracking service)
- `createMutationErrorHandler(onError?)` - Create error handler for React Query
- `assert(condition, message)` - Assert condition or throw error
- `isNetworkError(error): boolean` - Check if error is network error
- `isAuthError(error): boolean` - Check if error is auth error

**Usage:**
```typescript
import { parseSupabaseError, handleAsync, retryWithBackoff } from '@/utils/errorHandling';

// Handle async with tuple
const [data, error] = await handleAsync(fetchData());
if (error) {
  const message = parseSupabaseError(error);
  toast.error(message);
}

// Retry with backoff
const result = await retryWithBackoff(
  () => fetchData(),
  { maxRetries: 3, initialDelay: 1000 }
);
```

## Toast Notifications

**File:** `toast.ts`

Provides a simple toast notification system.

### Key Functions:

- `toast.success(message, options?)` - Show success toast
- `toast.error(message, options?)` - Show error toast
- `toast.warning(message, options?)` - Show warning toast
- `toast.info(message, options?)` - Show info toast

**Usage:**
```typescript
import { toast } from '@/utils/toast';

toast.success('Question created successfully');
toast.error('Failed to save question');
toast.warning('This action cannot be undone');
toast.info('New features available');
```

## Best Practices

1. **Always validate user input** before processing
2. **Use constants** instead of magic strings/numbers
3. **Format data consistently** across the application
4. **Handle errors gracefully** with user-friendly messages
5. **Check permissions** before showing UI elements or making API calls
6. **Optimize images** before uploading to reduce storage costs
7. **Use toast notifications** for user feedback

## Contributing

When adding new utility functions:

1. Add the function to the appropriate file
2. Export it from the file
3. Add it to `index.ts` for easy importing
4. Document it in this README
5. Add JSDoc comments to the function
6. Write unit tests for the function
