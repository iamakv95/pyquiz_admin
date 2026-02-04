import { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { storageService } from '../../services/storage.service';

interface ImageUploadProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  maxSize?: number; // in MB
  accept?: string;
}

const ImageUpload = ({
  label,
  value,
  onChange,
  bucket = 'question-images',
  maxSize = 5,
  accept = 'image/jpeg,image/png,image/webp',
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!accept.split(',').some(type => file.type.match(type.replace('*', '.*')))) {
      setError('Invalid file type');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const url = await storageService.uploadImage(file, bucket);
      onChange(url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await storageService.deleteImage(value, bucket);
        onChange(null);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded"
            className="max-w-xs max-h-48 rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-1">
                <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUpload;
