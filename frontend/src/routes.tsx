import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Administration from './pages/Administration'
import CustomerDetail from './pages/CustomerDetail'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import DataSnapshot from './pages/DataSnapshot'
import Login from './pages/Login'
import ModelSettings from './pages/ModelSettings'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/customers', element: <Customers /> },
          { path: '/customers/:id', element: <CustomerDetail /> },
          { path: '/settings', element: <ModelSettings /> },
          { path: '/data', element: <DataSnapshot /> },
          { path: '/administration', element: <Administration /> },
          { path: '/profile', element: <Profile /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])
