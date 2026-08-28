import { Outlet, useNavigate, Link } from 'react-router-dom';

export function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('access_token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar superiore */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">
            <Link to="/">Competency Evaluator</Link>
          </div>
          
          <div className="flex gap-4 items-center">
            <Link to="/" className="hover:text-blue-200">Dashboard</Link>
            <button 
              onClick={handleLogout} 
              className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
            >
              Esci
            </button>
          </div>
        </div>
      </nav>

      {/* Contenuto principale delle pagine */}
      <main className="container mx-auto flex-grow p-4 mt-4">
        {/* L'Outlet è il segnaposto dove react-router renderizzerà le nostre pagine (es. Dashboard) */}
        <Outlet />
      </main>
    </div>
  );
}
