import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/auth-context';
import { ProtectedRoute } from '../features/auth/protected-route';
import { PublicRoute } from '../features/auth/public-route';
import { LoginPage } from '../features/auth/login.page';
import { RegisterPage } from '../features/auth/register.page';
import { AppLayout } from '../features/layouts/app-layout';
import { CreateCompetencyPage } from '../features/competencies/create-competency.page';
import { Toaster } from '../components/ui/sonner';

const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded shadow">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">Questa pagina è in costruzione.</p>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        {/* Rotte pubbliche per ospiti (Login e Registrazione) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rotte protette (richiedono autenticazione / token salvato) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Rotta accessibile a tutti gli utenti loggati */}
            <Route
              path="/"
              element={
                <div className="bg-white p-6 rounded shadow">
                  <h1 className="text-2xl font-bold mb-4">
                    Pannello di controllo
                  </h1>
                  <p className="text-gray-600">
                    Benvenuto nella tua dashboard.
                  </p>
                </div>
              }
            />

            {/* Rotte esclusive per ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/competencies" element={<Placeholder title="Gestione Competenze" />} />
              <Route path="/competencies/new" element={<CreateCompetencyPage />} />
              <Route path="/rubrics" element={<Placeholder title="Gestione Rubriche" />} />
              <Route path="/users" element={<Placeholder title="Gestione Utenti" />} />
              <Route path="/tests-overview" element={<Placeholder title="Visualizzazione Test (Admin)" />} />
            </Route>

            {/* Rotte esclusive per TEST_DESIGNER */}
            <Route element={<ProtectedRoute allowedRoles={['TEST_DESIGNER']} />}>
              <Route path="/tests-management" element={<Placeholder title="Gestione Test" />} />
              <Route path="/indicators-management" element={<Placeholder title="Gestione Oggetto di Osservazione e Indicatori" />} />
            </Route>

            {/* Rotte esclusive per EVALUATOR */}
            <Route element={<ProtectedRoute allowedRoles={['EVALUATOR']} />}>
              <Route path="/evaluations/pending" element={<Placeholder title="Test da Valutare" />} />
              <Route path="/evaluations/completed" element={<Placeholder title="Test Valutati" />} />
            </Route>

            {/* Rotte esclusive per USER */}
            <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
              <Route path="/my-tests/todo" element={<Placeholder title="Test che devi ancora fare" />} />
              <Route path="/my-tests/pending" element={<Placeholder title="Test in attesa di valutazione" />} />
              <Route path="/my-tests/completed" element={<Placeholder title="Test valutati" />} />
              <Route path="/my-tests/history" element={<Placeholder title="Risultati storici" />} />
            </Route>

          </Route>
        </Route>

        {/* Rotta di fallback: reindirizza alla home (o al login se non autenticati) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
