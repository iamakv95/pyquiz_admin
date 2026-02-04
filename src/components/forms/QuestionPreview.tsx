import { useState } from 'react';
import { Eye, X } from 'lucide-react';
import type { ContentBlock, QuestionOption } from '../../types/content.types';
import { isTextBlock, isImageBlock, isTextOption, isImageOption, isMixedOption } from '../../types/content.types';

interface QuestionPreviewProps {
  questionContent: ContentBlock[];
  options: QuestionOption[];
  correctOption: number;
  explanationContent: ContentBlock[];
  language?: 'en' | 'hi';
}

const QuestionPreview = ({
  questionContent,
  options,
  correctOption,
  explanationContent,
  language = 'en',
}: QuestionPreviewProps) => {
  const [showModal, setShowModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>(language);
  const [showExplanation, setShowExplanation] = useState(false);

  const getOptionLabel = (index: number) => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    return labels[index] || `${index + 1}`;
  };

  const renderContentBlocks = (blocks: ContentBlock[]) => {
    return blocks.map((block, index) => {
      if (isTextBlock(block)) {
        const text = currentLanguage === 'en' ? block.content : block.content_hi;
        return (
          <p key={index} className="text-gray-800 leading-relaxed mb-3">
            {text}
          </p>
        );
      }
      if (isImageBlock(block)) {
        return (
          <figure key={index} className="my-4">
            <img
              src={block.url}
              alt={block.alt || 'Question image'}
              className="max-w-full h-auto rounded-lg border border-gray-300"
            />
            {block.caption && (
              <figcaption className="text-sm text-gray-600 mt-2 text-center">
                {currentLanguage === 'en' ? block.caption : block.caption_hi || block.caption}
              </figcaption>
            )}
          </figure>
        );
      }
      return null;
    });
  };

  const renderOption = (option: QuestionOption, index: number) => {
    const isCorrect = index === correctOption;
    
    return (
      <div
        key={index}
        className={`p-3 border-2 rounded-lg transition-colors ${
          showExplanation && isCorrect
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-white hover:border-blue-400'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            showExplanation && isCorrect
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {getOptionLabel(index)}
          </div>
          
          <div className="flex-1">
            {isTextOption(option) && (
              <span className="text-gray-800">
                {currentLanguage === 'en' ? option.content : option.content_hi}
              </span>
            )}
            
            {isImageOption(option) && (
              <img
                src={option.image_url}
                alt={option.alt || `Option ${getOptionLabel(index)}`}
                className="max-w-xs h-auto rounded border border-gray-300"
              />
            )}
            
            {isMixedOption(option) && (
              <div className="space-y-2">
                <span className="text-gray-800 block">
                  {currentLanguage === 'en' ? option.content : option.content_hi}
                </span>
                <img
                  src={option.image_url}
                  alt={option.alt || `Option ${getOptionLabel(index)}`}
                  className="max-w-xs h-auto rounded border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        <Eye size={18} />
        Preview Question
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Question Preview</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentLanguage('en')}
                    className={`px-3 py-1 text-sm rounded ${
                      currentLanguage === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentLanguage('hi')}
                    className={`px-3 py-1 text-sm rounded ${
                      currentLanguage === 'hi'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Question */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">QUESTION</h4>
                {renderContentBlocks(questionContent)}
              </div>

              {/* Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">OPTIONS</h4>
                <div className="space-y-2">
                  {options.map((option, index) => renderOption(option, index))}
                </div>
              </div>

              {/* Show Explanation Toggle */}
              {explanationContent.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                </button>
              )}

              {/* Explanation */}
              {showExplanation && explanationContent.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="text-sm font-medium text-green-800 mb-3">EXPLANATION</h4>
                  {renderContentBlocks(explanationContent)}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionPreview;
