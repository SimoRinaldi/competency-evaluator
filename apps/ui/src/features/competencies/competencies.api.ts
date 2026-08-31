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

export async function createRubric(yes_no: boolean, levels: { description: string; rank: number }[]) {
  const response = await fetch(`${API_URL}/rubrics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ yes_no, levels }),
  });
  if (!response.ok) throw new Error('Errore durante la creazione della rubrica');
  return response.json();
}

export async function updateRubric(id: string | number, yes_no: boolean, levels: { id?: number; description: string; rank: number }[]) {
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
  if (!response.ok) throw new Error('Errore durante l\'eliminazione della rubrica');
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

export async function updateSubCompetency(id: number | string, data: any, obsId?: number | null) {
  let finalObsId = obsId;

  // 1. Gestione Observation Object
  if (finalObsId) {
    await fetch(`${API_URL}/observation-objects/${finalObsId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ description: data.obsDescription }),
    });
  } else {
    const res = await fetch(`${API_URL}/observation-objects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ description: data.obsDescription, subcompetency_id: Number(id) }),
    });
    if (res.ok) {
      const created = await res.json();
      finalObsId = created.id;
    }
  }

  // 2. Gestione Nuove Rubriche (Crea rubric sets dummy se non esistono endpoint completi per esse, o assumiamo siano db_)
  // Siccome il backend completo per salvare rubriche al volo potrebbe non esserci, mappiamo al meglio
  
  // 3. Gestione Indicatori
  if (finalObsId && data.indicators) {
    // Carica gli indicatori attuali per questo obs
    const obsRes = await fetch(`${API_URL}/observation-objects/${finalObsId}`, { headers: getAuthHeaders() });
    if (obsRes.ok) {
      const obsData = await obsRes.json();
      const currentIndicators = obsData.indicators || [];

      // Elimina tutti per rimpiazzarli (logica semplice)
      for (const ind of currentIndicators) {
        await fetch(`${API_URL}/indicators/${ind.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      }

      // Crea i nuovi
      for (const ind of data.indicators) {
        let rubricId = 1; // Default fallback
        if (ind.rubricId?.startsWith('db_')) {
          rubricId = parseInt(ind.rubricId.replace('db_', ''));
        }
        await fetch(`${API_URL}/indicators`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            description: ind.description,
            weight: parseInt(ind.weight),
            rubric_set_id: rubricId,
            observation_object_id: finalObsId
          }),
        });
      }
    }
  }

  return { success: true };
}

export async function getSubCompetencyById(id: number | string) {
  const [subRes, obsRes] = await Promise.all([
    fetch(`${API_URL}/subcompetencies/${id}`, { headers: getAuthHeaders() }),
    fetch(`${API_URL}/observation-objects`, { headers: getAuthHeaders() }),
  ]);
  
  if (!subRes.ok) throw new Error('Sottocompetenza non trovata');
  
  const subData = await subRes.json();
  let obsDescription = '';
  let indicators: any[] = [];
  let obsId = null;

  if (obsRes.ok) {
    const obsList = await obsRes.json();
    const myObs = obsList.find((o: any) => o.subcompetency_id === Number(id));
    if (myObs) {
      obsId = myObs.id;
      obsDescription = myObs.description || '';
      indicators = myObs.indicators?.map((ind: any) => ({
        id: ind.id,
        description: ind.description,
        weight: ind.weight,
        rubricId: `db_${ind.rubric_set_id}`,
      })) || [];
    }
  }

  return {
    ...subData,
    obsId,
    obsDescription,
    indicators,
  };
}

export async function fetchObservationObjects() {
  const response = await fetch(`${API_URL}/observation-objects`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Errore caricamento observation objects');
  return response.json();
}
