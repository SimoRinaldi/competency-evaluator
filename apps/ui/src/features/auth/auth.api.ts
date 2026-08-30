export type UserRole = 'USER' | 'ADMIN' | 'TEST_DESIGNER' | 'EVALUATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const TOKEN_KEY = 'access_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const API_URL = 'http://localhost:3333/api';

function translateErrorMessage(msg: string): string {
  if (msg.includes('Credentials not valid')) return 'Credenziali non valide';
  if (msg.includes('Email already in use')) return 'Questa email è già in uso';
  if (msg.includes('password is not strong enough')) return 'La password non è abbastanza sicura';
  if (msg.includes('email must be an email')) return 'Inserisci un indirizzo email valido';
  return msg;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorMessage = 'Credenziali non valide';
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        const rawMsg = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
        errorMessage = translateErrorMessage(rawMsg);
      }
    } catch {
      // fallback to default error message
    }
    throw new Error(errorMessage);
  }

  const data: AuthResponse = await response.json();
  if (data.access_token) {
    setToken(data.access_token);
  }

  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!response.ok) {
    let errorMessage = 'Errore durante la registrazione. Controlla i dati.';
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        const rawMsg = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
        errorMessage = translateErrorMessage(rawMsg);
      }
    } catch {
      // fallback to default error message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function fetchCurrentUser(): Promise<User> {
  const token = getToken();

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

export async function updateProfile(name: string, email: string, oldPassword?: string, newPassword?: string): Promise<User> {
  const token = getToken();
  
  const payload: any = { name, email };
  if (oldPassword && newPassword) {
    payload.oldPassword = oldPassword;
    payload.newPassword = newPassword;
  }

  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore durante l\'aggiornamento del profilo');
  }

  return response.json();
}
