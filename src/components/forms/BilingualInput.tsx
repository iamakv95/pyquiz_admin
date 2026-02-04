import { useState } from 'react';
import { Copy } from 'lucide-react';

interface BilingualInputProps {
  label: string;
  value: { en: string; hi: string };
  onChange: (value: { en: string; hi: string }) => void;
  type?: 'text' | 'textarea';
  required?: boolean;
  placeholder?: { en: string; hi: string };
  error?: { en?: string; hi?: string };
}

const BilingualInput = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = { en: '', hi: '' },
  error,
}: BilingualInputProps) => {
  const [activeTab, setActiveTab] = useState<'en' | 'hi'>('en');

  const handleCopyToHindi = () => {
    onChange({ ...value, hi: value.en });
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={handleCopyToHindi}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          title="Copy English to Hindi"
        >
          <Copy size={14} />
          Copy EN → HI
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'en'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hi')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'hi'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          हिंदी (Hindi)
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-2">
        {activeTab === 'en' && (
          <div>
            <InputComponent
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder={placeholder.en}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error?.en ? 'border-red-500' : 'border-gray-300'
              } ${type === 'textarea' ? 'min-h-[100px] resize-y' : ''}`}
            />
            {error?.en && <p className="text-sm text-red-500 mt-1">{error.en}</p>}
            <p className="text-xs text-gray-500 mt-1">{value.en.length} characters</p>
          </div>
        )}

        {activeTab === 'hi' && (
          <div>
            <InputComponent
              value={value.hi}
              onChange={(e) => onChange({ ...value, hi: e.target.value })}
              placeholder={placeholder.hi}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error?.hi ? 'border-red-500' : 'border-gray-300'
              } ${type === 'textarea' ? 'min-h-[100px] resize-y' : ''}`}
            />
            {error?.hi && <p className="text-sm text-red-500 mt-1">{error.hi}</p>}
            <p className="text-xs text-gray-500 mt-1">{value.hi.length} characters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BilingualInput;
