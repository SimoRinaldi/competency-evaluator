import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';
import {
  getAvailableTestsByUserId,
  getUserExecutions,
} from './evaluated-user.api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

export function EvaluatedUserDashboardPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const user = await fetchCurrentUser();

        // carichiamo tutti i test disponibili per l'utente
        const allTests = await getAvailableTestsByUserId(user.id);
        setTests(allTests);

        // carichiamo le esecuzioni di questo utente
        const myExecs = await getUserExecutions(user.id);
        setExecutions(myExecs);
      } catch (err: any) {
        setError(err.message || 'Errore nel caricamento della dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Funzione helper per controllare se l'utente ha già svolto un test
  const getExecutionForTest = (testId: number) => {
    return executions.find((ex) => ex.test_id === testId);
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">La Mia Area Test</h1>
        <p className="text-muted-foreground mt-2">
          Scegli un test da svolgere o controlla i risultati di quelli già completati.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10">Caricamento in corso...</div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>
      ) : tests.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground">Nessun test disponibile al momento.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => {
            const execution = getExecutionForTest(test.id);
            const isCompleted = !!execution;
            const isEvaluated = isCompleted && execution.test_score !== null;

            return (
              <Card key={test.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Test #{test.id}</CardTitle>
                    {isEvaluated ? (
                      <span className="flex items-center text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Valutato
                      </span>
                    ) : isCompleted ? (
                      <span className="flex items-center text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                        In Valutazione
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        Nuovo
                      </span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-3">
                    {test.assessment_situation}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4 flex-grow">
                  {isEvaluated && (
                    <div className="bg-muted p-3 rounded-md mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Punteggio:</span>
                      <span className="text-sm font-bold text-primary">
                        {execution.test_score} / {execution.max_score}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {isCompleted ? (
                    <Button className="w-full" variant="secondary" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Esecuzione Inviata
                    </Button>
                  ) : (
                    <Link to={`/evaluated-user/tests/${test.id}`} className="w-full">
                      <Button className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" /> Svolgi Test
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
