import { createBrowserRouter } from 'react-router-dom';//correct
import { Layout } from '../../shared/components/layout/Layout';//correct
import { DashboardPage } from '../pages/DashboardPage';//correct
import { ReceiptsPage } from '../pages/ReceiptsPage';//correct
import { ReportsPage } from '../pages/ReportsPage';//correct
import { SettingsPage } from '../pages/SettingsPage';//correct
import { LoginPage } from '../../features/auth/components/LoginPage';//correct
import { RegisterPage } from '../../features/auth/components/RegisterPage';//correct
import { ForgotPasswordPage } from '../../features/auth/components/ForgotPasswordPage';//correct
import { NotFoundPage } from '../pages/NotFoundPage';//correct
import Protected from '../../features/auth/components/AuthGuard';//correct

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Protected>
        <Layout />
      </Protected>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'receipts',
        element: <ReceiptsPage />
      },
      {
        path: 'reports',
        element: <ReportsPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  }
]);

export default router;