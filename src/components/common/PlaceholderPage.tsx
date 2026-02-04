import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Construction className="w-16 h-16 text-primary-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 max-w-md">
        {description || 'This page is under construction and will be available soon.'}
      </p>
      <div className="mt-6 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          This feature will be implemented in the next phase of development.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
