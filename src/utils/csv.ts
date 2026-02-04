// CSV utility functions for bulk import/export
// Note: This is a simplified version for structured content
// It converts simple text fields to/from content blocks

import type { ContentBlock, QuestionOption } from '../types/content.types';
import { createTextBlock, createTextOption, extractTextFromBlocks } from '../types/content.types';

export interface QuestionCSVRow {
  question_text: string;
  question_text_hi: string;
  option_1_text: string;
  option_1_text_hi: string;
  option_2_text: string;
  option_2_text_hi: string;
  option_3_text?: string;
  option_3_text_hi?: string;
  option_4_text?: string;
  option_4_text_hi?: string;
  correct_option: number;
  explanation: string;
  explanation_hi: string;
  topic_id: string;
  subtopic_id?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_pyq: boolean;
  year?: number;
  tier?: string;
  shift?: string;
  tags?: string; // Comma-separated tag names
}

export const generateCSVTemplate = (): string => {
  const headers = [
    'question_text',
    'question_text_hi',
    'option_1_text',
    'option_1_text_hi',
    'option_2_text',
    'option_2_text_hi',
    'option_3_text',
    'option_3_text_hi',
    'option_4_text',
    'option_4_text_hi',
    'correct_option',
    'explanation',
    'explanation_hi',
    'topic_id',
    'subtopic_id',
    'difficulty',
    'is_pyq',
    'year',
    'tier',
    'shift',
    'tags',
  ];

  const exampleRow = [
    'What is the capital of India?',
    'भारत की राजधानी क्या है?',
    'Mumbai',
    'मुंबई',
    'New Delhi',
    'नई दिल्ली',
    'Kolkata',
    'कोलकाता',
    'Chennai',
    'चेन्नई',
    '1',
    'New Delhi is the capital of India.',
    'नई दिल्ली भारत की राजधानी है।',
    'topic-uuid-here',
    '',
    'easy',
    'false',
    '',
    '',
    '',
    'geography,capitals',
  ];

  return [headers.join(','), exampleRow.join(',')].join('\n');
};

export const downloadCSVTemplate = () => {
  const csv = generateCSVTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'questions_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText: string): QuestionCSVRow[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: QuestionCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      
      // Convert specific fields
      if (header === 'correct_option') {
        row[header] = parseInt(value);
      } else if (header === 'is_pyq') {
        row[header] = value.toLowerCase() === 'true';
      } else if (header === 'year') {
        row[header] = value ? parseInt(value) : undefined;
      } else if (header === 'difficulty') {
        row[header] = value || 'medium';
      } else {
        row[header] = value || undefined;
      }
    });

    rows.push(row);
  }

  return rows;
};

// Helper to parse CSV line handling quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

export const validateQuestionRow = (row: QuestionCSVRow, index: number): string[] => {
  const errors: string[] = [];

  if (!row.question_text) {
    errors.push(`question_text is required`);
  }
  if (!row.question_text_hi) {
    errors.push(`question_text_hi is required`);
  }
  if (!row.option_1_text || !row.option_2_text) {
    errors.push(`At least 2 options are required`);
  }
  if (!row.option_1_text_hi || !row.option_2_text_hi) {
    errors.push(`Hindi text for options is required`);
  }
  if (row.correct_option < 0 || row.correct_option > 3) {
    errors.push(`correct_option must be between 0 and 3`);
  }
  if (!row.explanation) {
    errors.push(`explanation is required`);
  }
  if (!row.explanation_hi) {
    errors.push(`explanation_hi is required`);
  }
  if (!row.topic_id) {
    errors.push(`topic_id is required`);
  }
  if (!['easy', 'medium', 'hard'].includes(row.difficulty)) {
    errors.push(`difficulty must be easy, medium, or hard`);
  }
  if (row.is_pyq && !row.year) {
    errors.push(`year is required for PYQ questions`);
  }

  return errors;
};

