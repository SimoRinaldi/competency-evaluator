import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import { Button } from '../../components/ui/button';

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b">
        <div
          className="font-bold text-lg cursor-pointer text-slate-900"
          onClick={() => navigate('/')}
        >
          Competency Evaluator
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>Dashboard</Button>
          
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-slate-600 font-medium">
                {user.name} ({user.role})
              </span>
            )}
            <Button variant="destructive" onClick={handleLogout}>
              Esci
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-8 flex justify-center items-start">
        <Outlet />
      </main>
    </div>
  );
}
