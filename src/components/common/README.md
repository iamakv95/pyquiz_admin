# Common Components Documentation

This directory contains reusable UI components used throughout the PyQuiz Admin Web Application.

## Components

### ConfirmDialog

A confirmation dialog for destructive or important actions.

**Props:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Usage:**
```typescript
import { ConfirmDialog } from '@/components/common';

const [showDialog, setShowDialog] = useState(false);

<ConfirmDialog
  isOpen={showDialog}
  title="Delete Question"
  message="Are you sure you want to delete this question? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  type="danger"
  onConfirm={() => {
    deleteQuestion();
    setShowDialog(false);
  }}
  onCancel={() => setShowDialog(false)}
/>
```

### EmptyState

A component to display when there's no data to show.

**Props:**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Usage:**
```typescript
import { EmptyState } from '@/components/common';
import { FileQuestion } from 'lucide-react';

<EmptyState
  icon={<FileQuestion size={64} />}
  title="No questions found"
  description="Get started by creating your first question"
  actionLabel="Create Question"
  onAction={() => navigate('/questions/new')}
/>
```

### ErrorBoundary

A React error boundary component to catch and display errors gracefully.

**Props:**
```typescript
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
```

**Usage:**
```typescript
import { ErrorBoundary } from '@/components/common';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

### LoadingSpinner

A loading spinner component with optional text and full-screen mode.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}
```

**Usage:**
```typescript
import { LoadingSpinner } from '@/components/common';

// Inline spinner
<LoadingSpinner size="small" />

// With text
<LoadingSpinner text="Loading questions..." />

// Full screen
<LoadingSpinner fullScreen text="Please wait..." />
```

### PageHeader

A page header component with title, subtitle, breadcrumbs, and actions.

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}
```

**Usage:**
```typescript
import { PageHeader } from '@/components/common';
import { Plus } from 'lucide-react';

<PageHeader
  title="Questions"
  subtitle="Manage all questions in the system"
  breadcrumbs={[
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Content', path: '/content' },
    { label: 'Questions' },
  ]}
  actions={
    <button onClick={() => navigate('/questions/new')}>
      <Plus size={20} />
      Create Question
    </button>
  }
/>
```

### TableFilters

A flexible table filtering component with search and multiple filter types.

**Props:**
```typescript
interface TableFiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
  showFilterButton?: boolean;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange';
  options?: FilterOption[];
  placeholder?: string;
}
```

**Usage:**
```typescript
import { TableFilters } from '@/components/common';

const [searchValue, setSearchValue] = useState('');
const [filterValues, setFilterValues] = useState({});

const filters = [
  {
    key: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    options: [
      { label: 'Easy', value: 'easy' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hard', value: 'hard' },
    ],
  },
  {
    key: 'topic',
    label: 'Topic',
    type: 'select',
    options: topics.map(t => ({ label: t.name, value: t.id })),
  },
  {
    key: 'created',
    label: 'Created Date',
    type: 'daterange',
  },
];

<TableFilters
  searchPlaceholder="Search questions..."
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  filters={filters}
  filterValues={filterValues}
  onFilterChange={(key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  }}
  onClearFilters={() => {
    setSearchValue('');
    setFilterValues({});
  }}
/>
```

### PlaceholderPage

A placeholder page component for routes that are not yet implemented.

**Usage:**
```typescript
import { PlaceholderPage } from '@/components/common';

<PlaceholderPage />
```

### ProtectedRoute

A route wrapper component that checks user authentication and permissions.

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AdminRole[];
}
```

**Usage:**
```typescript
import { ProtectedRoute } from '@/components/common';
import { ADMIN_ROLES } from '@/utils/constants';

<ProtectedRoute allowedRoles={[ADMIN_ROLES.SUPER_ADMIN]}>
  <AdminManagement />
</ProtectedRoute>
```

## Best Practices

1. **Use semantic HTML** - Use appropriate HTML elements for better accessibility
2. **Add ARIA labels** - Ensure components are accessible to screen readers
3. **Handle loading states** - Show loading spinners during async operations
4. **Handle empty states** - Show empty state components when there's no data
5. **Confirm destructive actions** - Use ConfirmDialog for delete operations
6. **Provide feedback** - Use toast notifications for user actions
7. **Check permissions** - Use ProtectedRoute for role-based access control

## Styling

All components use Tailwind CSS for styling. Common patterns:

- **Colors**: Use semantic colors (blue for primary, red for danger, etc.)
- **Spacing**: Use consistent spacing scale (p-4, gap-3, etc.)
- **Borders**: Use rounded-lg for rounded corners
- **Shadows**: Use shadow-lg for elevated components
- **Transitions**: Use transition-colors for smooth hover effects

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Keyboard navigation support
- Focus indicators
- ARIA labels and roles
- Color contrast ratios
- Screen reader compatibility

## Contributing

When creating new common components:

1. Add the component to this directory
2. Export it from `index.ts`
3. Document it in this README
4. Add JSDoc comments to props
5. Ensure accessibility compliance
6. Write component tests


## Toast Notifications

A simple toast notification system for user feedback.

**Usage:**
```typescript
import { toast } from '@/utils/toast';

toast.success('Operation successful!');
toast.error('Something went wrong');
toast.warning('Please be careful');
toast.info('New features available');
```

**Features:**
- Auto-dismiss after 3 seconds (configurable)
- Manual dismiss with close button
- Smooth animations
- Stacking support
- Four types: success, error, warning, info

**Setup:**
The `ToastContainer` component is automatically included in `App.tsx`. No additional setup required.

See [TOAST_USAGE_GUIDE.md](../../TOAST_USAGE_GUIDE.md) for detailed usage examples.
