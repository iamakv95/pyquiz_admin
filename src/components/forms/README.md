# Form Components

This directory contains reusable form components for the PyQuiz Admin Web Application, with special focus on structured content editing for questions.

## Components Overview

### Core Components

#### BilingualInput
Bilingual text input component supporting English and Hindi.

**Features:**
- Tabbed interface for English/Hindi
- Copy English to Hindi helper
- Character count
- Support for text and textarea
- Validation error display

**Usage:**
```tsx
<BilingualInput
  label="Question Text"
  value={{ en: 'English text', hi: 'हिंदी पाठ' }}
  onChange={(value) => setData(value)}
  type="textarea"
  required
/>
```

#### ImageUpload
Image upload component with Supabase Storage integration.

**Features:**
- Drag and drop support
- File size validation
- Image preview
- Delete functionality
- Upload progress indicator

**Usage:**
```tsx
<ImageUpload
  label="Question Image"
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  bucket="question-images"
  maxSize={5}
/>
```

### Structured Content Components

#### ContentBlockEditor
Block-based content editor for questions and explanations.

**Features:**
- Add/remove text and image blocks
- Reorder blocks (move up/down)
- Expand/collapse blocks
- Bilingual text input for text blocks
- Image upload with caption for image blocks
- Minimum block validation

**Usage:**
```tsx
<ContentBlockEditor
  label="Question Content"
  blocks={questionContent}
  onChange={(blocks) => setQuestionContent(blocks)}
  allowedTypes={['text', 'image']}
  minBlocks={1}
/>
```

**Block Types:**
- **Text Block**: Bilingual paragraph text
- **Image Block**: Image with alt text and optional caption
- **Table Block**: (Future) Structured table data

#### OptionBuilder
Flexible option builder supporting text, image, and mixed options.

**Features:**
- Add/remove options (2-6 options)
- Choose option type per option
- Mark correct answer
- Visual indication of correct answer
- Support for text-only, image-only, and mixed options

**Usage:**
```tsx
<OptionBuilder
  options={options}
  correctOption={correctOption}
  onChange={(options, correctOption) => {
    setOptions(options);
    setCorrectOption(correctOption);
  }}
  minOptions={2}
  maxOptions={6}
/>
```

**Option Types:**
- **Text Option**: Bilingual text
- **Image Option**: Image only
- **Mixed Option**: Text + Image

#### QuestionPreview
Preview modal showing how the question will appear to users.

**Features:**
- Language toggle (English/Hindi)
- Show/hide explanation
- Highlight correct answer
- Mobile-like rendering
- Modal interface

**Usage:**
```tsx
<QuestionPreview
  questionContent={questionContent}
  options={options}
  correctOption={correctOption}
  explanationContent={explanationContent}
  language="en"
/>
```

#### QuestionForm
Complete question form integrating all components.

**Features:**
- Question content editor
- Option builder
- Explanation editor
- Metadata fields (topic, difficulty, PYQ)
- Validation
- Preview functionality
- Create/Edit modes

**Usage:**
```tsx
<QuestionForm
  initialData={existingQuestion}
  onSubmit={async (data) => {
    await questionService.create(data);
  }}
  onCancel={() => navigate('/questions')}
  mode="create"
/>
```

### Entity Forms

#### ExamForm
Form for creating/editing exams.

#### SubjectForm
Form for creating/editing subjects.

#### TopicForm
Form for creating/editing topics.

#### SubtopicForm
Form for creating/editing subtopics.

## Component Architecture

```
QuestionForm (Main Container)
├── ContentBlockEditor (Question)
│   ├── BilingualInput (Text Blocks)
│   └── ImageUpload (Image Blocks)
├── OptionBuilder (Options)
│   ├── BilingualInput (Text Options)
│   └── ImageUpload (Image Options)
├── ContentBlockEditor (Explanation)
│   ├── BilingualInput (Text Blocks)
│   └── ImageUpload (Image Blocks)
└── QuestionPreview (Preview Modal)
```

## Styling

All components use Tailwind CSS for styling with consistent design patterns:

- **Primary Color**: Blue (blue-600)
- **Success Color**: Green (green-600)
- **Danger Color**: Red (red-500)
- **Border Radius**: rounded-lg (8px)
- **Spacing**: Consistent padding and margins
- **Transitions**: Smooth color and size transitions

## Validation

Components include built-in validation:

- **ContentBlockEditor**: Validates that text blocks have content in both languages
- **OptionBuilder**: Validates minimum/maximum options and required fields
- **QuestionForm**: Comprehensive form validation before submission

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader compatible
- Color contrast compliance

## State Management

Components use controlled state pattern:

```tsx
const [blocks, setBlocks] = useState<ContentBlock[]>([]);

<ContentBlockEditor
  blocks={blocks}
  onChange={setBlocks}
/>
```

## Type Safety

All components are fully typed with TypeScript:

```typescript
import type { ContentBlock, QuestionOption } from '@/types/content.types';
```

## Examples

### Creating a Simple Text Question

```tsx
const [questionContent, setQuestionContent] = useState<ContentBlock[]>([
  createTextBlock('What is 2+2?', '2+2 क्या है?')
]);

const [options, setOptions] = useState<QuestionOption[]>([
  createTextOption('3', '3'),
  createTextOption('4', '4'),
  createTextOption('5', '5'),
  createTextOption('6', '6'),
]);

const [correctOption, setCorrectOption] = useState(1);
```

### Creating a Question with Chart

```tsx
const [questionContent, setQuestionContent] = useState<ContentBlock[]>([
  createTextBlock('Study the chart below:', 'नीचे दिए गए चार्ट का अध्ययन करें:'),
  createImageBlock('https://...', 'Chart', 'Figure 1: Sales data'),
  createTextBlock('What is the trend?', 'रुझान क्या है?'),
]);
```

### Creating Image-based Options

```tsx
const [options, setOptions] = useState<QuestionOption[]>([
  createImageOption('https://.../option1.jpg', 'Pattern 1'),
  createImageOption('https://.../option2.jpg', 'Pattern 2'),
  createImageOption('https://.../option3.jpg', 'Pattern 3'),
  createImageOption('https://.../option4.jpg', 'Pattern 4'),
]);
```

## Testing

Components should be tested with:

1. **Unit Tests**: Test individual component logic
2. **Integration Tests**: Test component interactions
3. **Visual Tests**: Test rendering and styling
4. **Accessibility Tests**: Test keyboard navigation and screen readers

## Performance

Components are optimized for performance:

- Lazy loading for images
- Debounced input handlers
- Memoized callbacks
- Efficient re-renders

## Future Enhancements

- [ ] Drag-and-drop reordering for content blocks
- [ ] Rich text formatting (bold, italic, etc.)
- [ ] LaTeX math equation support
- [ ] Table block support
- [ ] Video/audio block support
- [ ] Collaborative editing
- [ ] Auto-save functionality
- [ ] Undo/redo support

## Troubleshooting

### Images not uploading
- Check Supabase Storage configuration
- Verify bucket permissions
- Check file size limits

### Validation errors
- Ensure all required fields are filled
- Check bilingual content (both EN and HI)
- Verify image URLs are valid

### Preview not showing
- Check that content blocks have data
- Verify options are properly formatted
- Ensure correct option index is valid

## Support

For issues or questions:
1. Check component documentation
2. Review type definitions
3. Check console for errors
4. Contact development team

---

**Last Updated:** January 27, 2025
**Version:** 1.0
