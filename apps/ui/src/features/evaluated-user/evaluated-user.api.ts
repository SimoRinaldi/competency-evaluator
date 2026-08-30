import { getAuthHeaders } from '../auth/auth.api';

const API_URL = 'http://localhost:3333/api';

export async function getAvailableTests() {
  const response = await fetch(`${API_URL}/tests`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore nel caricamento dei test');
  return response.json();
}

export async function getTestDetails(testId: string | number) {
  const response = await fetch(`${API_URL}/tests/${testId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore nel caricamento del test');
  return response.json();
}

export async function submitTestExecution(testId: number, userId: number, outputs: { name: string, description: string, url: string, version: string }[]) {
  // 1. Crea la test execution
  const executionRes = await fetch(`${API_URL}/test_executions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ test_id: testId, user_id: userId })
  });
  if (!executionRes.ok) throw new Error("Errore durante la creazione dell'esecuzione del test");
  const execution = await executionRes.json();

  // 2. Crea i test outputs associati
  for (const output of outputs) {
    const outRes = await fetch(`${API_URL}/test_outputs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...output,
        test_execution_id: execution.id
      })
    });
    if (!outRes.ok) throw new Error('Errore durante il salvataggio dei file output');
  }

  return execution;
}

export async function getUserExecutions(userId: number) {
  const response = await fetch(`${API_URL}/test_executions/by-user/${userId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore caricamento tue esecuzioni');
  return response.json();
}
