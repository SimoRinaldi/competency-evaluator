const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export type UserRole = 'ADMIN' | 'USER' | 'TEST_DESIGNER' | 'EVALUATOR';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore nel caricamento degli utenti');
  return response.json();
}

export async function getUserById(id: string | number): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Utente non trovato');
  return response.json();
}

export async function updateUser(
  id: string | number,
  data: { name?: string; email?: string; role?: UserRole }
) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Errore durante l\'aggiornamento dell\'utente');
  return response.json();
}

export async function deleteUser(id: string | number) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore durante l\'eliminazione dell\'utente');
  return response.json();
}
export async function createUser(data: any) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Errore durante la creazione dell\'utente');
  return response.json();
}
