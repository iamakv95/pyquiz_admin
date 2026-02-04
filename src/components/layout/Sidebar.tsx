import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  AlertCircle,
  Settings,
  BookOpen,
  HelpCircle,
  FileQuestion,
  ListChecks,
  Tags,
  ChevronDown,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import { useState } from 'react';
import clsx from 'clsx';
import logoBlack from '../../assets/pyqlogo_black.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  permission?: any;
  children?: MenuItem[];
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { role } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['content']);

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/dashboard',
      permission: PERMISSIONS.VIEW_DASHBOARD,
    },
    {
      title: 'Content',
      icon: <FileText className="w-5 h-5" />,
      permission: PERMISSIONS.VIEW_CONTENT,
      children: [
        {
          title: 'Overview',
          icon: <LayoutDashboard className="w-4 h-4" />,
          path: '/content',
          permission: PERMISSIONS.VIEW_CONTENT,
        },
        {
          title: 'Exams',
          icon: <BookOpen className="w-4 h-4" />,
          path: '/content/exams',
          permission: PERMISSIONS.VIEW_CONTENT,
        },
        {
          title: 'Subjects',
          icon: <FileText className="w-4 h-4" />,
          path: '/content/subjects',
          permission: PERMISSIONS.VIEW_CONTENT,
        },
        {
          title: 'Topics',
          icon: <ListChecks className="w-4 h-4" />,
          path: '/content/topics',
          permission: PERMISSIONS.VIEW_CONTENT,
        },
        {
          title: 'Subtopics',
          icon: <ListChecks className="w-4 h-4" />,
          path: '/content/subtopics',
          permission: PERMISSIONS.VIEW_CONTENT,
        },
        {
          title: 'Questions',
          icon: <HelpCircle className="w-4 h-4" />,
          path: '/content/questions',
          permission: PERMISSIONS.VIEW_QUESTIONS,
        },
        {
          title: 'Quizzes',
          icon: <FileQuestion className="w-4 h-4" />,
          path: '/content/quizzes',
          permission: PERMISSIONS.VIEW_QUIZZES,
        },
        {
          title: 'Daily Quizzes',
          icon: <Calendar className="w-4 h-4" />,
          path: '/content/daily-quizzes',
          permission: PERMISSIONS.VIEW_QUIZZES,
        },
        {
          title: 'Tags',
          icon: <Tags className="w-4 h-4" />,
          path: '/content/tags',
          permission: PERMISSIONS.VIEW_CONTENT,
        },
      ],
    },
    {
      title: 'Users',
      icon: <Users className="w-5 h-5" />,
      path: '/users',
      permission: PERMISSIONS.VIEW_USERS,
    },
    {
      title: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      permission: PERMISSIONS.VIEW_ANALYTICS,
      children: [
        {
          title: 'Platform',
          icon: <BarChart3 className="w-4 h-4" />,
          path: '/analytics/platform',
          permission: PERMISSIONS.VIEW_ANALYTICS,
        },
        {
          title: 'Questions',
          icon: <HelpCircle className="w-4 h-4" />,
          path: '/analytics/questions',
          permission: PERMISSIONS.VIEW_ANALYTICS,
        },
        {
          title: 'Quizzes',
          icon: <FileQuestion className="w-4 h-4" />,
          path: '/analytics/quizzes',
          permission: PERMISSIONS.VIEW_ANALYTICS,
        },
        {
          title: 'Topics',
          icon: <ListChecks className="w-4 h-4" />,
          path: '/analytics/topics',
          permission: PERMISSIONS.VIEW_ANALYTICS,
        },
      ],
    },
    {
      title: 'Reports',
      icon: <AlertCircle className="w-5 h-5" />,
      permission: PERMISSIONS.VIEW_REPORTS,
      children: [
        {
          title: 'Question Reports',
          icon: <AlertCircle className="w-4 h-4" />,
          path: '/reports/questions',
          permission: PERMISSIONS.VIEW_REPORTS,
        },
        {
          title: 'Feedback',
          icon: <AlertCircle className="w-4 h-4" />,
          path: '/reports/feedback',
          permission: PERMISSIONS.VIEW_REPORTS,
        },
      ],
    },
    {
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      permission: PERMISSIONS.VIEW_CONFIG,
      children: [
        {
          title: 'Admin Management',
          icon: <Users className="w-4 h-4" />,
          path: '/settings/admins',
          permission: PERMISSIONS.VIEW_ADMINS,
        },
        {
          title: 'System Config',
          icon: <Settings className="w-4 h-4" />,
          path: '/settings/system',
          permission: PERMISSIONS.VIEW_CONFIG,
        },
        {
          title: 'Audit Logs',
          icon: <FileText className="w-4 h-4" />,
          path: '/settings/audit-logs',
          permission: PERMISSIONS.VIEW_AUDIT_LOGS,
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    // Check permission
    if (item.permission && !hasPermission(role, item.permission)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.title);

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleMenu(item.title)}
            className={clsx(
              'w-full flex items-center justify-between px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg cursor-pointer',
              level > 0 && 'pl-8'
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path!}
        onClick={onClose}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer',
            level > 0 && 'pl-8',
            isActive
              ? 'bg-primary-50 text-primary-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          )
        }
      >
        {item.icon}
        <span>{item.title}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out',
          'w-64 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-200">
          <img 
            src={logoBlack} 
            alt="PyQuiz Logo" 
            className="h-8 w-auto object-contain"
          />
          <h1 className="text-3xl font-semibold text-gray-900">Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
