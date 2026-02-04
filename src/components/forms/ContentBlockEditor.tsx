import { useState } from 'react';
import { Plus, GripVertical, Trash2, Image as ImageIcon, Type, MoveUp, MoveDown } from 'lucide-react';
import type { ContentBlock } from '../../types/content.types';
import { createTextBlock, createImageBlock, isTextBlock, isImageBlock } from '../../types/content.types';
import BilingualInput from './BilingualInput';
import ImageUpload from './ImageUpload';

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  label?: string;
  allowedTypes?: ('text' | 'image' | 'table')[];
  minBlocks?: number;
}

const ContentBlockEditor = ({
  blocks,
  onChange,
  label = 'Content',
  allowedTypes = ['text', 'image'],
  minBlocks = 1,
}: ContentBlockEditorProps) => {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set([0]));

  const addBlock = (type: 'text' | 'image') => {
    const newBlock = type === 'text' ? createTextBlock() : createImageBlock();
    const newBlocks = [...blocks, newBlock];
    onChange(newBlocks);
    setExpandedBlocks(new Set([...expandedBlocks, newBlocks.length - 1]));
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= minBlocks) {
      alert(`At least ${minBlocks} block(s) required`);
      return;
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
    const newExpanded = new Set(expandedBlocks);
    newExpanded.delete(index);
    setExpandedBlocks(newExpanded);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates } as ContentBlock;
    onChange(newBlocks);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedBlocks(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          {allowedTypes.includes('text') && (
            <button
              type="button"
              onClick={() => addBlock('text')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Type size={16} />
              Add Text
            </button>
          )}
          {allowedTypes.includes('image') && (
            <button
              type="button"
              onClick={() => addBlock('image')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <ImageIcon size={16} />
              Add Image
            </button>
          )}
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {blocks.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No content blocks yet. Add a text or image block to get started.</p>
          </div>
        )}

        {blocks.map((block, index) => {
          const isExpanded = expandedBlocks.has(index);
          
          return (
            <div
              key={index}
              className="border border-gray-300 rounded-lg bg-white shadow-sm"
            >
              {/* Block Header */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
                <button
                  type="button"
                  className="cursor-grab text-gray-400 hover:text-gray-600"
                  title="Drag to reorder"
                >
                  <GripVertical size={20} />
                </button>

                <div className="flex items-center gap-2 flex-1">
                  {isTextBlock(block) && (
                    <>
                      <Type size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Text Block {index + 1}
                      </span>
                      {block.content && (
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {block.content.substring(0, 50)}...
                        </span>
                      )}
                    </>
                  )}
                  {isImageBlock(block) && (
                    <>
                      <ImageIcon size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Image Block {index + 1}
                      </span>
                      {block.url && (
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {block.url.split('/').pop()}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move down"
                  >
                    <MoveDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Remove block"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Block Content */}
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {isTextBlock(block) && (
                    <BilingualInput
                      label="Text Content"
                      value={{ en: block.content, hi: block.content_hi }}
                      onChange={(value) =>
                        updateBlock(index, { content: value.en, content_hi: value.hi })
                      }
                      type="textarea"
                      required
                      placeholder={{
                        en: 'Enter text in English',
                        hi: 'हिंदी में पाठ दर्ज करें',
                      }}
                    />
                  )}

                  {isImageBlock(block) && (
                    <>
                      <ImageUpload
                        label="Image"
                        value={block.url}
                        onChange={(url) => updateBlock(index, { url: url || '' })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={block.alt || ''}
                            onChange={(e) => updateBlock(index, { alt: e.target.value })}
                            placeholder="Describe the image"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <BilingualInput
                        label="Caption (Optional)"
                        value={{ en: block.caption || '', hi: block.caption_hi || '' }}
                        onChange={(value) =>
                          updateBlock(index, { caption: value.en, caption_hi: value.hi })
                        }
                        type="text"
                        placeholder={{
                          en: 'Figure 1: Chart showing...',
                          hi: 'चित्र 1: चार्ट दिखा रहा है...',
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-medium text-blue-900 mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Use text blocks for paragraphs and explanations</li>
          <li>Use image blocks for charts, diagrams, and figures</li>
          <li>Arrange blocks in the order they should appear</li>
          <li>Add captions to images for better context</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentBlockEditor;
