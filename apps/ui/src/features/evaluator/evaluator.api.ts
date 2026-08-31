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
export type RubricLevel = { id: number; rank: number; title: string; description: string; };
export type RubricSet = { id: number; yes_no: boolean; levels: RubricLevel[]; };
export type Indicator = { id: number; description: string; weight: number; rubric_set: RubricSet; };
export type ObservationObject = { id: number; description: string; indicators: Indicator[]; };
export type SubCompetency = { id: number; title: string; weight: number; observation_object: ObservationObject; };

export type FullTest = Test & {
  subcompetencies: SubCompetency[];
};

export async function getFullTest(testId: string | number): Promise<FullTest> {
  const response = await fetch(`${API_URL}/tests/${testId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore caricamento test');
  return response.json();
}

export async function getTestExecutionById(executionId: string | number): Promise<TestExecution & { test_outputs?: any[] }> {
  const response = await fetch(`${API_URL}/test_executions/${executionId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore caricamento test execution');
  return response.json();
}

export async function submitEvaluation(data: { 
  test_execution_id: number; 
  evaluator_id?: number; 
  evaluations: Array<{ indicator_id: number; rubric_rank: number }> 
}) {
  const response = await fetch(`${API_URL}/tests_evaluation/evaluate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore salvataggio valutazione');
  }
  return response.json();
}

export async function updateTestExecution(id: number | string, data: { test_score?: string; max_score?: string }) {
  const response = await fetch(`${API_URL}/test_executions/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Errore aggiornamento test execution');
  return response.json();
}
