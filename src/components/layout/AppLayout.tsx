import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';

const AppLayout = () => {
  const { theme } = useUIStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Hide breadcrumb on dashboard
  const showBreadcrumb = location.pathname !== '/dashboard';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Breadcrumb - Hidden on Dashboard */}
        {showBreadcrumb && <Breadcrumb />}

        {/* Page Content */}
        <main className="p-6">
          <div
            className={`rounded-lg shadow-sm p-6 ${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
