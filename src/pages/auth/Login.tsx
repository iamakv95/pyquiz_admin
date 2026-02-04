import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Lock, 
  LogIn, 
  AlertCircle, 
  X,
  Copy,
  Check
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';
import logoBlack from '../../assets/pyqlogo_black.png';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<LoginFormValues>({
    email: '',
    password: '',
    remember: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<LoginFormValues>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormValues> = {};

    if (!formData.email) {
      errors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Please enter your password';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    const success = await login(formData.email, formData.password);

    if (success) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  const handleInputChange = (field: keyof LoginFormValues, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof Partial<LoginFormValues>]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 p-5">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={logoBlack} 
                alt="PyQuiz Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PyQuiz Admin</h1>
            <p className="text-gray-600">Sign in to manage your platform</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Login Failed</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Forgot Password View */}
          {showForgotPassword ? (
            <div className="animate-fade-in">
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">Password Reset</h3>
                  <p className="text-sm text-blue-700">
                    Please contact your system administrator to reset your password.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="admin@pyquiz.com"
                      autoComplete="email"
                      className={clsx(
                        'block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
                        formErrors.email
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      )}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={clsx(
                        'block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
                        formErrors.password
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      )}
                    />
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.remember}
                      onChange={(e) => handleInputChange('remember', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white transition-all',
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg hover:shadow-xl cursor-pointer'
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-500">Admin access only</p>
                <p className="text-xs text-gray-500">Contact your administrator for access</p>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">© 2026 PyQuiz. All rights reserved.</p>
          </div>
        </div>

        {/* Demo Credentials Card */}
        <div className="mt-6 bg-white/95 backdrop-blur rounded-xl shadow-lg p-4 animate-fade-in">
          <p className="font-semibold text-gray-900 mb-3">Demo Credentials</p>
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Super Admin:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded border border-gray-200">
                admin@pyquiz.com
              </code>
              <button
                onClick={() => copyToClipboard('admin@pyquiz.com', 'email')}
                className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                title="Copy email"
              >
                {copiedField === 'email' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded border border-gray-200">
                password123
              </code>
              <button
                onClick={() => copyToClipboard('password123', 'password')}
                className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                title="Copy password"
              >
                {copiedField === 'password' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
