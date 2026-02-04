import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Type, Image as ImageIcon, Layers } from 'lucide-react';
import type { QuestionOption } from '../../types/content.types';
import {
  createTextOption,
  createImageOption,
  createMixedOption,
  isTextOption,
  isImageOption,
  isMixedOption,
} from '../../types/content.types';
import BilingualInput from './BilingualInput';
import ImageUpload from './ImageUpload';

interface OptionBuilderProps {
  options: QuestionOption[];
  correctOption: number;
  onChange: (options: QuestionOption[], correctOption: number) => void;
  minOptions?: number;
  maxOptions?: number;
}

const OptionBuilder = ({
  options,
  correctOption,
  onChange,
  minOptions = 2,
  maxOptions = 6,
}: OptionBuilderProps) => {
  const [optionType, setOptionType] = useState<'text' | 'image' | 'mixed'>('text');

  const addOption = () => {
    if (options.length >= maxOptions) {
      alert(`Maximum ${maxOptions} options allowed`);
      return;
    }

    let newOption: QuestionOption;
    switch (optionType) {
      case 'text':
        newOption = createTextOption();
        break;
      case 'image':
        newOption = createImageOption();
        break;
      case 'mixed':
        newOption = createMixedOption();
        break;
    }

    onChange([...options, newOption], correctOption);
  };

  const removeOption = (index: number) => {
    if (options.length <= minOptions) {
      alert(`At least ${minOptions} options required`);
      return;
    }

    const newOptions = options.filter((_, i) => i !== index);
    const newCorrectOption = correctOption === index ? 0 : correctOption > index ? correctOption - 1 : correctOption;
    onChange(newOptions, newCorrectOption);
  };

  const updateOption = (index: number, updates: Partial<QuestionOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates } as QuestionOption;
    onChange(newOptions, correctOption);
  };

  const setCorrectOption = (index: number) => {
    onChange(options, index);
  };

  const getOptionLabel = (index: number) => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    return labels[index] || `${index + 1}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Options
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex items-center gap-2">
          <select
            value={optionType}
            onChange={(e) => setOptionType(e.target.value as 'text' | 'image' | 'mixed')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="text">Text Option</option>
            <option value="image">Image Option</option>
            <option value="mixed">Mixed (Text + Image)</option>
          </select>
          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= maxOptions}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Add Option
          </button>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {options.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No options yet. Add at least {minOptions} options.</p>
          </div>
        )}

        {options.map((option, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-4 transition-all ${
              correctOption === index
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            {/* Option Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectOption(index)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    correctOption === index
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={correctOption === index ? 'Correct answer' : 'Mark as correct'}
                >
                  {correctOption === index ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Circle size={16} />
                  )}
                  <span className="font-bold">{getOptionLabel(index)}</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {isTextOption(option) && (
                    <>
                      <Type size={14} />
                      <span>Text</span>
                    </>
                  )}
                  {isImageOption(option) && (
                    <>
                      <ImageIcon size={14} />
                      <span>Image</span>
                    </>
                  )}
                  {isMixedOption(option) && (
                    <>
                      <Layers size={14} />
                      <span>Mixed</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeOption(index)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                title="Remove option"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Option Content */}
            <div className="space-y-3">
              {isTextOption(option) && (
                <BilingualInput
                  label={`Option ${getOptionLabel(index)} Text`}
                  value={{ en: option.content, hi: option.content_hi }}
                  onChange={(value) =>
                    updateOption(index, { content: value.en, content_hi: value.hi })
                  }
                  type="text"
                  required
                  placeholder={{
                    en: `Enter option ${getOptionLabel(index)} in English`,
                    hi: `विकल्प ${getOptionLabel(index)} हिंदी में दर्ज करें`,
                  }}
                />
              )}

              {isImageOption(option) && (
                <ImageUpload
                  label={`Option ${getOptionLabel(index)} Image`}
                  value={option.image_url}
                  onChange={(url) => updateOption(index, { image_url: url || '' })}
                  bucket="option-images"
                />
              )}

              {isMixedOption(option) && (
                <>
                  <BilingualInput
                    label={`Option ${getOptionLabel(index)} Text`}
                    value={{ en: option.content, hi: option.content_hi }}
                    onChange={(value) =>
                      updateOption(index, { content: value.en, content_hi: value.hi })
                    }
                    type="text"
                    required
                    placeholder={{
                      en: `Enter option ${getOptionLabel(index)} in English`,
                      hi: `विकल्प ${getOptionLabel(index)} हिंदी में दर्ज करें`,
                    }}
                  />
                  <ImageUpload
                    label={`Option ${getOptionLabel(index)} Image`}
                    value={option.image_url}
                    onChange={(url) => updateOption(index, { image_url: url || '' })}
                    bucket="option-images"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div>
          <span className="font-medium">{options.length}</span> option(s) •{' '}
          <span className="font-medium text-green-600">
            Correct: {options.length > 0 ? getOptionLabel(correctOption) : 'None'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {minOptions} min • {maxOptions} max
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-medium text-blue-900 mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Use text options for simple multiple choice questions</li>
          <li>Use image options for pattern recognition or diagram-based questions</li>
          <li>Use mixed options when you need both text and image</li>
          <li>Click the circle icon to mark the correct answer</li>
        </ul>
      </div>
    </div>
  );
};

export default OptionBuilder;
