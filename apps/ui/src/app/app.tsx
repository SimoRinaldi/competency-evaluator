import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/auth-context';
import { ProtectedRoute } from '../features/auth/protected-route';
import { PublicRoute } from '../features/auth/public-route';
import { LoginPage } from '../features/auth/login.page';
import { RegisterPage } from '../features/auth/register.page';
import { AppLayout } from '../features/layouts/app-layout';
import { CreateCompetencyPage } from '../features/competencies/create-competency.page';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotte pubbliche per ospiti (Login e Registrazione) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rotte protette (richiedono autenticazione / token salvato) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <div className="bg-white p-6 rounded shadow">
                  <h1 className="text-2xl font-bold mb-4">
                    Benvenuto nella Dashboard
                  </h1>
                  <p className="text-gray-600">
                    Qui inseriremo le funzionalità principali.
                  </p>
                </div>
              }
            />
            <Route path="/competencies/new" element={<CreateCompetencyPage />} />
            {/* Altre rotte protette future */}
          </Route>
        </Route>

        {/* Rotta di fallback: reindirizza alla home (o al login se non autenticati) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
