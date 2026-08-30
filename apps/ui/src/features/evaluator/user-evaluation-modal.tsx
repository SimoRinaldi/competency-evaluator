import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Check, Send, FileText, Download } from 'lucide-react';
import { fetchCurrentUser } from '../auth/auth.api';
import { 
  getEvaluatorProfile, 
  getFullTest, 
  getTestExecutionById, 
  submitEvaluation, 
  FullTest, 
  TestExecution 
} from './evaluator.api';

export interface UserEvaluationModalProps {
  testId: string | number | null;
  executionId: string | number | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function UserEvaluationModal({
  testId,
  executionId,
  isOpen,
  onClose,
  onSubmitted,
}: UserEvaluationModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [test, setTest] = useState<FullTest | null>(null);
  const [execution, setExecution] = useState<TestExecution & { test_outputs?: any[] } | null>(null);
  const [evaluatorId, setEvaluatorId] = useState<number | null>(null);

  const [evaluations, setEvaluations] = useState<Record<number, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && testId && executionId) {
      loadData(testId, executionId);
    } else {
      setTest(null);
      setExecution(null);
      setError(null);
      setSaving(false);
      setEvaluations({});
      setShowConfirm(false);
    }
  }, [isOpen, testId, executionId]);

  async function loadData(tId: string | number, eId: string | number) {
    setLoading(true);
    setError(null);
    try {
      const user = await fetchCurrentUser();
      const profile = await getEvaluatorProfile(user.id);
      setEvaluatorId(profile.id);

      const currentTest = await getFullTest(String(tId));
      setTest(currentTest);

      const currentExecution = await getTestExecutionById(String(eId));
      setExecution(currentExecution);
    } catch (err: any) {
      setError(err?.message || "Impossibile caricare i dati di valutazione.");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectLevel = (indicatorId: number, rank: number) => {
    setEvaluations(prev => ({
      ...prev,
      [indicatorId]: rank
    }));
  };

  const totalIndicators = test?.subcompetencies?.flatMap(sc => sc.observation_object?.indicators || []).length || 0;
  const evaluatedCount = Object.keys(evaluations).length;
  const isComplete = totalIndicators > 0 && evaluatedCount === totalIndicators;

  const handleValidation = () => {
    if (!isComplete) {
      setError("Devi compilare tutte le valutazioni per ogni indicatore.");
      return;
    }
    setError(null);
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    if (!evaluatorId || !test) return;
    setSaving(true);
    setShowConfirm(false);
    setError(null);

    try {
      const promises = Object.entries(evaluations).map(([indicatorId, rank]) => {
        return submitEvaluation({
          rubric_rank: rank,
          indicator_id: Number(indicatorId),
          test_execution_id: Number(executionId),
          evaluator_id: evaluatorId
        });
      });

      await Promise.all(promises);
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio della valutazione.");
      setSaving(false);
    }
  };

  const isEvaluated = execution?.test_score !== null && execution?.test_score !== undefined;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[95vw] xl:max-w-[1000px] w-full max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
          
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Valutazione Utente
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-1">
              {isEvaluated 
                ? "Questa esecuzione è già stata valutata in precedenza."
                : "Esamina l'esecuzione dell'utente e assegna un livello per ciascun indicatore della rubrica. Tutte le scelte sono obbligatorie."}
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-slate-500">Caricamento della scheda...</p>
              </div>
            ) : error && !saving && !isComplete ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            ) : test && execution ? (
              <div className="space-y-8">
                
                {/* Dati utente */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dati utente</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-1">
                    <span className="text-sm text-slate-700 font-medium">Nome: <span className="font-normal text-slate-600">{execution.evaluated_user?.user?.name || "N/D"}</span></span>
                    <span className="text-sm text-slate-700 font-medium">Email: <span className="font-normal text-slate-600">{execution.evaluated_user?.user?.email || "N/D"}</span></span>
                  </div>
                </div>

                {/* Descrizione Test */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Descrizione Test</h3>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {test.assessment_situation}
                    </p>
                  </div>
                </div>

                {/* File dell'utente */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">File Consegnati</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    {execution.test_outputs && execution.test_outputs.length > 0 ? (
                      <div className="space-y-3">
                        {execution.test_outputs.map((out: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-slate-400" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700">{out.name}</span>
                                {out.description && <span className="text-xs text-slate-500">{out.description}</span>}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2" type="button">
                              <Download className="h-4 w-4" /> Scarica file
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Nessun file caricato per questa esecuzione.</p>
                    )}
                  </div>
                </div>

                {/* Sottocompetenze e Indicatori */}
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  {/* Rimossa la riga del titolo e progresso in base alla richiesta */}

                  {test.subcompetencies?.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Nessuna sottocompetenza associata.</p>
                  ) : (
                    <div className="space-y-10">
                      {test.subcompetencies?.map((sc) => (
                        <div key={sc.id} className="space-y-6">
                          <h4 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                            {sc.title}
                          </h4>
                          
                          <div className="space-y-8 pl-1">
                            {sc.observation_object?.indicators?.map((indicator) => (
                              <div key={indicator.id} className="space-y-4">
                                <p className="text-base font-semibold text-slate-700">
                                  {indicator.description}
                                </p>
                                
                                <RadioGroup 
                                  value={String(evaluations[indicator.id] || "")} 
                                  onValueChange={(val) => handleSelectLevel(indicator.id, Number(val))}
                                  disabled={isEvaluated}
                                  className="flex flex-col gap-1.5 mt-1"
                                >
                                  {indicator.rubric_set?.levels?.map((level) => {
                                    const isSelected = evaluations[indicator.id] === level.rank;
                                    return (
                                      <FieldLabel 
                                        key={level.id}
                                        htmlFor={`indicator-${indicator.id}-level-${level.rank}`}
                                        className={`px-3 py-2 rounded-md border transition-all cursor-pointer ${
                                          isSelected
                                            ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500"
                                            : isEvaluated 
                                              ? "border-slate-200 opacity-60 cursor-not-allowed" 
                                              : "border-slate-200 hover:border-sky-300 hover:bg-slate-50"
                                        }`}
                                      >
                                        <Field orientation="horizontal" className="flex items-center justify-between w-full">
                                          <FieldContent className="flex-1 pr-3">
                                            <FieldTitle className={`text-xs font-bold ${isSelected ? "text-sky-800" : "text-slate-700"}`}>
                                              {level.description || level.title || `Livello ${level.rank}`}
                                            </FieldTitle>
                                            <FieldDescription className={`text-[11px] mt-0.5 leading-tight font-medium ${isSelected ? "text-slate-700" : "text-slate-500"}`}>
                                              Livello {level.rank} {level.title && level.description ? ` - ${level.title}` : ""}
                                            </FieldDescription>
                                          </FieldContent>
                                          <div className="flex-shrink-0 flex items-center">
                                            <RadioGroupItem 
                                              value={String(level.rank)} 
                                              id={`indicator-${indicator.id}-level-${level.rank}`} 
                                              className={`h-3.5 w-3.5 ${isSelected ? "border-sky-600 text-sky-600" : ""}`}
                                            />
                                          </div>
                                        </Field>
                                      </FieldLabel>
                                    );
                                  })}
                                </RadioGroup>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && !saving && isComplete && (
                  <p className="text-sm text-destructive font-medium">{error}</p>
                )}

              </div>
            ) : null}
          </div>

          <DialogFooter className="p-4 md:p-5 border-t border-slate-100 flex flex-row items-center justify-end bg-slate-50/50 gap-2 mt-auto">
            <Button type="button" variant="outline" onClick={onClose} className="px-6 border-slate-300 text-slate-700">
              {isEvaluated ? "Chiudi" : "Annulla"}
            </Button>
            {!isEvaluated && (
              <Button
                type="button"
                disabled={saving || loading || !isComplete}
                onClick={handleValidation}
                className="px-6"
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvataggio...</>
                ) : (
                  <><Check className="mr-2 h-4 w-4" /> Conferma Valutazione</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-sky-600" />
              Confermi la valutazione?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Stai per salvare i voti per questo utente. Assicurati che le selezioni siano corrette.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Torna indietro</AlertDialogCancel>
            <AlertDialogAction onClick={executeSubmit} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Salva Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
