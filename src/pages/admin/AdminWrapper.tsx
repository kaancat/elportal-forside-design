import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { Loader2 } from 'lucide-react';

/**
 * Admin wrapper component that handles authentication
 */
const AdminWrapper: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};

export default AdminWrapper;