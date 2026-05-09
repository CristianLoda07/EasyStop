import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function AdminProtectedRoute({ fallback = <DefaultFallback /> }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && authChecked) {
      if (!isAuthenticated) {
        navigate('/');
      } else if (user?.role !== 'admin') {
        navigate('/');
      }
    }
  }, [isLoadingAuth, authChecked, isAuthenticated, user, navigate]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Accesso negato. Solo gli amministratori possono accedere a questa sezione.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <Outlet />;
}
