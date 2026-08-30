const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export type Test = {
  id: number;
  assessment_situation: string;
  test_designer_id: number;
};

export type TestEvaluator = {
  id: number;
  user_id: number;
  tests: Test[];
};

export async function getEvaluatorProfile(userId: string | number): Promise<TestEvaluator> {
  const response = await fetch(`${API_URL}/test_evaluators/by-user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Profilo valutatore non trovato.");
    }
    throw new Error('Errore durante il caricamento del profilo valutatore');
  }
  return response.json();
}
export type TestExecution = {
  id: number;
  test_id: number;
  user_id: number;
  test_score: string | null;
  max_score: string | null;
  evaluated_user?: any;
};

export async function getTestExecutions(testId: string | number): Promise<TestExecution[]> {
  const response = await fetch(`${API_URL}/test_executions/by-test/${testId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore durante il caricamento delle esecuzioni');
  return response.json();
}
