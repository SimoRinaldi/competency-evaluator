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
}

export interface ApiEvaluatedUser {
  id: number;
  user_id: number;
  user?: ApiUser;
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
  executions_count?: number;
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



export async function fetchTestExecutionsByTestId(testId: number): Promise<any[]> {
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

export async function fetchTests(): Promise<ApiTest[]> {
  const response = await fetch(`${API_URL}/tests`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Errore API /tests: ${response.statusText}`);
  }
  return await response.json();
}
