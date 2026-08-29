const API_URL = 'http://localhost:3333/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export interface ApiCompetency {
  id: number;
  title: string;
  weight: number;
  threshold: number;
}

export interface ApiSubCompetency {
  id: number;
  title: string;
  weight: number;
  threshold: number;
  competency_id: number;
  input?: string;
  output?: string;
  action?: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TEST_DESIGNER' | 'EVALUATOR';
}

export interface ApiTestEvaluator {
  id: number;
  user_id: number;
  user?: ApiUser;
}

export interface ApiTestDesigner {
  id: number;
  user_id: number;
  user?: ApiUser;
}

export interface CreateTestPayload {
  assessment_situation: string;
  test_designer_id: number;
  subcompetency_ids: number[];
  evaluator_ids?: number[];
  evaluated_user_ids?: number[];
}

// ==========================================
// DATI MOCK DI FALLBACK (CONFORMI ALLE ENTITÀ)
// ==========================================

export const MOCK_COMPETENCIES: ApiCompetency[] = [
  {
    id: 1,
    title: 'Sviluppo Web e Architetture Software',
    weight: 4,
    threshold: 60,
  },
  {
    id: 2,
    title: 'Database Design e Ottimizzazione Query',
    weight: 3,
    threshold: 50,
  },
  {
    id: 3,
    title: 'Sicurezza delle Applicazioni Web e Autenticazione',
    weight: 5,
    threshold: 70,
  },
];

export const MOCK_SUBCOMPETENCIES: ApiSubCompetency[] = [
  {
    id: 101,
    title: 'Creazione di API RESTful con NestJS',
    weight: 2,
    threshold: 60,
    competency_id: 1,
    input: 'Specifiche API e contratti Swagger',
    action: 'Implementazione controller, service e dto',
    output: 'Endpoints funzionanti e testati',
  },
  {
    id: 102,
    title: 'Gestione dello Stato e Componenti con React',
    weight: 2,
    threshold: 60,
    competency_id: 1,
    input: 'Design mockups e requisiti interazione utente',
    action: 'Sviluppo componenti UI modulari con React hooks',
    output: 'Interfaccia reattiva e accessibile',
  },
  {
    id: 103,
    title: 'Integrazione Client-Server tramite Axios',
    weight: 1,
    threshold: 50,
    competency_id: 1,
    input: 'Contratti di rete e token JWT',
    action: 'Configurazione client HTTP e gestione errori',
    output: 'Flusso dati asincrono stabile',
  },
  {
    id: 104,
    title: 'Configurazione Build System e Monorepo con Nx',
    weight: 2,
    threshold: 55,
    competency_id: 1,
    input: 'Requisiti di architettura modulare',
    action: 'Impostazione workspace Nx, project graphs e caching',
    output: 'Pipeline di build e test ottimizzata',
  },
  {
    id: 201,
    title: 'Modellazione Entità e Relazioni con TypeORM',
    weight: 3,
    threshold: 55,
    competency_id: 2,
    input: 'Schema concettuale e requisiti di dominio',
    action: 'Definizione entity TypeORM, vincoli e indici',
    output: 'Schema database relazionale consistente',
  },
  {
    id: 202,
    title: 'Scrittura ed Esecuzione di Migrazioni',
    weight: 2,
    threshold: 50,
    competency_id: 2,
    input: 'Modifiche allo schema esistente',
    action: 'Generazione e applicazione file di migrazione',
    output: 'Database aggiornato in modo non distruttivo',
  },
  {
    id: 203,
    title: 'Ottimizzazione Query SQL e Execution Plan',
    weight: 3,
    threshold: 65,
    competency_id: 2,
    input: 'Query lente e log di esecuzione DB',
    action: 'Indicizzazione mirata e refactoring delle join',
    output: 'Tempi di risposta delle query conformi agli SLA',
  },
  {
    id: 301,
    title: 'Autenticazione con JWT e Strategie Passport',
    weight: 3,
    threshold: 70,
    competency_id: 3,
    input: 'Credenziali utente e requisiti di sessione',
    action: 'Configurazione JWT Guard, LocalStrategy e hashing bcrypt',
    output: 'Flusso di autenticazione sicuro',
  },
  {
    id: 302,
    title: 'Controllo degli Accessi Basato sui Ruoli (RBAC)',
    weight: 2,
    threshold: 65,
    competency_id: 3,
    input: 'Matrice permessi e ruoli utente',
    action: 'Applicazione di decoratori e role guards su endpoint protetti',
    output: 'Protezione delle risorse da accessi non autorizzati',
  },
  {
    id: 303,
    title: 'Sanitizzazione Input e Prevenzione Injection',
    weight: 3,
    threshold: 75,
    competency_id: 3,
    input: 'Dati forniti dall utente da form e request body',
    action: 'Configurazione validation pipes e parameterized queries',
    output: 'Resistenza agli attacchi di iniezione',
  },
];

