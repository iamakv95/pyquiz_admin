import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="w-24 h-24 text-red-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">Access Forbidden</h2>
        <p className="text-gray-600 mt-2 mb-8 max-w-md mx-auto">
          You don't have permission to access this page. Please contact your administrator if you
          believe this is an error.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
