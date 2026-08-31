import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/auth-context';
import { ProtectedRoute } from '../features/auth/protected-route';
import { PublicRoute } from '../features/auth/public-route';
import { LoginPage } from '../features/auth/login.page';
import { RegisterPage } from '../features/auth/register.page';
import { AppLayout } from '../features/layouts/app-layout';
import { CreateCompetencyPage } from '../features/competencies/create-competency.page';
import { FeedbackProvider } from '../providers/feedback-provider';
import { PageContainer } from '../components/page-container';
import { UserTestsPage } from '../features/evaluated-user/user-tests.page';
import { EvaluatorTestsPage } from '../features/evaluator/evaluator-tests.page';
import { TestEvaluationPage } from '../features/evaluator/test-evaluation.page';
import { HistoricalScoresPage } from '../features/evaluated-user/historical-scores.page';
import { TestsManagementPage } from '../features/tests/tests-management.page';
import { CreateTestPage } from '../features/tests/create-test.page';
import { IndicatorsManagementPage } from '../features/tests/indicators-management.page';
import { EditCompetencyPage } from '../features/competencies/edit-competency.page';
import { AdminDashboardPage } from '../features/admin/dashboard.page';
import { UsersDashboardPage } from '../features/admin/users-dashboard.page';
import { UserFormPage } from '../features/admin/user-form.page';
import { RubricsDashboardPage } from '../features/admin/rubrics-dashboard.page';
import { useAuth } from '../features/auth/auth-context';

const Placeholder = ({ title }: { title: string }) => (
  <PageContainer title={title} description="Questa pagina � in costruzione.">
    <div className="flex items-center justify-center h-64 bg-slate-50 border border-dashed rounded-lg text-slate-500">
      Contenuto in arrivo...
    </div>
  </PageContainer>
);

const RoleRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Placeholder title="Caricamento..." />;

  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/competencies" replace />;
    case 'TEST_DESIGNER':
      return <Navigate to="/tests-management" replace />;
    case 'EVALUATOR':
      return <Navigate to="/evaluations/pending" replace />;
    case 'USER':
      return <Navigate to="/my-tests/todo" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

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
              {/* Rotta accessibile a tutti gli utenti loggati
              <Route
                path="/"
                element={
                  <PageContainer
                    title="Pannello di controllo"
                    description="Benvenuto nella tua dashboard."
                  >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Novità</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Nessun nuovo aggiornamento.
                        </p>
                      </div>
                    </div>
                  </PageContainer>
                }
              />
              */}
              <Route path="/" element={<RoleRedirect />} />

              {/* Rotte esclusive per ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/competencies" element={<AdminDashboardPage />} />
                <Route path="/competencies/new" element={<CreateCompetencyPage />} />
                <Route path="/competencies/edit/:id" element={<EditCompetencyPage />} />
                <Route path="/rubrics" element={<RubricsDashboardPage />} />
                <Route path="/users" element={<UsersDashboardPage />} />
                <Route path="/users/new" element={<UserFormPage />} />
                <Route path="/users/edit/:id" element={<UserFormPage />} />
                <Route path="/tests-overview" element={<TestsManagementPage readOnly={true} />} />
              </Route>

              {/* Rotte esclusive per TEST_DESIGNER */}
              <Route element={<ProtectedRoute allowedRoles={['TEST_DESIGNER']} />}>
                <Route path="/tests-management" element={<TestsManagementPage />} />
                <Route path="/tests/new" element={<CreateTestPage />} />
                <Route
                  path="/indicators-management"
                  element={<IndicatorsManagementPage />}
                />
              </Route>

              {/* Rotte esclusive per EVALUATOR */}
              <Route element={<ProtectedRoute allowedRoles={['EVALUATOR']} />}>
                <Route
                  path="/evaluations/pending"
                  element={<EvaluatorTestsPage filter="pending" />}
                />
                <Route
                  path="/evaluations/completed"
                  element={<EvaluatorTestsPage filter="completed" />}
                />
                <Route path="/evaluator/tests/:id" element={<TestEvaluationPage />} />
              </Route>

              {/* Rotte esclusive per USER */}
              <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
                <Route path="/my-tests/todo" element={<UserTestsPage filter="todo" />} />
                <Route path="/my-tests/completed" element={<UserTestsPage filter="completed" />} />
                <Route path="/my-tests/history" element={<HistoricalScoresPage />} />
              </Route>
            </Route>

            {/* Rotta di fallback: reindirizza alla home (o al login se non autenticati) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </FeedbackProvider>
  );
}

export default App;
