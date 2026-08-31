const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export interface ApiCompetency {
  id: number;
  title: string;
  weight: number;
  threshold: number;
}

export interface ApiSubCompetency {
  id: number;
  title: string;
  weight: number;
  threshold: number;
  competency_id: number;
  input?: string;
  output?: string;
  action?: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TEST_DESIGNER' | 'EVALUATOR';
}

export interface ApiTestEvaluator {
  id: number;
  user_id: number;
  user?: ApiUser;
  tests?: { id: number }[];
}

export interface ApiEvaluatedUser {
  id: number;
  user_id: number;
  user?: ApiUser;
  test_executions?: { test_id: number }[];
}

export interface ApiTestDesigner {
  id: number;
  user_id: number;
  user?: ApiUser;
}

export interface ApiTest {
  id: number;
  assessment_situation: string;
  test_designer_id: number;
  test_designer?: ApiTestDesigner;
  subcompetencies?: ApiSubCompetency[];
  evaluators?: ApiTestEvaluator[];
  evaluated_users?: ApiUser[];
  evaluated_users_count?: number;
  evaluators_count?: number;
}

export interface CreateTestPayload {
  assessment_situation: string;
  test_designer_id: number;
  subcompetency_ids: number[];
  evaluator_ids?: number[];
  evaluated_user_ids?: number[];
}



export async function fetchCompetencies(): Promise<ApiCompetency[]> {
  const response = await fetch(`${API_URL}/competencies`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /competencies: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchSubCompetencies(): Promise<ApiSubCompetency[]> {
  const response = await fetch(`${API_URL}/subcompetencies`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /subcompetencies: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchUsers(role?: string): Promise<ApiUser[]> {
  const url = role ? `${API_URL}/users?role=${role}` : `${API_URL}/users`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /users: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchEvaluatedUsers(): Promise<ApiEvaluatedUser[]> {
  const response = await fetch(`${API_URL}/evaluated_users`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /evaluated_users: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchTestEvaluators(): Promise<ApiTestEvaluator[]> {
  const response = await fetch(`${API_URL}/test_evaluators`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /test_evaluators: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchTestDesigners(): Promise<ApiTestDesigner[]> {
  const response = await fetch(`${API_URL}/test_designers`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /test_designers: ${response.statusText}`);
  }
  return await response.json();
}

export async function createTest(payload: CreateTestPayload) {
  const response = await fetch(`${API_URL}/tests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Errore API sconosciuto' }));
    throw new Error(errorBody.message || `Errore API POST /tests: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteTest(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/tests/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Errore API sconosciuto' }));
    throw new Error(errorBody.message || `Errore API DELETE /tests: ${response.statusText}`);
  }
}



export interface ApiTestExecution {
  id: number;
  test_id: number;
  user_id: number;
  test_score?: string | number | null;
  max_score?: string | number | null;
  evaluated_user?: ApiEvaluatedUser;
  test_outputs?: any[];
}

export interface ApiTestDetails {
  test: ApiTest;
  competencyTitle: string;
  subcompetencies: ApiSubCompetency[];
  students: ApiUser[];
  evaluators: ApiUser[];
}

export async function fetchTestExecutionsByTestId(testId: number): Promise<ApiTestExecution[]> {
  const response = await fetch(`${API_URL}/test_executions/by-test/${testId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /test_executions/by-test: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchTestEvaluatorsByTestId(testId: number): Promise<ApiTestEvaluator[]> {
  const response = await fetch(`${API_URL}/test_evaluators/by-test/${testId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /test_evaluators/by-test: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchTestById(id: number): Promise<ApiTest> {
  const response = await fetch(`${API_URL}/tests/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /tests/${id}: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchTestDetails(testId: number): Promise<ApiTestDetails> {
  const [test, executions, evaluatorsList, allCompetencies, allSubCompetencies] = await Promise.all([
    fetchTestById(testId),
    fetchTestExecutionsByTestId(testId).catch(() => []),
    fetchTestEvaluatorsByTestId(testId).catch(() => []),
    fetchCompetencies().catch(() => []),
    fetchSubCompetencies().catch(() => []),
  ]);

  const subcompetencies = (test.subcompetencies || []).map((sub) => {
    const fullSub = allSubCompetencies.find((s) => String(s.id) === String(sub.id));
    return fullSub ? { ...fullSub, ...sub } : sub;
  });

  let competencyTitle = '-';
  if (subcompetencies.length > 0) {
    const firstSub = subcompetencies[0] as ApiSubCompetency & { competency?: ApiCompetency };
    if (firstSub.competency?.title) {
      competencyTitle = firstSub.competency.title;
    } else if (firstSub.competency_id) {
      const matchComp = allCompetencies.find((c) => String(c.id) === String(firstSub.competency_id));
      if (matchComp) competencyTitle = matchComp.title;
    }
  }

  const students: ApiUser[] = executions
    .map((exec) => exec.evaluated_user?.user)
    .filter((u): u is ApiUser => !!u);

  const evaluators: ApiUser[] = evaluatorsList
    .map((te) => te.user)
    .filter((u): u is ApiUser => !!u);

  return {
    test: { ...test, subcompetencies },
    competencyTitle,
    subcompetencies,
    students,
    evaluators,
  };
}

export async function fetchTests(): Promise<ApiTest[]> {
  const response = await fetch(`${API_URL}/tests`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /tests: ${response.statusText}`);
  }
  return await response.json();
}
