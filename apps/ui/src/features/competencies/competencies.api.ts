import { getAuthHeaders } from '../auth/auth.api';

const API_URL = 'http://localhost:3333/api';

export async function createCompetency(title: string, weight: number) {
  const response = await fetch(`${API_URL}/competencies`, {
    method: 'POST',
    headers: getAuthHeaders(), // gli header con il token
    body: JSON.stringify({ title, weight }),
  });

  if (!response.ok) throw new Error('Dati non validi');

  return response.json();
}

export async function createRubric(
  yes_no: boolean,
  levels: { description: string; rank: number }[],
) {
  const response = await fetch(`${API_URL}/rubrics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ yes_no, levels }),
  });
  if (!response.ok) throw new Error('Errore durante la creazione della rubrica');
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

export async function fetchTools() {
  const response = await fetch(`${API_URL}/tools`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore nel caricamento dei tools');
  return response.json();
}

export async function fetchMethods() {
  const response = await fetch(`${API_URL}/methods`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore nel caricamento dei methods');
  return response.json();
}

export async function fetchSkills() {
  const response = await fetch(`${API_URL}/skills`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Errore nel caricamento delle skills');
  return response.json();
}
export async function getCompetencyById(id: string | number) {
  const response = await fetch(`${API_URL}/competencies/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Competenza non trovata');
  return response.json();
}

export async function updateCompetency(
  id: string | number,
  title: string,
  weight: number,
  threshold: number,
) {
  const response = await fetch(`${API_URL}/competencies/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, weight, threshold }),
  });
  if (!response.ok) throw new Error("Errore durante l'aggiornamento della competenza");
  return response.json();
}
export async function getCompetencies() {
  const response = await fetch(`${API_URL}/competencies`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore nel caricamento delle competenze');
  return response.json();
}

export async function createCompetencyChain(payload: any) {
  const response = await fetch(`${API_URL}/competencies_management/chain`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Errore durante la creazione della competenza');
  }

  return response.json();
}

export async function updateCompetencyChain(id: string | number, payload: any) {
  const response = await fetch(`${API_URL}/competencies_management/chain/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Errore durante l'aggiornamento della competenza");
  }

  return response.json();
}

export async function getSubCompetencyById(id: string | number) {
  const response = await fetch(`${API_URL}/subcompetencies/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Sottocompetenza non trovata');
  return response.json();
}

export async function updateSubCompetency(id: string | number, payload: any, obsId?: number | null) {
  const response = await fetch(`${API_URL}/subcompetencies/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Errore durante l\'aggiornamento della sottocompetenza');
  }
  return response.json();
}

