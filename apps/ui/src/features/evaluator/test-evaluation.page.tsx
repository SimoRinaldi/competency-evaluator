import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTestExecutions, TestExecution, Test } from "./evaluator.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, Circle } from "lucide-react";
import { fetchCurrentUser } from "../auth/auth.api";
import { getEvaluatorProfile } from "./evaluator.api";

export function TestEvaluationPage() {
  const { id } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Recupera il test dal profilo del valutatore (per avere il situation_assessment)
        const user = await fetchCurrentUser();
        const profile = await getEvaluatorProfile(user.id);
        const currentTest = profile.tests.find(t => t.id === Number(id));
        
        if (!currentTest) {
          throw new Error("Test non trovato o non assegnato a te.");
        }
        setTest(currentTest);

        // Recupera le esecuzioni degli utenti per questo test
        const execs = await getTestExecutions(id as string);
        setExecutions(execs);
      } catch (err: any) {
        setError(err.message || "Errore nel caricamento dei dati.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/evaluator">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valutazione Test #{id}</h1>
          <p className="text-muted-foreground mt-2">
            Visualizza i dettagli del test e valuta gli utenti.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Caricamento in corso...</div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          {error}
        </div>
      ) : (
        <div className="grid gap-8">
          {/* Situation Assessment */}
          <div className="rounded-md border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Situation Assessment</h2>
            <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-wrap">
              {test?.assessment_situation}
            </div>
          </div>

          {/* Tabella Utenti */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Utenti da Valutare ({executions.length})</h2>
            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utente ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Stato Valutazione</TableHead>
                    <TableHead className="text-right">Azione</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nessun utente ha ancora svolto questo test.
                      </TableCell>
                    </TableRow>
                  ) : (
                    executions.map((exec) => {
                      const isEvaluated = exec.test_score !== null && exec.test_score !== undefined;
                      const userDetails = exec.evaluated_user?.user;
                      
                      return (
                        <TableRow key={exec.id}>
                          <TableCell className="font-medium">#{exec.user_id}</TableCell>
                          <TableCell>{userDetails?.name || "Utente Sconosciuto"}</TableCell>
                          <TableCell>{userDetails?.email || "N/D"}</TableCell>
                          <TableCell>
                            {isEvaluated ? (
                              <div className="flex items-center text-green-600 gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Completata ({exec.test_score}/{exec.max_score})
                              </div>
                            ) : (
                              <div className="flex items-center text-amber-600 gap-2">
                                <Circle className="h-4 w-4" /> Da valutare
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/evaluator/tests/${id}/execution/${exec.id}`}>
                              <Button variant={isEvaluated ? "outline" : "default"} size="sm">
                                {isEvaluated ? "Rivedi" : "Valuta"}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