// Convert CSV row to structured content format
export const csvRowToQuestionData = (row: QuestionCSVRow) => {
  // Create question content blocks
  const questionContent: ContentBlock[] = [
    {
      type: 'text',
      content: row.question_text,
      content_hi: row.question_text_hi,
    },
  ];

  // Create explanation content blocks
  const explanationContent: ContentBlock[] = [
    {
      type: 'text',
      content: row.explanation,
      content_hi: row.explanation_hi,
    },
  ];

  // Create options
  const options: QuestionOption[] = [];
  
  if (row.option_1_text) {
    options.push({
      type: 'text',
      content: row.option_1_text,
      content_hi: row.option_1_text_hi,
    });
  }
  
  if (row.option_2_text) {
    options.push({
      type: 'text',
      content: row.option_2_text,
      content_hi: row.option_2_text_hi,
    });
  }
  
  if (row.option_3_text) {
    options.push({
      type: 'text',
      content: row.option_3_text,
      content_hi: row.option_3_text_hi || '',
    });
  }
  
  if (row.option_4_text) {
    options.push({
      type: 'text',
      content: row.option_4_text,
      content_hi: row.option_4_text_hi || '',
    });
  }

  return {
    question_content: questionContent,
    options,
    correct_option: row.correct_option,
    explanation_content: explanationContent,
    topic_id: row.topic_id,
    subtopic_id: row.subtopic_id || null,
    difficulty: row.difficulty,
    is_pyq: row.is_pyq,
    year: row.year || null,
    tier: row.tier || null,
    shift: row.shift || null,
  };
};

export const exportQuestionsToCSV = (questions: any[]) => {
  const headers = [
    'question_text',
    'question_text_hi',
    'option_1_text',
    'option_1_text_hi',
    'option_2_text',
    'option_2_text_hi',
    'option_3_text',
    'option_3_text_hi',
    'option_4_text',
    'option_4_text_hi',
    'correct_option',
    'explanation',
    'explanation_hi',
    'topic_id',
    'subtopic_id',
    'difficulty',
    'is_pyq',
    'year',
    'tier',
    'shift',
    'tags',
  ];

  const rows = questions.map(q => {
    // Extract text from structured content blocks
    const questionContent = q.question_content as ContentBlock[];
    const explanationContent = q.explanation_content as ContentBlock[];
    const options = q.options as QuestionOption[];

    const questionText = extractTextFromBlocks(questionContent);
    const questionTextHi = questionContent
      ?.filter((b: any) => b.type === 'text')
      .map((b: any) => b.content_hi || '')
      .join(' ') || '';

    const explanationText = extractTextFromBlocks(explanationContent);
    const explanationTextHi = explanationContent
      ?.filter((b: any) => b.type === 'text')
      .map((b: any) => b.content_hi || '')
      .join(' ') || '';

    // Extract option texts
    const getOptionText = (opt: any, lang: 'en' | 'hi') => {
      if (!opt) return '';
      if (opt.type === 'text') {
        return lang === 'en' ? opt.content : opt.content_hi;
      }
      if (opt.type === 'mixed') {
        return lang === 'en' ? opt.content : opt.content_hi;
      }
      return '';
    };

    return [
      questionText,
      questionTextHi,
      getOptionText(options[0], 'en'),
      getOptionText(options[0], 'hi'),
      getOptionText(options[1], 'en'),
      getOptionText(options[1], 'hi'),
      getOptionText(options[2], 'en'),
      getOptionText(options[2], 'hi'),
      getOptionText(options[3], 'en'),
      getOptionText(options[3], 'hi'),
      q.correct_option,
      explanationText,
      explanationTextHi,
      q.topic_id,
      q.subtopic_id || '',
      q.difficulty,
      q.is_pyq,
      q.year || '',
      q.tier || '',
      q.shift || '',
      '', // tags - would need to fetch from question_tags table
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `questions_export_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
