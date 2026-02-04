// Content block types for structured question/explanation content

export type ContentBlockType = 'text' | 'image' | 'table';

export interface TextBlock {
  type: 'text';
  content: string;
  content_hi: string;
}

export interface ImageBlock {
  type: 'image';
  url: string;
  alt?: string;
  caption?: string;
  caption_hi?: string;
}

export interface TableBlock {
  type: 'table';
  data: any; // Can be refined based on table structure needs
  caption?: string;
  caption_hi?: string;
}

export type ContentBlock = TextBlock | ImageBlock | TableBlock;

// Question option types
export type QuestionOptionType = 'text' | 'image' | 'mixed';

export interface TextOption {
  type: 'text';
  content: string;
  content_hi: string;
}

export interface ImageOption {
  type: 'image';
  image_url: string;
  alt?: string;
}

export interface MixedOption {
  type: 'mixed';
  content: string;
  content_hi: string;
  image_url: string;
  alt?: string;
}

export type QuestionOption = TextOption | ImageOption | MixedOption;

// Comprehension group
export interface ComprehensionGroup {
  id: string;
  title: string;
  title_hi: string;
  passage_content: ContentBlock[];
  created_at: string;
  updated_at: string;
}

// Question with structured content
export interface StructuredQuestion {
  id: string;
  topic_id: string;
  subtopic_id: string | null;
  question_content: ContentBlock[];
  options: QuestionOption[];
  correct_option: number;
  explanation_content: ContentBlock[];
  difficulty: 'easy' | 'medium' | 'hard';
  is_pyq: boolean;
  year: number | null;
  tier: string | null;
  shift: string | null;
  comprehension_group_id: string | null;
  created_at: string;
  updated_at: string;
}

// Helper type guards
export function isTextBlock(block: ContentBlock): block is TextBlock {
  return block.type === 'text';
}

export function isImageBlock(block: ContentBlock): block is ImageBlock {
  return block.type === 'image';
}

export function isTableBlock(block: ContentBlock): block is TableBlock {
  return block.type === 'table';
}

export function isTextOption(option: QuestionOption): option is TextOption {
  return option.type === 'text';
}

export function isImageOption(option: QuestionOption): option is ImageOption {
  return option.type === 'image';
}

export function isMixedOption(option: QuestionOption): option is MixedOption {
  return option.type === 'mixed';
}

// Utility functions
export function extractTextFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .filter(isTextBlock)
    .map(block => block.content)
    .join(' ');
}

export function extractTextFromBlocksHindi(blocks: ContentBlock[]): string {
  return blocks
    .filter(isTextBlock)
    .map(block => block.content_hi)
    .join(' ');
}

export function getImageUrls(blocks: ContentBlock[]): string[] {
  return blocks
    .filter(isImageBlock)
    .map(block => block.url);
}

// Validation functions
export function validateContentBlocks(blocks: ContentBlock[]): string[] {
  const errors: string[] = [];
  
  if (!blocks || blocks.length === 0) {
    errors.push('At least one content block is required');
    return errors;
  }

  blocks.forEach((block, index) => {
    if (isTextBlock(block)) {
      if (!block.content || block.content.trim() === '') {
        errors.push(`Text block ${index + 1}: English content is required`);
      }
      if (!block.content_hi || block.content_hi.trim() === '') {
        errors.push(`Text block ${index + 1}: Hindi content is required`);
      }
    } else if (isImageBlock(block)) {
      if (!block.url || block.url.trim() === '') {
        errors.push(`Image block ${index + 1}: Image URL is required`);
      }
    }
  });

  return errors;
}

export function validateQuestionOptions(options: QuestionOption[]): string[] {
  const errors: string[] = [];

  if (!options || options.length < 2) {
    errors.push('At least 2 options are required');
    return errors;
  }

  if (options.length > 6) {
    errors.push('Maximum 6 options are allowed');
  }

  options.forEach((option, index) => {
    if (isTextOption(option)) {
      if (!option.content || option.content.trim() === '') {
        errors.push(`Option ${index + 1}: English text is required`);
      }
      if (!option.content_hi || option.content_hi.trim() === '') {
        errors.push(`Option ${index + 1}: Hindi text is required`);
      }
    } else if (isImageOption(option)) {
      if (!option.image_url || option.image_url.trim() === '') {
        errors.push(`Option ${index + 1}: Image URL is required`);
      }
    } else if (isMixedOption(option)) {
      if (!option.content || option.content.trim() === '') {
        errors.push(`Option ${index + 1}: English text is required`);
      }
      if (!option.content_hi || option.content_hi.trim() === '') {
        errors.push(`Option ${index + 1}: Hindi text is required`);
      }
      if (!option.image_url || option.image_url.trim() === '') {
        errors.push(`Option ${index + 1}: Image URL is required`);
      }
    }
  });

  return errors;
}

// Factory functions for creating new blocks
export function createTextBlock(content = '', content_hi = ''): TextBlock {
  return {
    type: 'text',
    content,
    content_hi,
  };
}

export function createImageBlock(url = '', alt = '', caption = '', caption_hi = ''): ImageBlock {
  return {
    type: 'image',
    url,
    alt,
    caption,
    caption_hi,
  };
}

export function createTextOption(content = '', content_hi = ''): TextOption {
  return {
    type: 'text',
    content,
    content_hi,
  };
}

export function createImageOption(image_url = '', alt = ''): ImageOption {
  return {
    type: 'image',
    image_url,
    alt,
  };
}

export function createMixedOption(
  content = '',
  content_hi = '',
  image_url = '',
  alt = ''
): MixedOption {
  return {
    type: 'mixed',
    content,
    content_hi,
    image_url,
    alt,
  };
}
