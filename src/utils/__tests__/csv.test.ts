import { describe, it, expect } from 'vitest';
import {
  generateCSVTemplate,
  parseCSV,
  validateQuestionRow,
  csvRowToQuestionData,
  type QuestionCSVRow,
} from '../csv';

describe('CSV utilities', () => {
  describe('generateCSVTemplate', () => {
    it('should generate CSV template with headers', () => {
      const template = generateCSVTemplate();
      expect(template).toContain('question_text');
      expect(template).toContain('question_text_hi');
      expect(template).toContain('option_1_text');
      expect(template).toContain('correct_option');
      expect(template).toContain('difficulty');
    });

    it('should include example row', () => {
      const template = generateCSVTemplate();
      const lines = template.split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(lines[1]).toContain('What is the capital of India?');
    });
  });

  describe('parseCSV', () => {
    it('should parse valid CSV', () => {
      const csv = `question_text,question_text_hi,option_1_text,option_1_text_hi,option_2_text,option_2_text_hi,option_3_text,option_3_text_hi,option_4_text,option_4_text_hi,correct_option,explanation,explanation_hi,topic_id,subtopic_id,difficulty,is_pyq,year,tier,shift,tags
What is 2+2?,2+2 क्या है?,3,३,4,४,5,५,6,६,1,The answer is 4,उत्तर 4 है,topic-123,,easy,false,,,,,math`;
      
      const rows = parseCSV(csv);
      expect(rows).toHaveLength(1);
      expect(rows[0].question_text).toBe('What is 2+2?');
      expect(rows[0].correct_option).toBe(1);
      expect(rows[0].is_pyq).toBe(false);
      expect(rows[0].difficulty).toBe('easy');
    });

    it('should handle multiple rows', () => {
      const csv = `question_text,question_text_hi,option_1_text,option_1_text_hi,option_2_text,option_2_text_hi,option_3_text,option_3_text_hi,option_4_text,option_4_text_hi,correct_option,explanation,explanation_hi,topic_id,subtopic_id,difficulty,is_pyq,year,tier,shift,tags
Q1,Q1 हिंदी,A,A हिंदी,B,B हिंदी,C,C हिंदी,D,D हिंदी,0,Exp,Exp हिंदी,topic-1,,easy,false,,,,,
Q2,Q2 हिंदी,A,A हिंदी,B,B हिंदी,C,C हिंदी,D,D हिंदी,1,Exp,Exp हिंदी,topic-2,,medium,false,,,,,`;
      
      const rows = parseCSV(csv);
      expect(rows).toHaveLength(2);
      expect(rows[0].question_text).toBe('Q1');
      expect(rows[1].question_text).toBe('Q2');
    });

    it('should throw error for empty CSV', () => {
      expect(() => parseCSV('')).toThrow('CSV file is empty or invalid');
    });

    it('should handle PYQ questions', () => {
      const csv = `question_text,question_text_hi,option_1_text,option_1_text_hi,option_2_text,option_2_text_hi,option_3_text,option_3_text_hi,option_4_text,option_4_text_hi,correct_option,explanation,explanation_hi,topic_id,subtopic_id,difficulty,is_pyq,year,tier,shift,tags
PYQ Question,PYQ प्रश्न,A,A हिंदी,B,B हिंदी,C,C हिंदी,D,D हिंदी,0,Exp,Exp हिंदी,topic-1,,medium,true,2023,Tier 1,Morning,`;
      
      const rows = parseCSV(csv);
      expect(rows[0].is_pyq).toBe(true);
      expect(rows[0].year).toBe(2023);
      expect(rows[0].tier).toBe('Tier 1');
      expect(rows[0].shift).toBe('Morning');
    });
  });

  describe('validateQuestionRow', () => {
    const validRow: QuestionCSVRow = {
      question_text: 'What is 2+2?',
      question_text_hi: '2+2 क्या है?',
      option_1_text: '3',
      option_1_text_hi: '३',
      option_2_text: '4',
      option_2_text_hi: '४',
      option_3_text: '5',
      option_3_text_hi: '५',
      option_4_text: '6',
      option_4_text_hi: '६',
      correct_option: 1,
      explanation: 'The answer is 4',
      explanation_hi: 'उत्तर 4 है',
      topic_id: 'topic-123',
      difficulty: 'easy',
      is_pyq: false,
    };

    it('should validate correct row', () => {
      const errors = validateQuestionRow(validRow, 0);
      expect(errors).toHaveLength(0);
    });

    it('should reject row without question text', () => {
      const row = { ...validRow, question_text: '' };
      const errors = validateQuestionRow(row, 0);
      expect(errors).toContain('question_text is required');
    });

    it('should reject row without Hindi question text', () => {
      const row = { ...validRow, question_text_hi: '' };
      const errors = validateQuestionRow(row, 0);
      expect(errors).toContain('question_text_hi is required');
    });

    it('should reject row without options', () => {
      const row = { ...validRow, option_1_text: '', option_2_text: '' };
      const errors = validateQuestionRow(row, 0);
      expect(errors).toContain('At least 2 options are required');
    });

    it('should reject row with invalid correct option', () => {
      const row = { ...validRow, correct_option: 5 };
      const errors = validateQuestionRow(row, 0);
      expect(errors).toContain('correct_option must be between 0 and 3');
    });

    it('should reject row without explanation', () => {
      const row = { ...validRow, explanation: '' };
      const errors = validateQuestionRow(row, 0);
      expect(errors).toContain('explanation is required');
    });

    it('should reject row without topic', () => {
      const row = { ...validRow, topic_id: '' };
      const errors = validateQuestionRow(row, 0);
      expect(errors).toContain('topic_id is required');
    });

    it('should reject row with invalid difficulty', () => {
      const row = { ...validRow, difficulty: 'invalid' as any };
      const errors = validateQuestionRow(row, 0);
      expect(errors).toContain('difficulty must be easy, medium, or hard');
    });

    it('should reject PYQ row without year', () => {
      const row = { ...validRow, is_pyq: true };
      const errors = validateQuestionRow(row, 0);
      expect(errors).toContain('year is required for PYQ questions');
    });
  });

  describe('csvRowToQuestionData', () => {
    it('should convert CSV row to question data', () => {
      const row: QuestionCSVRow = {
        question_text: 'What is 2+2?',
        question_text_hi: '2+2 क्या है?',
        option_1_text: '3',
        option_1_text_hi: '३',
        option_2_text: '4',
        option_2_text_hi: '४',
        option_3_text: '5',
        option_3_text_hi: '५',
        option_4_text: '6',
        option_4_text_hi: '६',
        correct_option: 1,
        explanation: 'The answer is 4',
        explanation_hi: 'उत्तर 4 है',
        topic_id: 'topic-123',
        difficulty: 'easy',
        is_pyq: false,
      };

      const data = csvRowToQuestionData(row);

      expect(data.question_content).toHaveLength(1);
      expect(data.question_content[0].type).toBe('text');
      expect(data.question_content[0]).toHaveProperty('content', 'What is 2+2?');
      expect(data.question_content[0]).toHaveProperty('content_hi', '2+2 क्या है?');

      expect(data.options).toHaveLength(4);
      expect(data.options[0].type).toBe('text');
      expect(data.options[0]).toHaveProperty('content', '3');

      expect(data.correct_option).toBe(1);
      expect(data.difficulty).toBe('easy');
      expect(data.topic_id).toBe('topic-123');
    });

    it('should handle optional fields', () => {
      const row: QuestionCSVRow = {
        question_text: 'Question',
        question_text_hi: 'प्रश्न',
        option_1_text: 'A',
        option_1_text_hi: 'A',
        option_2_text: 'B',
        option_2_text_hi: 'B',
        correct_option: 0,
        explanation: 'Explanation',
        explanation_hi: 'व्याख्या',
        topic_id: 'topic-123',
        difficulty: 'medium',
        is_pyq: true,
        year: 2023,
        tier: 'Tier 1',
        shift: 'Morning',
      };

      const data = csvRowToQuestionData(row);

      expect(data.is_pyq).toBe(true);
      expect(data.year).toBe(2023);
      expect(data.tier).toBe('Tier 1');
      expect(data.shift).toBe('Morning');
    });

    it('should handle questions with only 2 options', () => {
      const row: QuestionCSVRow = {
        question_text: 'True or False?',
        question_text_hi: 'सही या गलत?',
        option_1_text: 'True',
        option_1_text_hi: 'सही',
        option_2_text: 'False',
        option_2_text_hi: 'गलत',
        correct_option: 0,
        explanation: 'It is true',
        explanation_hi: 'यह सच है',
        topic_id: 'topic-123',
        difficulty: 'easy',
        is_pyq: false,
      };

      const data = csvRowToQuestionData(row);

      expect(data.options).toHaveLength(2);
    });
  });
});
