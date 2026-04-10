import { Outlet } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { Toaster } from '../components/ui/sonner';

export function Root() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-gray-50">
          <Outlet />
          <Toaster />
        </div>
      </DataProvider>
    </AuthProvider>
  );
}
