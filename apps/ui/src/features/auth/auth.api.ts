export type UserRole = 'USER' | 'ADMIN' | 'TEST_DESIGNER' | 'EVALUATOR';

const API_URL = 'http://localhost:3333/api';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Credenziali non valide');

  const data = await response.json();

  localStorage.setItem('access_token', data.access_token);

  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole
) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!response.ok)
    throw new Error('Errore durante la registrazione. Controlla i dati.');

  return response.json();
}

export async function fetchCurrentUser() {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }

  return response.json();
}
