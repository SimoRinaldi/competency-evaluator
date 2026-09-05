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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Plus, Trash2, Send, FileText, ExternalLink } from 'lucide-react';
import { fetchCurrentUser } from '../auth/auth.api';
import { getTestDetails, submitTestExecution, getTestEvaluators } from './evaluated-user.api';

export interface UserTestModalProps {
  testId: number | null;
  mode: 'execute' | 'view';
  execution?: any; // esecuzione esistente (con i suoi output)
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void; // callback dopo invio, per aggiornare la lista
}

export function UserTestModal({
  testId,
  mode,
  execution,
  isOpen,
  onClose,
  onSubmitted,
}: UserTestModalProps) {
  const [test, setTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [evaluators, setEvaluators] = useState<any[]>([]);

  const [outputs, setOutputs] = useState([
    { name: '', description: '', url: '', version: '' },
  ]);

  useEffect(() => {
    if (isOpen && testId) {
      loadData(testId);
    } else {
      setTest(null);
      setError(null);
      setSaving(false);
      setOutputs([{ name: '', description: '', url: '', version: '' }]);
      setEvaluators([]);
    }
  }, [isOpen, testId]);

  async function loadData(id: number) {
    setIsLoading(true);
    setError(null);
    try {
      const [testData, currentUser, testEvaluators] = await Promise.all([
        getTestDetails(id),
        fetchCurrentUser(),
        getTestEvaluators(id),
      ]);
      setTest(testData);
      setUser(currentUser);
      setEvaluators(testEvaluators);
    } catch (err: any) {
      setError(err?.message || 'Impossibile caricare i dati del test');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddOutput = () => {
    setOutputs([...outputs, { name: '', description: '', url: '', version: '' }]);
  };

  const handleRemoveOutput = (index: number) => {
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const handleChangeOutput = (index: number, field: string, value: string) => {
    const newOutputs = [...outputs];
    newOutputs[index] = { ...newOutputs[index], [field]: value };
    setOutputs(newOutputs);
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const handleValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !test) return;

    const hasEmptyFields = outputs.some((o) => !o.name.trim());
    if (hasEmptyFields) {
      setError('Compila tutti i campi obbligatori (Nome) per ogni file.');
      return;
    }
    
    setError(null);
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    setSaving(true);
    setShowConfirm(false);
    try {
      await submitTestExecution(test.id, user.id, outputs, execution?.id);
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Errore durante l'invio.");
      setSaving(false);
    }
  };

  const isExecute = mode === 'execute';
  const submittedOutputs: any[] = execution?.test_outputs || [];

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] xl:max-w-[900px] w-full max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">

        {/* HEADER */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {isExecute ? 'Esegui Test' : 'Dettagli Consegna'}
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-1">
            {isExecute
              ? `Leggi la descrizione del test, eseguilo e poi carica i tuoi materiali. Clicca Consegna per confermare e consegnare la tua risposta`
              : `Riepilogo della tua consegna.`}
          </p>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Caricamento del test...</p>
            </div>
          ) : error && !saving ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={() => testId && loadData(testId)} className="mt-2">
                Riprova
              </Button>
            </div>
          ) : test ? (
            <div className="space-y-6">
              {/* Consegna */}
              <div className="space-y-2.5">
                <h3 className="text-base font-semibold text-slate-800">Descrizione Test</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 w-full">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {test.assessment_situation}
                  </p>
                </div>
              </div>

              {/* Metadati (Sottocompetenze e Valutatori) */}
              {(test.subcompetencies?.length > 0 || evaluators?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {test.subcompetencies?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sottocompetenze Valutate</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {test.subcompetencies.map((sc: any) => (
                          <span key={sc.id} className="inline-flex items-center px-2 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-medium border border-sky-100">
                            {sc.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {evaluators?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valutatori Assegnati</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {evaluators.map((ev: any) => (
                          <span key={ev.id} className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                            {ev.user?.name || `Valutatore #${ev.user_id}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SEZIONE EXECUTE: form per caricare file */}
              {isExecute && (
                <form onSubmit={handleValidation} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800">I tuoi file</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddOutput}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Aggiungi file
                    </Button>
                  </div>

                  {error && saving === false && (
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  )}

                  {outputs.map((out, index) => (
                    <Card key={index} className="relative overflow-visible border-slate-200">
                      {outputs.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-3 -right-3 rounded-full h-7 w-7"
                          onClick={() => handleRemoveOutput(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <CardContent className="pt-5">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Nome file <span className="text-destructive">*</span></Label>
                            <Input
                              placeholder="Es. relazione_finale.pdf"
                              value={out.name}
                              onChange={(e) => handleChangeOutput(index, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Versione</Label>
                            <Input
                              placeholder="Es. 1.0"
                              value={out.version}
                              onChange={(e) => handleChangeOutput(index, 'version', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs">URL</Label>
                            <Input
                              placeholder="https://drive.google.com/file/..."
                              value={out.url}
                              onChange={(e) => handleChangeOutput(index, 'url', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs">Descrizione</Label>
                            <Input
                              placeholder="Breve descrizione del contenuto"
                              value={out.description}
                              onChange={(e) => handleChangeOutput(index, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </form>
              )}

              {/* SEZIONE VIEW: lista output in sola lettura */}
              {!isExecute && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-slate-800">File Consegnati</h3>
                  {submittedOutputs.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Nessun file registrato per questa consegna.</p>
                  ) : (
                    <div className="space-y-3">
                      {submittedOutputs.map((out: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
                          <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate" title={out.name}>{out.name}</p>
                            {out.version && <span className="text-xs text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md mt-1 inline-block">v{out.version}</span>}
                            {out.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2" title={out.description}>{out.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Badge punteggio se valutato */}
                  {execution?.test_score !== null && execution?.test_score !== undefined && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200 mt-4">
                      <span className="text-sm font-semibold text-green-800">Punteggio finale</span>
                      <span className="text-2xl font-black text-green-600">
                        {execution.test_score}
                        <span className="text-base font-normal text-green-500 ml-1">/ {execution.max_score}</span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* FOOTER */}
        <DialogFooter className="p-4 md:p-5 border-t border-slate-100 flex flex-row items-center justify-end bg-white gap-2 mt-auto">
          <Button type="button" variant="outline" onClick={onClose} className="px-6 border-slate-300 text-slate-700">
            Chiudi
          </Button>
          {isExecute && (
            <Button
              type="submit"
              disabled={saving || isLoading}
              onClick={handleValidation as any}
              className="px-6"
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Invio in corso...</>
              ) : (
                "Consegna"
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
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Sei sicuro di voler consegnare?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">
            Una volta consegnato l'elaborato, non potrai più modificarlo. Il test passerà allo stato "In Revisione" e attenderà la valutazione.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={executeSubmit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Conferma e Consegna
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
