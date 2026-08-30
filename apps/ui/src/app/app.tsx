import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/auth-context';
import { ProtectedRoute } from '../features/auth/protected-route';
import { PublicRoute } from '../features/auth/public-route';
import { LoginPage } from '../features/auth/login.page';
import { RegisterPage } from '../features/auth/register.page';
import { AppLayout } from '../features/layouts/app-layout';
import { CreateCompetencyPage } from '../features/competencies/create-competency.page';
import { EvaluatorDashboardPage } from '../features/evaluator/evaluator-dashboard.page';
import { TestEvaluationPage } from '../features/evaluator/test-evaluation.page';
import { UserEvaluationPage } from '../features/evaluator/user-evaluation.page';

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
                <Navigate to="/evaluator" replace />
              }
            />
            <Route path="/competencies/new" element={<CreateCompetencyPage />} />
            
            {/* Rotte Valutatore */}
            <Route path="/evaluator" element={<EvaluatorDashboardPage />} />
            <Route path="/evaluator/tests/:id" element={<TestEvaluationPage />} />
            <Route path="/evaluator/tests/:id/execution/:executionId" element={<UserEvaluationPage />} />
            
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
