import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Save, Check } from "lucide-react";
import { fetchCurrentUser } from "../auth/auth.api";
import { 
  getEvaluatorProfile, 
  getFullTest, 
  getTestExecutionById, 
  submitEvaluation, 
  FullTest, 
  TestExecution 
} from "./evaluator.api";

export function UserEvaluationPage() {
  const { id, executionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [test, setTest] = useState<FullTest | null>(null);
  const [execution, setExecution] = useState<TestExecution & { test_outputs?: any[] } | null>(null);
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);

  // Mappa indicator_id -> livello selezionato (rubric_rank)
  const [evaluations, setEvaluations] = useState<Record<number, number>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const user = await fetchCurrentUser();
        const profile = await getEvaluatorProfile(user.id);
        setEvaluatorId(profile.id);

        const currentTest = await getFullTest(id as string);
        setTest(currentTest);

        const currentExecution = await getTestExecutionById(executionId as string);
        setExecution(currentExecution);

      } catch (err: any) {
        setError(err.message || "Impossibile caricare i dati di valutazione.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, executionId]);

  const handleSelectLevel = (indicatorId: number, rank: number) => {
    setEvaluations(prev => ({
      ...prev,
      [indicatorId]: rank
    }));
  };

  const handleSave = async () => {
    if (!evaluatorId || !test) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      // Per ogni indicatore valutato, inviamo una chiamata al backend
      const promises = Object.entries(evaluations).map(([indicatorId, rank]) => {
        return submitEvaluation({
          rubric_rank: rank,
          indicator_id: Number(indicatorId),
          test_execution_id: Number(executionId),
          evaluator_id: evaluatorId
        });
      });

      await Promise.all(promises);
      setSuccessMsg("Valutazione salvata con successo!");
      
      // Dopo 2 secondi torniamo alla pagina del test
      setTimeout(() => {
        navigate(`/evaluator/tests/${id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio della valutazione.");
    } finally {
      setSaving(false);
    }
  };

  // Calcolo di quanti indicatori sono stati valutati rispetto al totale
  const totalIndicators = test?.subcompetencies?.flatMap(sc => sc.observation_object?.indicators || []).length || 0;
  const evaluatedCount = Object.keys(evaluations).length;
  const isComplete = totalIndicators > 0 && evaluatedCount === totalIndicators;

  return (
    <div className="p-8 w-full max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link to={`/evaluator/tests/${id}`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valutazione Utente #{execution?.user_id}</h1>
          <p className="text-muted-foreground mt-2">
            Studente: <span className="font-semibold text-foreground">{execution?.evaluated_user?.user?.name || "N/D"}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Caricamento scheda di valutazione...</div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>File dell'Utente</CardTitle>
              <CardDescription>
                Scarica i documenti caricati dallo studente per questa prova.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {execution?.test_outputs && execution.test_outputs.length > 0 ? (
                execution.test_outputs.map((output, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{output.name}</span>
                      {output.description && (
                        <span className="text-xs text-muted-foreground">{output.description}</span>
                      )}
                    </div>
                    {output.url ? (
                      <a href={output.url} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" /> Scarica
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Nessun file/URL allegato</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Nessun file caricato dall'utente.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Rubrica di Valutazione</h2>
              <div className="text-sm">
                Progresso: <span className="font-bold">{evaluatedCount} / {totalIndicators}</span>
              </div>
            </div>
            
            {test?.subcompetencies?.length === 0 ? (
              <div className="text-muted-foreground italic">Nessuna sottocompetenza associata a questo test.</div>
            ) : (
              test?.subcompetencies?.map((sc) => (
                <Card key={sc.id} className="border-l-4 border-l-primary overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg">{sc.title}</CardTitle>
                    {sc.observation_object && (
                      <CardDescription>Oggetto di osservazione: {sc.observation_object.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    {sc.observation_object?.indicators?.map((indicator) => (
                      <div key={indicator.id} className="p-6 border-t border-border first:border-t-0">
                        <div className="mb-4">
                          <h4 className="font-semibold text-foreground text-sm">Indicatore:</h4>
                          <p className="text-muted-foreground">{indicator.description}</p>
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mt-4">
                          {indicator.rubric_set?.levels?.map((level) => {
                            const isSelected = evaluations[indicator.id] === level.rank;
                            return (
                              <button
                                key={level.id}
                                onClick={() => handleSelectLevel(indicator.id, level.rank)}
                                className={`text-left p-4 rounded-md border-2 transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`font-bold text-lg ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                                    Lvl {level.rank}
                                  </span>
                                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </div>
                                <div className={`text-xs ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                  {level.description}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Barra inferiore fissa per il salvataggio */}
      {!loading && !error && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-md z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              {successMsg && <span className="text-green-600 font-medium flex items-center gap-2"><Check className="h-4 w-4"/> {successMsg}</span>}
              {!successMsg && !isComplete && (
                <span className="text-amber-600 text-sm">Completa la valutazione di tutti gli indicatori per proseguire.</span>
              )}
            </div>
            <div className="flex gap-3">
              <Link to={`/evaluator/tests/${id}`}>
                <Button variant="outline">Annulla</Button>
              </Link>
              <Button 
                onClick={handleSave} 
                disabled={!isComplete || saving || successMsg !== ""}
              >
                {saving ? "Salvataggio in corso..." : "Salva Valutazione Definitiva"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
