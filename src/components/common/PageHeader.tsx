import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

const PageHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions,
  breadcrumbs,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-3" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
                {crumb.path ? (
                  <button
                    onClick={() => navigate(crumb.path!)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-900 font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
