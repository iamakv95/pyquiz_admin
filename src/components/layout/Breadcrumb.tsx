import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    content: 'Content',
    exams: 'Exams',
    subjects: 'Subjects',
    topics: 'Topics',
    subtopics: 'Subtopics',
    questions: 'Questions',
    quizzes: 'Quizzes',
    tags: 'Tags',
    users: 'Users',
    analytics: 'Analytics',
    platform: 'Platform',
    reports: 'Reports',
    feedback: 'Feedback',
    settings: 'Settings',
    admins: 'Admin Management',
    system: 'System Config',
    'audit-logs': 'Audit Logs',
  };

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = breadcrumbNameMap[name] || name;

          return (
            <li key={name} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {isLast ? (
                <span className="text-gray-900 font-medium">{displayName}</span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