export const MOCK_USERS: ApiUser[] = [
  { id: 1, name: 'Mario Rossi', email: 'mario.rossi@example.com', role: 'USER' },
  { id: 2, name: 'Giulia Bianchi', email: 'giulia.bianchi@example.com', role: 'USER' },
  { id: 3, name: 'Luca Verdi', email: 'luca.verdi@example.com', role: 'USER' },
  { id: 4, name: 'Chiara Esposito', email: 'chiara.esposito@example.com', role: 'USER' },
  { id: 5, name: 'Alessandro Moretti', email: 'alessandro.moretti@example.com', role: 'USER' },
  { id: 6, name: 'Francesca Romano', email: 'francesca.romano@example.com', role: 'USER' },
  { id: 7, name: 'Matteo Colombo', email: 'matteo.colombo@example.com', role: 'USER' },
  { id: 8, name: 'Federica Ricci', email: 'federica.ricci@example.com', role: 'USER' },
  { id: 9, name: 'Davide Marino', email: 'davide.marino@example.com', role: 'USER' },
  { id: 10, name: 'Sara Greco', email: 'sara.greco@example.com', role: 'USER' },
  { id: 16, name: 'Prof. Marco Ferrari', email: 'marco.ferrari@example.com', role: 'EVALUATOR' },
  { id: 17, name: 'Dott.ssa Elena Galli', email: 'elena.galli@example.com', role: 'EVALUATOR' },
  { id: 18, name: 'Ing. Roberto Conti', email: 'roberto.conti@example.com', role: 'EVALUATOR' },
  { id: 19, name: 'Prof.ssa Anna Serra', email: 'anna.serra@example.com', role: 'EVALUATOR' },
  { id: 20, name: 'Dott. Stefano Bellini', email: 'stefano.bellini@example.com', role: 'EVALUATOR' },
  { id: 21, name: 'Prof. Giovanni Testa', email: 'giovanni.testa@example.com', role: 'TEST_DESIGNER' },
];

export async function fetchCompetencies(): Promise<ApiCompetency[]> {
  try {
    const response = await fetch(`${API_URL}/competencies`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API /competencies non raggiungibile o non autorizzata. Utilizzo mockup.', err);
  }
  return MOCK_COMPETENCIES;
}

export async function fetchSubCompetencies(): Promise<ApiSubCompetency[]> {
  try {
    const response = await fetch(`${API_URL}/subcompetencies`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API /subcompetencies non raggiungibile o non autorizzata. Utilizzo mockup.', err);
  }
  return MOCK_SUBCOMPETENCIES;
}

export async function fetchUsers(role?: string): Promise<ApiUser[]> {
  try {
    const url = role ? `${API_URL}/users?role=${role}` : `${API_URL}/users`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API /users non raggiungibile o non autorizzata. Utilizzo mockup.', err);
  }
  return role ? MOCK_USERS.filter((u) => u.role === role) : MOCK_USERS;
}

export async function fetchTestEvaluators(): Promise<ApiTestEvaluator[]> {
  try {
    const response = await fetch(`${API_URL}/test_evaluators`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('API /test_evaluators non raggiungibile. Utilizzo mockup.', err);
  }
  return [];
}

export async function fetchTestDesigners(): Promise<ApiTestDesigner[]> {
  try {
    const response = await fetch(`${API_URL}/test_designers`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('API /test_designers non raggiungibile. Utilizzo mockup.', err);
  }
  return [];
}

export async function createTest(payload: CreateTestPayload) {
  try {
    const response = await fetch(`${API_URL}/tests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    }

    const errorBody = await response.json().catch(() => ({ message: 'Errore API' }));
    console.warn('Server ha risposto con errore su POST /tests. Simulazione successo mock.', errorBody);
  } catch (err) {
    console.warn('Server non raggiungibile su POST /tests. Simulazione salvataggio mock.', err);
  }

  // Simulazione creazione test riuscita (fallback mock se il backend o jwt fallisce)
  return {
    id: Math.floor(Math.random() * 1000) + 1,
    assessment_situation: payload.assessment_situation,
    test_designer_id: payload.test_designer_id,
    subcompetencies: payload.subcompetency_ids.map((id) => ({ id })),
  };
}
