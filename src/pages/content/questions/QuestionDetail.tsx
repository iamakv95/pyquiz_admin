import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Trash2, CheckCircle, Circle, FileText, Image as ImageIcon } from 'lucide-react';
import { useQuestion, useDeleteQuestion, useDuplicateQuestion } from '../../../hooks/useQuestions';
import type { ContentBlock, QuestionOption } from '../../../types/content.types';
import { isTextBlock, isImageBlock, isTextOption, isImageOption, isMixedOption } from '../../../types/content.types';

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: question, isLoading } = useQuestion(id!);
  const deleteQuestion = useDeleteQuestion();
  const duplicateQuestion = useDuplicateQuestion();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion.mutateAsync(id!);
        navigate('/content/questions');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateQuestion.mutateAsync(id!);
      alert('Question duplicated successfully!');
      navigate('/content/questions');
    } catch (error) {
      console.error('Error duplicating question:', error);
      alert('Failed to duplicate question');
    }
  };

  const renderContentBlocks = (blocks: ContentBlock[], language: 'en' | 'hi' = 'en') => {
    if (!blocks || blocks.length === 0) {
      return <p className="text-gray-400 italic">No content</p>;
    }

    return (
      <div className="space-y-4">
        {blocks.map((block, index) => {
          if (isTextBlock(block)) {
            const content = language === 'en' ? block.content : block.content_hi;
            return (
              <div key={index} className="flex gap-3">
                <FileText size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-gray-900 whitespace-pre-wrap">{content || <span className="text-gray-400 italic">No text</span>}</p>
              </div>
            );
          }
          
          if (isImageBlock(block)) {
            const caption = language === 'en' ? block.caption : block.caption_hi;
            return (
              <div key={index} className="flex gap-3">
                <ImageIcon size={18} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  {block.url ? (
                    <img
                      src={block.url}
                      alt={block.alt || 'Question image'}
                      className="max-w-2xl rounded-lg border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <p className="text-gray-400 italic">No image URL</p>
                  )}
                  {caption && (
                    <p className="text-sm text-gray-600 mt-2 italic">{caption}</p>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderOption = (option: QuestionOption, index: number, isCorrect: boolean, language: 'en' | 'hi' = 'en') => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const label = labels[index] || `${index + 1}`;

    return (
      <div
        key={index}
        className={`p-4 rounded-lg border-2 transition-all ${
          isCorrect
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCorrect ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <Circle size={20} className="text-gray-400" />
            )}
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-sm font-bold">
              {label}
            </span>
          </div>
          
          <div className="flex-1 space-y-2">
            {isTextOption(option) && (
              <p className="text-gray-900">
                {language === 'en' ? option.content : option.content_hi}
              </p>
            )}
            
            {isImageOption(option) && option.image_url && (
              <img
                src={option.image_url}
                alt={`Option ${label}`}
                className="max-w-md rounded border border-gray-200"
              />
            )}
            
            {isMixedOption(option) && (
              <>
                <p className="text-gray-900">
                  {language === 'en' ? option.content : option.content_hi}
                </p>
                {option.image_url && (
                  <img
                    src={option.image_url}
                    alt={`Option ${label}`}
                    className="max-w-md rounded border border-gray-200"
                  />
                )}
              </>
            )}
          </div>
          
          {isCorrect && (
            <span className="flex-shrink-0 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
              Correct Answer
            </span>
          )}
        </div>
      </div>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Question not found</p>
          <button
            onClick={() => navigate('/content/questions')}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  const questionContent = question.question_content as unknown as ContentBlock[];
  const explanationContent = question.explanation_content as unknown as ContentBlock[];
  const options = question.options as unknown as QuestionOption[];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/content/questions')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Questions
        </button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Question Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/content/questions/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={18} />
              Edit
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Copy size={18} />
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
        {question.is_pyq && (
          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
            PYQ {question.year && `• ${question.year}`}
          </span>
        )}
        {question.comprehension_group && (
          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
            Comprehension Question
          </span>
        )}
      </div>

      {/* Question Content */}
      <div className="space-y-6">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Question</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">English</span>
              </div>
              {renderContentBlocks(questionContent, 'en')}
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">हिंदी (Hindi)</span>
              </div>
              {renderContentBlocks(questionContent, 'hi')}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Answer Options</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">English</span>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => 
                  renderOption(option, index, question.correct_option === index, 'en')
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">हिंदी (Hindi)</span>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => 
                  renderOption(option, index, question.correct_option === index, 'hi')
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Explanation</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">English</span>
              </div>
              {renderContentBlocks(explanationContent, 'en')}
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">हिंदी (Hindi)</span>
              </div>
              {renderContentBlocks(explanationContent, 'hi')}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Question Metadata</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Topic</h3>
                <p className="text-gray-900 font-medium">{question.topic?.name || 'N/A'}</p>
              </div>
              {question.subtopic && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subtopic</h3>
                  <p className="text-gray-900 font-medium">{question.subtopic.name}</p>
                </div>
              )}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Difficulty</h3>
                <p className="text-gray-900 font-medium capitalize">{question.difficulty}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">PYQ Status</h3>
                <p className="text-gray-900 font-medium">{question.is_pyq ? 'Yes' : 'No'}</p>
              </div>
              {question.is_pyq && (
                <>
                  {question.year && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Year</h3>
                      <p className="text-gray-900 font-medium">{question.year}</p>
                    </div>
                  )}
                  {question.tier && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tier</h3>
                      <p className="text-gray-900 font-medium">{question.tier}</p>
                    </div>
                  )}
                  {question.shift && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shift</h3>
                      <p className="text-gray-900 font-medium">{question.shift}</p>
                    </div>
                  )}
                </>
              )}
              {question.comprehension_group && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Comprehension Group</h3>
                  <p className="text-gray-900 font-medium">{question.comprehension_group.title}</p>
                </div>
              )}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Created</h3>
                <p className="text-gray-900 font-medium">
                  {new Date(question.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Updated</h3>
                <p className="text-gray-900 font-medium">
                  {new Date(question.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
