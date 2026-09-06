import { getAuthHeaders } from '../auth/auth.api';

const API_URL = 'http://localhost:3333/api';

export async function getAvailableTests() {
  const response = await fetch(`${API_URL}/tests`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore nel caricamento dei test');
  return response.json();
}

export async function getAvailableTestsByUserId(user_id: string | number) {
  const response = await fetch(`${API_URL}/tests/user/${user_id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Errore nel caricamento dei test dell'utente");
  return response.json();
}

export async function getTestDetails(testId: string | number) {
  const response = await fetch(`${API_URL}/tests/${testId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore nel caricamento del test');
  return response.json();
}

export async function getTestEvaluators(testId: string | number) {
  const response = await fetch(`${API_URL}/test_evaluators/by-test/${testId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return [];
  return response.json();
}

export async function submitTestExecution(
  testId: number,
  userId: number,
  outputs: { name: string; description: string; url: string; version: string }[],
  existingExecutionId?: number,
) {
  let executionId = existingExecutionId;

  if (!executionId) {
    // 1. Crea la test execution se non esiste
    const executionRes = await fetch(`${API_URL}/test_executions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ test_id: testId, user_id: userId }),
    });
    if (!executionRes.ok) throw new Error("Errore durante la creazione dell'esecuzione del test");
    const execution = await executionRes.json();
    executionId = execution.id;
  }

  // 2. Crea i test outputs associati
  for (const output of outputs) {
    const outRes = await fetch(`${API_URL}/test_outputs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...output,
        test_execution_id: executionId,
      }),
    });
    if (!outRes.ok) throw new Error('Errore durante il salvataggio dei file output');
  }

  return { id: executionId };
}

export async function getUserExecutions(userId: string | number) {
  const response = await fetch(`${API_URL}/test_executions/by-user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return [];
  return response.json();
}

export async function getBestCompetencyScores(userId: string | number): Promise<any[]> {
  const response = await fetch(`${API_URL}/best_competency_score/by-user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore nel caricamento dei punteggi delle competenze');
  return response.json();
}

export async function getBestSubCompetencyScores(userId: string | number): Promise<any[]> {
  const response = await fetch(`${API_URL}/best_subcompetency_score/by-user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return [];
  return response.json();
}

export interface UserSubCompetencyEvaluation {
  competency_id: number;
  subcompetency_id: number;
  threshold: number;
  title: string;
  score_absolute: number | null;
  score_percentage: string | null;
  acquired?: boolean;
}

export interface UserCompetencyEvaluation {
  competency_id: number;
  title: string;
  threshold: number;
  score_absolute: number | null;
  score_percentage: string | null;
  subcompetencies: UserSubCompetencyEvaluation[];
}

export interface BestScoresResponse {
  acquired_competencies: UserCompetencyEvaluation[];
  unacquired_competencies: UserCompetencyEvaluation[];
}

export async function getBestScores(userId: string | number): Promise<BestScoresResponse> {
  const response = await fetch(`${API_URL}/best_scores/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore nel caricamento dei punteggi');
  return response.json();
}
