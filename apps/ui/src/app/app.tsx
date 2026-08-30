import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/auth-context';
import { ProtectedRoute } from '../features/auth/protected-route';
import { PublicRoute } from '../features/auth/public-route';
import { LoginPage } from '../features/auth/login.page';
import { RegisterPage } from '../features/auth/register.page';
import { AppLayout } from '../features/layouts/app-layout';
import { CreateCompetencyPage } from '../features/competencies/create-competency.page';
import { CreateTestPage } from '../features/tests/create-test.page';
import { FeedbackProvider } from '../providers/feedback-provider';
import { PageContainer } from '../components/page-container';

const Placeholder = ({ title }: { title: string }) => (
  <PageContainer title={title} description="Questa pagina è in costruzione.">
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
      Contenuto in arrivo...
    </div>
  </PageContainer>
);

export function App() {
  return (
    <FeedbackProvider>
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
            {/* Rotta accessibile a tutti gli utenti loggati */}
            <Route
              path="/"
              element={
                <PageContainer title="Pannello di controllo" description="Benvenuto nella tua dashboard.">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                      <h3 className="font-semibold leading-none tracking-tight">Novità</h3>
                      <p className="text-sm text-muted-foreground mt-2">Nessun nuovo aggiornamento.</p>
                    </div>
                  </div>
                </PageContainer>
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
              <Route path="/tests/new" element={<CreateTestPage />} />
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
    </FeedbackProvider>
  );
}

export default App;
