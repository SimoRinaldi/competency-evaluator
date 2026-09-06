import { getAuthHeaders } from '../auth/auth.api';

const API_URL = 'http://localhost:3333/api';

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
