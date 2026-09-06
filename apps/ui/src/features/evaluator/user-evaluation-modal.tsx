import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2, AlertCircle, Check, Send, FileText, Download, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { fetchCurrentUser } from '../auth/auth.api';
import { 
  getEvaluatorProfile, 
  getFullTest, 
  getTestExecutionById, 
  submitEvaluation, 
  updateTestExecution,
  getEvaluationsForExecution,
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
  const [hasAlreadyEvaluated, setHasAlreadyEvaluated] = useState(false);
  const [activeStep, setActiveStep] = useState<string>("info");

  useEffect(() => {
    if (isOpen && testId && executionId) {
      loadData(testId, executionId);
      setActiveStep("info");
    } else {
      setTest(null);
      setExecution(null);
      setError(null);
      setSaving(false);
      setEvaluations({});
      setHasAlreadyEvaluated(false);
      setShowConfirm(false);
      setActiveStep("info");
    }
  }, [isOpen, testId, executionId]);

  async function loadData(tId: string | number, eId: string | number) {
    setLoading(true);
    setError(null);
    try {
      const user = await fetchCurrentUser();
      const profile = await getEvaluatorProfile(user.id);
      setEvaluatorId(profile.id);

      const [currentTest, currentExecution, previousEvaluations] = await Promise.all([
        getFullTest(String(tId)),
        getTestExecutionById(String(eId)),
        getEvaluationsForExecution(String(eId)).catch(() => ({}))
      ]);
      
      setTest(currentTest);
      setExecution(currentExecution);
      setEvaluations(previousEvaluations);
      setHasAlreadyEvaluated(Object.keys(previousEvaluations).length > 0);
    } catch (err: any) {
      setError(err?.message || "Impossibile caricare i dati di valutazione.");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectLevel = (indicatorId: number, rank: number) => {
    if (hasAlreadyEvaluated) return;
    setEvaluations(prev => ({
      ...prev,
      [indicatorId]: rank
    }));
  };

  const totalIndicators = test?.subcompetencies?.flatMap(sc => sc.observation_object?.indicators || []).length || 0;
  const evaluatedCount = Object.keys(evaluations).length;
  const isComplete = totalIndicators > 0 && evaluatedCount === totalIndicators;

  const handleValidation = () => {
    if (hasAlreadyEvaluated) return;
    if (!isComplete) {
      setError("Devi compilare tutte le valutazioni per ogni indicatore.");
      return;
    }
    setError(null);
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    if (!evaluatorId || !test || !executionId || hasAlreadyEvaluated) return;
    setSaving(true);
    setShowConfirm(false);
    setError(null);

    try {
      const evaluationsArray = Object.entries(evaluations).map(([indicatorId, rank]) => ({
        indicator_id: Number(indicatorId),
        rubric_rank: rank,
      }));

      await submitEvaluation({
        test_execution_id: Number(executionId),
        evaluator_id: evaluatorId,
        evaluations: evaluationsArray,
      });

      // Il ricalcolo dei punteggi (test_score e max_score) avviene automaticamente sul backend
      // quando TUTTI i valutatori assegnati al test hanno inviato le loro valutazioni.
      // Non è necessario inviare un aggiornamento manuale da qui.
      
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio della valutazione.");
      setSaving(false);
    }
  };

  const isEvaluated = execution?.test_score !== null && execution?.test_score !== undefined;
  const isReadOnly = hasAlreadyEvaluated || isEvaluated;

  const steps = useMemo(() => {
    const list = [{ id: "info", label: "Dati valutazione" }];
    if (test?.subcompetencies) {
      test.subcompetencies.forEach(sc => {
        list.push({ id: `sc-${sc.id}`, label: sc.title });
      });
    }
    return list;
  }, [test]);

  const currentIndex = steps.findIndex(s => s.id === activeStep);
  const handleNext = () => {
    if (currentIndex < steps.length - 1) setActiveStep(steps[currentIndex + 1].id);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setActiveStep(steps[currentIndex - 1].id);
  };

  const getStepStatus = (stepId: string) => {
    if (stepId === "info") return "completed";
    if (stepId.startsWith("sc-")) {
      const scId = Number(stepId.replace("sc-", ""));
      const sc = test?.subcompetencies?.find(s => s.id === scId);
      if (!sc || !sc.observation_object?.indicators) return "pending";
      const total = sc.observation_object.indicators.length;
      if (total === 0) return "completed";
      const evaluated = sc.observation_object.indicators.filter(ind => evaluations[ind.id] !== undefined).length;
      if (evaluated === total) return "completed";
      if (evaluated > 0) return "partial";
      return "pending";
    }
    return "pending";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[95vw] xl:max-w-[1200px] w-full max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
          
          <DialogHeader className="p-6 pb-4 border-b border-slate-200 bg-white shrink-0">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Valutazione {execution?.evaluated_user?.user?.name || "Utente"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0 bg-white">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
              <div className="flex-1 overflow-y-auto p-4 max-h-[200px] md:max-h-none">
                <nav className="flex flex-col gap-1.5">
                  {steps.map((step, idx) => {
                    const status = getStepStatus(step.id);
                    const isActive = activeStep === step.id;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveStep(step.id)}
                        className={`text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 relative overflow-hidden group ${
                          isActive 
                            ? "bg-white shadow-sm border border-slate-200 text-primary font-bold" 
                            : "text-slate-600 hover:bg-slate-100 border border-transparent font-medium"
                        }`}
                      >
                        <div className="flex flex-col flex-1 truncate">
                          <span className="truncate">{step.label}</span>
                          {step.id !== "info" && (
                            <span className="text-[10px] mt-0.5 text-slate-400">
                              {status === 'completed' ? 'Completato' : status === 'partial' ? 'In corso...' : 'Da valutare'}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-slate-500">Caricamento della scheda...</p>
                  </div>
                ) : test && execution ? (
                  <div className="max-w-3xl mx-auto">
                    {activeStep === "info" && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-6">Dati valutazione</h2>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Dati utente */}
                            <div className="space-y-3">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidato</h3>
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Nome</span>
                                  <span className="text-base text-slate-900 font-medium">{execution.evaluated_user?.user?.name || "N/D"}</span>
                                </div>
                                <div className="flex flex-col mt-2">
                                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Email</span>
                                  <span className="text-sm text-slate-700">{execution.evaluated_user?.user?.email || "N/D"}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* File dell'utente */}
                            <div className="space-y-3">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">File Consegnati</h3>
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-[134px] overflow-y-auto">
                                {execution.test_outputs && execution.test_outputs.length > 0 ? (
                                  <div className="space-y-3">
                                    {execution.test_outputs.map((out: any, i: number) => (
                                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                          <FileText className="h-5 w-5 text-primary" />
                                          <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700">{out.name}</span>
                                          </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center">
                                    <p className="text-sm text-slate-500 italic">Nessun file caricato.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Descrizione Test */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrizione test</h3>
                          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <p className="text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {test.assessment_situation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep.startsWith("sc-") && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {(() => {
                          const scId = Number(activeStep.replace("sc-", ""));
                          const sc = test.subcompetencies?.find(s => s.id === scId);
                          if (!sc) return null;
                          return (
                            <>
                              <div className="pb-4 border-b border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-800">{sc.title}</h2>
                                <p className="text-slate-500 mt-2">Valuta gli indicatori di questa sottocompetenza.</p>
                              </div>

                              {!sc.observation_object?.indicators || sc.observation_object.indicators.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">Nessun indicatore configurato.</p>
                              ) : (
                                <div className="space-y-10">
                                  {sc.observation_object.indicators.map((indicator) => (
                                    <div key={indicator.id} className="space-y-4">
                                      <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                                        <p className="text-[15px] font-bold text-slate-900">
                                          {indicator.description}
                                        </p>
                                      </div>
                                      
                                      <RadioGroup 
                                        value={String(evaluations[indicator.id] || "")} 
                                        onValueChange={(val) => handleSelectLevel(indicator.id, Number(val))}
                                        disabled={isReadOnly}
                                        className="flex flex-col gap-4 pl-1 pt-1"
                                      >
                                        {indicator.rubric_set?.levels?.map((level) => {
                                          const isSelected = evaluations[indicator.id] === level.rank;
                                          return (
                                            <div key={level.id} className="flex items-start gap-3 group">
                                              <RadioGroupItem 
                                                value={String(level.rank)} 
                                                id={`indicator-${indicator.id}-level-${level.rank}`} 
                                                className={`mt-1 h-4 w-4 ${isSelected ? "border-primary text-primary ring-1 ring-primary ring-offset-1" : "border-slate-300"}`}
                                              />
                                              <label 
                                                htmlFor={`indicator-${indicator.id}-level-${level.rank}`}
                                                className={`flex flex-col cursor-pointer ${isReadOnly ? "cursor-not-allowed opacity-70" : "group-hover:opacity-80"} mt-0.5`}
                                              >
                                                <span className={`text-[15px] leading-snug ${isSelected ? "text-primary font-bold" : "text-slate-800 font-medium"}`}>
                                                  {level.description || `Livello ${level.rank}`}
                                                </span>
                                                {level.description && (
                                                  <span className="text-sm text-slate-500 mt-1">
                                                    Livello {level.rank}
                                                  </span>
                                                )}
                                              </label>
                                            </div>
                                          );
                                        })}
                                      </RadioGroup>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Navigation Footer */}
              <div className="p-4 md:px-8 md:py-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between">
                <div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className="bg-white"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Indietro
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  {error && !saving && isComplete && (
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  )}
                  
                  {currentIndex < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext} className="bg-slate-900 hover:bg-slate-800 text-white">
                      Avanti <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    !isReadOnly && (
                      <Button
                        type="button"
                        disabled={saving || loading || !isComplete}
                        onClick={handleValidation}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      >
                        {saving ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvataggio...</>
                        ) : (
                          "Conferma Valutazione"
                        )}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Confermi la valutazione?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Stai per salvare i voti per questo utente. Assicurati che le selezioni siano corrette.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Torna indietro</AlertDialogCancel>
            <AlertDialogAction onClick={executeSubmit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salva Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
