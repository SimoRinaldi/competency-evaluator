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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { fetchCurrentUser } from '../auth/auth.api';
import { getTestDetails, submitTestExecution, getTestEvaluators } from './test-executions.api';

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
      <DialogContent className="max-w-[95vw] xl:max-w-[1000px] w-full max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">

        {/* HEADER */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {isExecute ? 'Esegui Test' : 'Dettagli Test'}
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
              {isExecute
                ? 'Leggi la descrizione del test, svolgilo e invia i tuoi materiali.'
                : 'Riepilogo del test, della valutazione e dei file consegnati.'}
            </p>
          </div>
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
              {/* Informazioni Generali / Punteggio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Descrizione test
                  </span>
                  <span className="text-sm font-normal text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {test.assessment_situation || '-'}
                  </span>
                </div>
                {!isExecute && (
                  execution?.test_score !== null && execution?.test_score !== undefined ? (
                    <div className="flex flex-col gap-1.5 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Punteggio ottenuto
                      </span>
                      <div className="flex items-baseline gap-1 text-slate-900 mt-1">
                        <span className="text-3xl font-semibold">{execution.test_score}</span>
                        <span className="text-sm font-normal text-slate-500">/ {execution.max_score}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Stato
                      </span>
                      <span className="text-sm font-normal text-amber-700 mt-1">
                        In attesa di valutazione
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* SEZIONE EXECUTE: form per caricare file */}
              {isExecute && (
                <>
                  <div className="w-full h-px bg-slate-100" />
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
                </>
              )}

              {/* SEZIONE VIEW: visualizzazione pulita in stile TestSummaryView */}
              {!isExecute && (
                <>
                  {/* Sottocompetenze */}
                  {test.subcompetencies?.length > 0 && (
                    <>
                      <div className="w-full h-px bg-slate-100" />
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-0.5">
                          <h4 className="text-lg font-semibold text-slate-800">Sottocompetenze</h4>
                          <p className="text-sm text-slate-500">
                            {test.subcompetencies.length}{' '}
                            {test.subcompetencies.length === 1 ? 'elemento' : 'elementi'}
                          </p>
                        </div>
                        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="font-semibold text-slate-900">Titolo</TableHead>
                                <TableHead className="text-center font-semibold text-slate-900">Soglia</TableHead>
                                <TableHead className="text-center font-semibold text-slate-900">Peso</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {test.subcompetencies.map((sc: any) => (
                                <TableRow key={sc.id}>
                                  <TableCell className="font-normal text-slate-700">{sc.title}</TableCell>
                                  <TableCell className="text-center font-normal text-slate-600">{sc.threshold}%</TableCell>
                                  <TableCell className="text-center font-normal text-slate-600">{sc.weight}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Materiali consegnati */}
                  <div className="w-full h-px bg-slate-100" />
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-lg font-semibold text-slate-800">Materiali consegnati</h4>
                      <p className="text-sm text-slate-500">
                        {submittedOutputs.length}{' '}
                        {submittedOutputs.length === 1 ? 'file' : 'file'}
                      </p>
                    </div>
                    <div className="border rounded-md overflow-hidden bg-white shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-900">Nome</TableHead>
                            <TableHead className="text-center font-semibold text-slate-900">Versione</TableHead>
                            <TableHead className="font-semibold text-slate-900">Descrizione</TableHead>
                            <TableHead className="text-right font-semibold text-slate-900">Collegamento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submittedOutputs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-16 text-center text-slate-400 font-normal">
                                Nessun file registrato per questa consegna
                              </TableCell>
                            </TableRow>
                          ) : (
                            submittedOutputs.map((out: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="font-normal text-slate-800">{out.name}</TableCell>
                                <TableCell className="text-center font-normal text-slate-500">
                                  {out.version ? `v${out.version}` : '—'}
                                </TableCell>
                                <TableCell className="font-normal text-slate-600">
                                  {out.description || '—'}
                                </TableCell>
                                <TableCell className="text-right font-normal">
                                  {out.url ? (
                                    <a
                                      href={out.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline text-xs"
                                    >
                                      Apri link
                                    </a>
                                  ) : (
                                    '—'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Valutatori se presenti */}
                  {evaluators?.length > 0 && (
                    <>
                      <div className="w-full h-px bg-slate-100" />
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-0.5">
                          <h4 className="text-lg font-semibold text-slate-800">Valutatori</h4>
                          <p className="text-sm text-slate-500">
                            {evaluators.length}{' '}
                            {evaluators.length === 1 ? 'elemento' : 'elementi'}
                          </p>
                        </div>
                        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="font-semibold text-slate-900">Nome</TableHead>
                                <TableHead className="font-semibold text-slate-900">Email</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {evaluators.map((ev: any) => (
                                <TableRow key={ev.id}>
                                  <TableCell className="font-normal text-slate-700">{ev.user?.name || `Valutatore #${ev.user_id}`}</TableCell>
                                  <TableCell className="font-normal text-slate-500">{ev.user?.email || '—'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  )}
                </>
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
