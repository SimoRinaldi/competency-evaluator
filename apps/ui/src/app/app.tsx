import { Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { AppLayout } from '../features/layouts/app-layout';

export function App() {
  return (
    <Routes>
      {/* Rotta pubblica per il login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Tutte le altre rotte saranno racchiuse nel Layout (che ha la navbar) */}
      <Route element={<AppLayout />}>
        {/* Questa è la rotta radice ("/") */}
        <Route 
          path="/" 
          element={
            <div className="bg-white p-6 rounded shadow">
              <h1 className="text-2xl font-bold mb-4">Benvenuto nella Dashboard</h1>
              <p className="text-gray-600">Qui inseriremo le funzionalità principali.</p>
            </div>
          } 
        />
        
        {/* Qui sotto in futuro aggiungeremo altre rotte, es. /utenti, /competenze ecc. */}
      </Route>
    </Routes>
  );
}

export default App;