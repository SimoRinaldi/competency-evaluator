import { getAuthHeaders } from '../auth/auth.api';

const API_URL = 'http://localhost:3333/api';

export async function createRubric(
  yes_no: boolean,
  levels: { description: string; rank: number }[],
) {
  const response = await fetch(`${API_URL}/rubrics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ yes_no, levels }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const msg = errData?.message || 'Errore durante la creazione della rubrica';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return response.json();
}

export async function updateRubric(
  id: string | number,
  yes_no: boolean,
  levels: { id?: number; description: string; rank: number }[],
) {
  const response = await fetch(`${API_URL}/rubrics/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ yes_no, levels }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const msg = errData?.message || 'Errore durante la modifica della rubrica';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return response.json();
}

export async function deleteRubric(id: string | number) {
  const response = await fetch(`${API_URL}/rubrics/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Errore durante l'eliminazione della rubrica");
  return response.json();
}

export async function checkRubricAssociations(id: string | number) {
  const response = await fetch(`${API_URL}/rubrics/${id}/check-associations`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Errore durante il controllo delle associazioni");
  return response.json();
}

export async function getRubricById(id: string | number) {
  const response = await fetch(`${API_URL}/rubrics/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore nel caricamento della rubrica');
  return response.json();
}

export async function fetchRubrics() {
  const response = await fetch(`${API_URL}/rubrics`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Errore nel caricamento delle rubriche');
  return response.json();
}
