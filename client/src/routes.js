import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Core Pages
import NotFoundPage from './core/pages/NotFoundPage';

// Feature Pages - Use default imports to match the export style
const DashboardPage = lazy(() => import('./features/analytics/pages/DashboardPage'));
const ReceiptListPage = lazy(() => import('./features/receipts/pages/ReceiptListPage'));
const ReceiptDetailPage = lazy(() => import('./features/receipts/pages/ReceiptDetailPage'));
const ReportsPage = lazy(() => import('./features/analytics/pages/ReportsPage'));
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage'));

// Auth Components
import AuthGuard from './features/auth/components/AuthGuard';
import { ForgotPasswordPage } from './features/auth/components/ForgotPasswordPage';
import { LoginPage } from './features/auth/components/LoginPage';
import { RegisterPage } from './features/auth/components/RegisterPage';

// Shared Layout
import { Layout } from './shared/components/layout/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    errorElement: <NotFoundPage />,
    children: [
      // Main dashboard is the index route
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <DashboardPage />
          </Suspense>
        ),
      },
      
      // Receipt routes
      {
        path: 'receipts',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ReceiptListPage />
          </Suspense>
        ),
      },
      {
        path: 'receipts/:receiptId',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ReceiptDetailPage />
          </Suspense>
        ),
      },
      
      {
        path: 'reports',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ReportsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SettingsPage />
          </Suspense>
        ),
      },
      // Add other feature routes here (e.g., inventory)
    ],
  },
  // Auth routes are top-level
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
]);

export default router;
