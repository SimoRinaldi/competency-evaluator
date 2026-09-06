import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ApiCompetency, ApiSubCompetency, ApiUser } from './tests.api';
import { TestSummaryView } from './test-summary-view';

const PAGE_SIZE = 50;

export interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  competencies: ApiCompetency[];
  subCompetencies: ApiSubCompetency[];
  users: ApiUser[];
  evaluators: ApiUser[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  initialData?: {
    assessmentSituation: string;
    competencyId: number;
    subcompetencyIds: number[];
    userIds: number[];
    evaluatorIds: number[];
  } | null;
  onConfirm: (testData: {
    assessmentSituation: string;
    subcompetencyIds: number[];
    userIds: number[];
    evaluatorIds: number[];
  }) => void;
}

const SITUATION_ASSESSMENT_TEMPLATE = `• Luogo:
• Tempo di somministrazione:
• Materiale necessario:
• Numero di valutatori:
• Esperienza richiesta valutatori:

[Descrivere il contesto della prova...]`;

export function CreateTestModal({
  isOpen,
  onClose,
  competencies = [],
  subCompetencies = [],
  users = [],
  evaluators = [],
  isLoading = false,
  isSubmitting = false,
  initialData = null,
  onConfirm,
}: CreateTestModalProps) {
  // Descrizione contesto
  const [assessmentSituation, setAssessmentSituation] = useState(SITUATION_ASSESSMENT_TEMPLATE);

  // Stati selezioni ID
  const [selectedSubcompetencyIds, setSelectedSubcompetencyIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedEvaluatorIds, setSelectedEvaluatorIds] = useState<number[]>([]);

  // Stati ricerca
  const [subSearch, setSubSearch] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [evaluatorSearch, setEvaluatorSearch] = useState<string>('');
  const [compSearch, setCompSearch] = useState<string>('');

  // Stati paginazione
  const [subPage, setSubPage] = useState<number>(1);
  const [userPage, setUserPage] = useState<number>(1);
  const [evaluatorPage, setEvaluatorPage] = useState<number>(1);
  const [compPage, setCompPage] = useState<number>(1);

  // Modifica: Step attivi (1=Competenza, 2=Sottocompetenze, 3=Utenti, 4=Valutatori)
  const [activeStep, setActiveStep] = useState(1);

  // Reset del form alla chiusura o apertura
  const resetForm = () => {
    setActiveStep(1);
    if (initialData) {
      setAssessmentSituation(initialData.assessmentSituation);
      setSelectedSubcompetencyIds(initialData.subcompetencyIds);
      setSelectedUserIds(initialData.userIds);
      setSelectedEvaluatorIds(initialData.evaluatorIds);
    } else {
      setAssessmentSituation(SITUATION_ASSESSMENT_TEMPLATE);
      setSelectedSubcompetencyIds([]);
      setSelectedUserIds([]);
      setSelectedEvaluatorIds([]);
    }
    setSubSearch('');
    setUserSearch('');
    setEvaluatorSearch('');
    setCompSearch('');
    setSubPage(1);
    setUserPage(1);
    setEvaluatorPage(1);
    setCompPage(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    } else {
      resetForm();
    }
  }, [isOpen, initialData]);

  const filteredSubcompetencies = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return subCompetencies;
    return subCompetencies.filter((sub) => sub.title.toLowerCase().includes(q));
  }, [subCompetencies, subSearch]);

  const totalSubPages = Math.ceil(filteredSubcompetencies.length / PAGE_SIZE) || 1;
  const paginatedSubcompetencies = useMemo(() => {
    const start = (subPage - 1) * PAGE_SIZE;
    return filteredSubcompetencies.slice(start, start + PAGE_SIZE);
  }, [filteredSubcompetencies, subPage]);

  // Filtro Utenti
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  const totalUserPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, userPage]);

  // Filtro Valutatori
  const filteredEvaluators = useMemo(() => {
    const q = evaluatorSearch.trim().toLowerCase();
    if (!q) return evaluators;
    return evaluators.filter(
      (ev) => ev.name.toLowerCase().includes(q) || ev.email.toLowerCase().includes(q),
    );
  }, [evaluators, evaluatorSearch]);

  const totalEvaluatorPages = Math.ceil(filteredEvaluators.length / PAGE_SIZE) || 1;
  const paginatedEvaluators = useMemo(() => {
    const start = (evaluatorPage - 1) * PAGE_SIZE;
    return filteredEvaluators.slice(start, start + PAGE_SIZE);
  }, [filteredEvaluators, evaluatorPage]);

  // Toggle selezioni
  const toggleSubcompetency = (id: number) => {
    setSelectedSubcompetencyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAllVisibleSubcompetencies = () => {
    const visibleIds = paginatedSubcompetencies.map((s) => s.id);
    const areAllVisibleSelected = visibleIds.every((id) => selectedSubcompetencyIds.includes(id));
    if (areAllVisibleSelected) {
      setSelectedSubcompetencyIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedSubcompetencyIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAllVisibleUsers = () => {
    const visibleIds = paginatedUsers.map((u) => u.id);
    const areAllVisibleSelected = visibleIds.every((id) => selectedUserIds.includes(id));
    if (areAllVisibleSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleEvaluator = (id: number) => {
    setSelectedEvaluatorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAllVisibleEvaluators = () => {
    const visibleIds = paginatedEvaluators.map((e) => e.id);
    const areAllVisibleSelected = visibleIds.every((id) => selectedEvaluatorIds.includes(id));
    if (areAllVisibleSelected) {
      setSelectedEvaluatorIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedEvaluatorIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleConfirm = () => {
    if (isConfirmDisabled) return;

    onConfirm({
      assessmentSituation: assessmentSituation.trim() || 'Assessment di valutazione',
      subcompetencyIds: selectedSubcompetencyIds,
      userIds: selectedUserIds,
      evaluatorIds: selectedEvaluatorIds,
    });
  };

  // Logica validazione step per step
  const isStep1Valid = assessmentSituation.trim() !== '';
  const isStep2Valid = selectedSubcompetencyIds.length > 0;
  const isStep3Valid = selectedUserIds.length > 0;
  const isStep4Valid = selectedEvaluatorIds.length > 0;

  const isConfirmDisabled =
    !isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="w-[95vw] sm:max-w-6xl h-[85vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl
  bg-white shadow-2xl gap-0"
      >
        {/* COLONNA SINISTRA: SIDEBAR STEPS */}
        <div
          className="w-full md:w-64 shrink-0 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-200 bg-
  slate-50/50 flex flex-col md:block"
        >
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-8 hidden md:block">
            {initialData ? 'Gestione Test' : 'Gestione Test'}
          </h2>

          <ul className="flex flex-row md:flex-col gap-2 md:gap-6 relative overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {/* Linea verticale (solo desktop) */}
            <div className="hidden md:block absolute left-3.75 top-4 bottom-[calc(100%-14rem)] w-0.5 bg-slate-200 -z-10"></div>

            {/* STEP 1: Situation Assessment */}
            <li className="relative shrink-0">
              <button
                onClick={() => setActiveStep(1)}
                className="flex items-center md:items-start gap-2 md:gap-4 text-left group"
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeStep === 1
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : isStep1Valid
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  1
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div
                    className={`font-semibold transition-colors ${
                      activeStep === 1
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Dati generali
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Info sul test</div>
                </div>
              </button>
            </li>

            {/* STEP 2: Sottocompetenze */}
            <li className="relative shrink-0">
              <button
                onClick={() => setActiveStep(2)}
                disabled={!isStep1Valid}
                className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${
                  !isStep1Valid ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeStep === 2
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : isStep2Valid
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div
                    className={`font-semibold transition-colors ${
                      activeStep === 2
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Sottocompetenze
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedSubcompetencyIds.length > 0
                      ? `${selectedSubcompetencyIds.length} selezionate`
                      : 'Scegli le sottocompetenze'}
                  </div>
                </div>
              </button>
            </li>

            {/* STEP 3: Utenti */}
            <li className="relative shrink-0">
              <button
                onClick={() => setActiveStep(3)}
                disabled={!isStep1Valid || !isStep2Valid}
                className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${
                  !isStep1Valid || !isStep2Valid ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeStep === 3
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : selectedUserIds.length > 0
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  3
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div
                    className={`font-semibold transition-colors ${
                      activeStep === 3
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Utenti
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedUserIds.length > 0
                      ? `${selectedUserIds.length} assegnati`
                      : 'Chi farà il test'}
                  </div>
                </div>
              </button>
            </li>

            {/* STEP 4: Valutatori */}
            <li className="relative shrink-0">
              <button
                onClick={() => setActiveStep(4)}
                disabled={!isStep1Valid || !isStep2Valid || !isStep3Valid}
                className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${
                  !isStep1Valid || !isStep2Valid || !isStep3Valid
                    ? 'cursor-not-allowed opacity-60'
                    : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeStep === 4
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : selectedEvaluatorIds.length > 0
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  4
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div
                    className={`font-semibold transition-colors ${
                      activeStep === 4
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Valutatori{' '}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedEvaluatorIds.length > 0
                      ? `${selectedEvaluatorIds.length} assegnati`
                      : 'Chi valuterà'}
                  </div>
                </div>
              </button>
            </li>

            {/* STEP 5: Riepilogo */}
            <li className="relative shrink-0">
              <button
                onClick={() => setActiveStep(5)}
                disabled={!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid}
                className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${
                  !isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid
                    ? 'cursor-not-allowed opacity-60'
                    : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeStep === 5
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  5
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div
                    className={`font-semibold transition-colors ${
                      activeStep === 5
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Riepilogo
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Conferma dati</div>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* COLONNA DESTRA: AREA PRINCIPALE */}
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          <DialogHeader className="p-4 md:px-8 md:pt-8 md:pb-2">
            <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
              {activeStep === 1 && 'Dati generali'}
              {activeStep === 2 && 'Selezione Sottocompetenze'}
              {activeStep === 3 && 'Assegnazione Utenti'}
              {activeStep === 4 && 'Assegnazione Valutatori'}
              {activeStep === 5 && 'Riepilogo'}
            </DialogTitle>
            <div className="w-auto mx-2 mt-4 mb-3 h-px bg-slate-200" />
          </DialogHeader>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Caricamento dati dal server...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4">
              {/* STEP 1: Dati Generali */}
              {activeStep === 1 && (
                <div className="space-y-6 flex flex-col h-full">
                  <div className="max-w-2xl">
                    <Field>
                      <FieldLabel
                        htmlFor="assessment-situation"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Descrizione test
                      </FieldLabel>
                      <FieldDescription className="text-slate-500 mb-2">
                        Tale descrizione deve contenere obbligatoriamente il luogo di svolgimento
                        (on line, in presenza, tipologia di aula, se servono pc...), tempo di
                        somministrazione, materiale necessario, numero di valutatori e se devono
                        essere esperti della materia.
                      </FieldDescription>
                      <Textarea
                        id="assessment-situation"
                        placeholder="es. Valutazione delle competenze in..."
                        value={assessmentSituation}
                        onChange={(e) => setAssessmentSituation(e.target.value)}
                        className="bg-white border-slate-300 min-h-30 resize-y"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 2: Sottocompetenze */}
              {activeStep === 2 && (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Cerca sottocompetenza..."
                        value={subSearch}
                        onChange={(e) => {
                          setSubSearch(e.target.value);
                          setSubPage(1);
                        }}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>

                  <div className="bg-white flex flex-col flex-1 border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-12 text-center py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                              disabled={paginatedSubcompetencies.length === 0}
                              checked={
                                paginatedSubcompetencies.length > 0 &&
                                paginatedSubcompetencies.every((s) =>
                                  selectedSubcompetencyIds.includes(s.id),
                                )
                              }
                              onChange={toggleAllVisibleSubcompetencies}
                            />
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3">
                            Titolo
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3">
                            Competenza
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3 hidden md:table-cell">
                            Input
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3 hidden md:table-cell">
                            Azione
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3 hidden lg:table-cell">
                            Output
                          </TableHead>
                          <TableHead className="w-16 text-center font-semibold text-slate-900 py-3">
                            Peso
                          </TableHead>
                          <TableHead className="w-16 text-center font-semibold text-slate-900 py-3">
                            Soglia
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSubcompetencies.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-32 text-center text-slate-400 font-normal">
                              Nessuna sottocompetenza trovata
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedSubcompetencies.map((sub) => {
                            const isSelected = selectedSubcompetencyIds.includes(sub.id);
                            return (
                              <TableRow
                                key={sub.id}
                                data-state={isSelected ? 'selected' : undefined}
                                className="cursor-pointer group hover:bg-transparent"
                                onClick={() => toggleSubcompetency(sub.id)}
                              >
                                <TableCell
                                  className="text-center py-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggleSubcompetency(sub.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-normal text-slate-900 py-3">
                                  {sub.title}
                                </TableCell>
                                <TableCell className="text-slate-600 py-3">
                                  {competencies.find((c) => c.id === sub.competency_id)?.title ||
                                    '-'}
                                </TableCell>
                                <TableCell
                                  className="text-slate-600 py-3 hidden md:table-cell max-w-37.5 truncate"
                                  title={sub.input}
                                >
                                  {sub.input || '-'}
                                </TableCell>
                                <TableCell
                                  className="text-slate-600 py-3 hidden md:table-cell max-w-37.5 truncate"
                                  title={sub.action}
                                >
                                  {sub.action || '-'}
                                </TableCell>
                                <TableCell
                                  className="text-slate-600 py-3 hidden lg:table-cell max-w-37.5 truncate"
                                  title={sub.output}
                                >
                                  {sub.output || '-'}
                                </TableCell>
                                <TableCell className="text-center text-slate-600 py-3">
                                  {sub.weight}
                                </TableCell>
                                <TableCell className="text-center text-slate-600 py-3">
                                  {sub.threshold}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginazione */}
                  {filteredSubcompetencies.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                      <span>
                        Pagina {subPage} di {totalSubPages} - {filteredSubcompetencies.length}{' '}
                        elementi totali ({selectedSubcompetencyIds.length} selezionati)
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={subPage <= 1}
                          onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={subPage >= totalSubPages}
                          onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
                          className="h-8 w-8"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Utenti */}
              {activeStep === 3 && (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Cerca utente..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setUserPage(1);
                        }}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>

                  <div className="bg-white flex flex-col flex-1 border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-12 text-center py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                              checked={
                                paginatedUsers.length > 0 &&
                                paginatedUsers.every((u) => selectedUserIds.includes(u.id))
                              }
                              onChange={toggleAllVisibleUsers}
                            />
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3">Nome</TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3">Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-slate-400 font-normal">
                              Nessun utente trovato
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedUsers.map((user) => {
                            const isSelected = selectedUserIds.includes(user.id);
                            return (
                              <TableRow
                                key={user.id}
                                data-state={isSelected ? 'selected' : undefined}
                                className="cursor-pointer group hover:bg-transparent"
                                onClick={() => toggleUser(user.id)}
                              >
                                <TableCell
                                  className="text-center py-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggleUser(user.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-normal text-slate-900 py-3">
                                  {user.name}
                                </TableCell>
                                <TableCell className="text-slate-600 py-3 font-normal">{user.email}</TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredUsers.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                      <span>
                        Pagina {userPage} di {totalUserPages} - {filteredUsers.length} elementi
                        totali ({selectedUserIds.length} selezionati)
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={userPage <= 1}
                          onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={userPage >= totalUserPages}
                          onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                          className="h-8 w-8"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Valutatori */}
              {activeStep === 4 && (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Cerca valutatore..."
                        value={evaluatorSearch}
                        onChange={(e) => {
                          setEvaluatorSearch(e.target.value);
                          setEvaluatorPage(1);
                        }}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>

                  <div className="bg-white flex flex-col flex-1 border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-12 text-center py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                              checked={
                                paginatedEvaluators.length > 0 &&
                                paginatedEvaluators.every((ev) =>
                                  selectedEvaluatorIds.includes(ev.id),
                                )
                              }
                              onChange={toggleAllVisibleEvaluators}
                            />
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3">Nome</TableHead>
                          <TableHead className="font-semibold text-slate-900 py-3">Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedEvaluators.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-slate-400 font-normal">
                              Nessun valutatore trovato
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedEvaluators.map((ev) => {
                            const isSelected = selectedEvaluatorIds.includes(ev.id);
                            return (
                              <TableRow
                                key={ev.id}
                                data-state={isSelected ? 'selected' : undefined}
                                className="cursor-pointer group hover:bg-transparent"
                                onClick={() => toggleEvaluator(ev.id)}
                              >
                                <TableCell
                                  className="text-center py-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggleEvaluator(ev.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-normal text-slate-900 py-3">
                                  {ev.name}
                                </TableCell>
                                <TableCell className="text-slate-600 py-3 font-normal">{ev.email}</TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredEvaluators.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                      <span>
                        Pagina {evaluatorPage} di {totalEvaluatorPages} -{' '}
                        {filteredEvaluators.length} elementi totali ({selectedEvaluatorIds.length}{' '}
                        selezionati)
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={evaluatorPage <= 1}
                          onClick={() => setEvaluatorPage((p) => Math.max(1, p - 1))}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={evaluatorPage >= totalEvaluatorPages}
                          onClick={() =>
                            setEvaluatorPage((p) => Math.min(totalEvaluatorPages, p + 1))
                          }
                          className="h-8 w-8"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Riepilogo */}
              {activeStep === 5 && (
                <TestSummaryView
                  assessmentSituation={assessmentSituation}
                  subcompetencies={subCompetencies.filter((s) =>
                    selectedSubcompetencyIds.includes(s.id),
                  )}
                  students={users.filter((u) => selectedUserIds.includes(u.id))}
                  evaluators={evaluators.filter((e) => selectedEvaluatorIds.includes(e.id))}
                />
              )}
            </div>
          )}

          {/* FOOTER CONTROLS */}
          <DialogFooter className="p-4 md:p-6 border-t border-slate-100 flex flex-row items-center justify-between bg-white mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 md:px-6 border-slate-300 text-slate-700"
            >
              Annulla
            </Button>

            <div className="flex items-center gap-2 md:gap-3">
              {activeStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="px-4 md:px-6"
                >
                  Indietro
                </Button>
              )}
              {activeStep < 5 ? (
                <Button
                  type="button"
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={
                    (activeStep === 1 && !isStep1Valid) ||
                    (activeStep === 2 && !isStep2Valid) ||
                    (activeStep === 3 && !isStep3Valid) ||
                    (activeStep === 4 && !isStep4Valid)
                  }
                  className="px-6 md:px-8"
                >
                  Avanti
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isConfirmDisabled}
                  className="px-6 md:px-8 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crea Test
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
