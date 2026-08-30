import { getAuthHeaders } from '../auth/auth.api';

const API_URL = 'http://localhost:3333/api';

export async function createCompetency(
  title: string,
  weight: number,
  threshold: number
) {
  const response = await fetch(`${API_URL}/competencies`, {
    method: 'POST',
    headers: getAuthHeaders(), // gli header con il token
    body: JSON.stringify({ title, weight, threshold }),
  });

  if (!response.ok) throw new Error('Dati non validi');

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
  threshold: number
) {
  const response = await fetch(`${API_URL}/competencies/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, weight, threshold }),
  });
  if (!response.ok) throw new Error('Errore durante l\'aggiornamento della competenza');
  return response.json();
}
export async function getCompetencies() {
  const response = await fetch(`${API_URL}/competencies`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore nel caricamento delle competenze');
  return response.json();
}
