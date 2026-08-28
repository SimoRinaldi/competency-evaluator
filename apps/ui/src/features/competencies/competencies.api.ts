const API_URL = 'http://localhost:3333/api';

// funzione per ottenere il token salvato dal login
function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

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
