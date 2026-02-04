import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { queryClient } from './config/reactQuery';
import { routes } from './config/routes';
import ProtectedRoute from './components/common/ProtectedRoute';
import { LoadingSpinner, ToastContainer } from './components/common';
import './App.css';

// Loading component
const PageLoader = () => <LoadingSpinner fullScreen text="Loading..." />;

// Recursive route renderer
const renderRoutes = (routeConfigs: typeof routes) => {
  return routeConfigs.map((route) => {
    const element = route.roles ? (
      <ProtectedRoute roles={route.roles}>{route.element}</ProtectedRoute>
    ) : (
      route.element
    );

    if (route.children) {
      return (
        <Route key={route.path} path={route.path} element={element}>
          {renderRoutes(route.children)}
        </Route>
      );
    }

    return <Route key={route.path} path={route.path} element={element} />;
  });
};

function App() {
  const { checkAuth } = useAuthStore();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <Suspense fallback={<PageLoader />}>
          <Routes>{renderRoutes(routes)}</Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
