import { createBrowserRouter } from 'react-router-dom';

// Core Pages (like NotFound)
import NotFoundPage from './core/pages/NotFoundPage'; // Correct

// Feature Pages - Updated Paths
import { DashboardPage } from './features/analytics/pages/DashboardPage'; // Corrected Path
import { ReceiptDetailPage } from './features/receipts/pages/ReceiptDetailPage'; // Assuming this is the main page for receipts now
import { ReportsPage } from './features/analytics/pages/ReportsPage'; // Corrected Path
import { SettingsPage } from './features/settings/pages/SettingsPage'; // Corrected Path
// Note: Need a main page component for the '/receipts' path if ReceiptDetailPage is only for specific IDs.
// Let's assume a ReceiptListPage exists for now, or adjust the route.
// For now, let's point '/receipts' to ReceiptDetailPage - this might need adjustment later.

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
      { index: true, element: <DashboardPage /> }, 
      // Assuming /receipts shows details for now, might need a list page later
      { path: 'receipts', element: <ReceiptListPage /> }, // Use the new list page for /receipts
      // Route for specific receipt details
      { path: 'receipts/:receiptId', element: <ReceiptDetailPage /> }, 
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      // Add other feature routes here (e.g., inventory)
    ],
  },
  // Auth routes are top-level
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  // Catch-all for unmatched routes (optional, depends on desired behavior)
  // { path: '*', element: <NotFoundPage /> } 
]);

export default router;
