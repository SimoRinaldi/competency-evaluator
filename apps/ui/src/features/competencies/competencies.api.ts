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

export const checkCompetencyAssociations = async (id: number): Promise<{ isAssociated: boolean }> => {
  const response = await fetch(`${API_URL}/competencies/check-associations/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Errore durante il controllo delle associazioni");
  }
  return response.json();
};

export const deleteCompetency = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/competencies/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Errore durante l'eliminazione della competenza");
  }
};

export async function getSubCompetencies() {
  const response = await fetch(`${API_URL}/subcompetencies`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore nel caricamento delle sottocompetenze');
  return response.json();
}

export async function getSubCompetencyById(id: string | number) {
  const response = await fetch(`${API_URL}/subcompetencies/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Sottocompetenza non trovata');
  return response.json();
}

export async function updateSubCompetencyObservationObject(
  id: string | number,
  payload: any,
) {
  const response = await fetch(
    `${API_URL}/competencies_management/subcompetency/${id}/observation-object`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message ||
        "Errore durante l'aggiornamento dell'oggetto di osservazione",
    );
  }
  return response.json();
}

