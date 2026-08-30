import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ApiCompetency, ApiSubCompetency, ApiUser } from './tests.api';

const PAGE_SIZE = 4;

export interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  competencies: ApiCompetency[];
  subCompetencies: ApiSubCompetency[];
  users: ApiUser[];
  evaluators: ApiUser[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onConfirm: (testData: {
    assessmentSituation: string;
    competencyId: number;
    subcompetencyIds: number[];
    userIds: number[];
    evaluatorIds: number[];
  }) => void;
}

export function CreateTestModal({
  isOpen,
  onClose,
  competencies = [],
  subCompetencies = [],
  users = [],
  evaluators = [],
  isLoading = false,
  isSubmitting = false,
  onConfirm,
}: CreateTestModalProps) {
  // Descrizione contesto
  const [assessmentSituation, setAssessmentSituation] = useState(
    'Valutazione delle competenze pratiche e teoriche'
  );

  // Stato selezione competenza
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string>('');

  // Stati selezioni ID
  const [selectedSubcompetencyIds, setSelectedSubcompetencyIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedEvaluatorIds, setSelectedEvaluatorIds] = useState<number[]>([]);

  // Stati ricerca
  const [subSearch, setSubSearch] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [evaluatorSearch, setEvaluatorSearch] = useState<string>('');

  // Stati paginazione
  const [subPage, setSubPage] = useState<number>(1);
  const [userPage, setUserPage] = useState<number>(1);
  const [evaluatorPage, setEvaluatorPage] = useState<number>(1);

  // Filtro Sottocompetenze
  const allSubcompetenciesForCompetency = useMemo(() => {
    if (!selectedCompetencyId) return [];
    return subCompetencies.filter(
      (sub) => sub.competency_id === Number(selectedCompetencyId)
    );
  }, [selectedCompetencyId, subCompetencies]);

  const filteredSubcompetencies = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return allSubcompetenciesForCompetency;
    return allSubcompetenciesForCompetency.filter((sub) =>
      sub.title.toLowerCase().includes(q)
    );
  }, [allSubcompetenciesForCompetency, subSearch]);

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
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
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
      (ev) => ev.name.toLowerCase().includes(q) || ev.email.toLowerCase().includes(q)
    );
  }, [evaluators, evaluatorSearch]);

  const totalEvaluatorPages = Math.ceil(filteredEvaluators.length / PAGE_SIZE) || 1;
  const paginatedEvaluators = useMemo(() => {
    const start = (evaluatorPage - 1) * PAGE_SIZE;
    return filteredEvaluators.slice(start, start + PAGE_SIZE);
  }, [filteredEvaluators, evaluatorPage]);

  // Modifica: Step attivi (1=Competenza, 2=Sottocompetenze, 3=Utenti, 4=Valutatori)
  const [activeStep, setActiveStep] = useState(1);

  // Filtro Competenze (per la tabella step 1)
  const [compSearch, setCompSearch] = useState<string>('');
  const [compPage, setCompPage] = useState<number>(1);
  const filteredCompetencies = useMemo(() => {
    const q = compSearch.trim().toLowerCase();
    if (!q) return competencies;
    return competencies.filter((c) => c.title.toLowerCase().includes(q));
  }, [competencies, compSearch]);

  const totalCompPages = Math.ceil(filteredCompetencies.length / PAGE_SIZE) || 1;
  const paginatedCompetencies = useMemo(() => {
    const start = (compPage - 1) * PAGE_SIZE;
    return filteredCompetencies.slice(start, start + PAGE_SIZE);
  }, [filteredCompetencies, compPage]);

  // Reset al cambio competenza
  const handleCompetencyChange = (value: string) => {
    setSelectedCompetencyId(value);
    setSelectedSubcompetencyIds([]);
    setSubSearch('');
    setSubPage(1);
  };

  // Toggle selezioni
  const toggleSubcompetency = (id: number) => {
    setSelectedSubcompetencyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisibleSubcompetencies = () => {
    const visibleIds = paginatedSubcompetencies.map((s) => s.id);
    const areAllVisibleSelected = visibleIds.every((id) =>
      selectedSubcompetencyIds.includes(id)
    );
    if (areAllVisibleSelected) {
      setSelectedSubcompetencyIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedSubcompetencyIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisibleUsers = () => {
    const visibleIds = paginatedUsers.map((u) => u.id);
    const areAllVisibleSelected = visibleIds.every((id) =>
      selectedUserIds.includes(id)
    );
    if (areAllVisibleSelected) {
      setSelectedUserIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedUserIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const toggleEvaluator = (id: number) => {
    setSelectedEvaluatorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisibleEvaluators = () => {
    const visibleIds = paginatedEvaluators.map((e) => e.id);
    const areAllVisibleSelected = visibleIds.every((id) =>
      selectedEvaluatorIds.includes(id)
    );
    if (areAllVisibleSelected) {
      setSelectedEvaluatorIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedEvaluatorIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const isConfirmDisabled =
    !selectedCompetencyId ||
    selectedSubcompetencyIds.length === 0 ||
    selectedUserIds.length === 0 ||
    selectedEvaluatorIds.length === 0 ||
    isSubmitting;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;

    onConfirm({
      assessmentSituation: assessmentSituation.trim() || 'Assessment di valutazione',
      competencyId: Number(selectedCompetencyId),
      subcompetencyIds: selectedSubcompetencyIds,
      userIds: selectedUserIds,
      evaluatorIds: selectedEvaluatorIds,
    });
  };

  // Logica validazione step per step
  const isStep1Valid = assessmentSituation.trim() !== '' && selectedCompetencyId !== '';
  const isStep2Valid = selectedSubcompetencyIds.length > 0;
  const isStep3Valid = selectedUserIds.length > 0;
  const isStep4Valid = selectedEvaluatorIds.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
        
        {/* COLONNA SINISTRA: SIDEBAR STEPS */}
        <div className="w-full md:w-72 shrink-0 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col md:block">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-8 hidden md:block">
            Creazione Test
          </h2>

          <ul className="flex flex-row md:flex-col gap-2 md:gap-6 relative overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {/* Linea verticale (solo desktop) */}
            <div className="hidden md:block absolute left-[15px] top-4 bottom-[calc(100%-14rem)] w-[2px] bg-slate-200 -z-10"></div>

            {/* STEP 1: Situazione e Competenza */}
            <li className="relative shrink-0">
              <button
                onClick={() => setActiveStep(1)}
                className="flex items-center md:items-start gap-2 md:gap-4 text-left group"
              >
                <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  activeStep === 1
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : isStep1Valid
                    ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  1
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div className={`font-semibold transition-colors ${activeStep === 1 ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    Dati di base
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Competenza e nome</div>
                </div>
              </button>
            </li>

            {/* STEP 2: Sottocompetenze */}
            <li className="relative shrink-0">
              <button
                onClick={() => setActiveStep(2)}
                disabled={!isStep1Valid}
                className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${!isStep1Valid ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  activeStep === 2
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : isStep2Valid
                    ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  2
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div className={`font-semibold transition-colors ${activeStep === 2 ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    Sottocompetenze
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedSubcompetencyIds.length > 0 
                      ? `${selectedSubcompetencyIds.length} selezionate`
                      : 'Scegli le prove'}
                  </div>
                </div>
              </button>
            </li>

            {/* STEP 3: Utenti */}
            <li className="relative shrink-0">
              <button
                onClick={() => setActiveStep(3)}
                disabled={!isStep1Valid || !isStep2Valid}
                className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${(!isStep1Valid || !isStep2Valid) ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  activeStep === 3
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : isStep3Valid
                    ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  3
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div className={`font-semibold transition-colors ${activeStep === 3 ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    Studenti
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
                className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${(!isStep1Valid || !isStep2Valid || !isStep3Valid) ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  activeStep === 4
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : isStep4Valid
                    ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  4
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div className={`font-semibold transition-colors ${activeStep === 4 ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    Valutatori
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
                className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${(!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid) ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  activeStep === 5
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : (isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid)
                    ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  5
                </div>
                <div className="pt-1.5 hidden md:block">
                  <div className={`font-semibold transition-colors ${activeStep === 5 ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    Riepilogo
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Conferma finale</div>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* COLONNA DESTRA: AREA PRINCIPALE */}
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          <DialogHeader className="p-4 md:p-8 md:pb-4 border-b border-slate-100 md:border-b-0">
            <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
              {activeStep === 1 && "Dati di base"}
              {activeStep === 2 && "Selezione Sottocompetenze"}
              {activeStep === 3 && "Assegnazione Studenti"}
              {activeStep === 4 && "Assegnazione Valutatori"}
              {activeStep === 5 && "Riepilogo"}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Caricamento dati dal server...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4">
              
              {/* STEP 1: Dati Base */}
              {activeStep === 1 && (
                <div className="space-y-6 flex flex-col h-full">
                  <div className="space-y-2 max-w-2xl">
                    <Label className="text-sm font-semibold text-slate-800">
                      Situazione di Valutazione (Nome del test)
                    </Label>
                    <Input
                      placeholder="es. Valutazione Sviluppo Web"
                      value={assessmentSituation}
                      onChange={(e) => setAssessmentSituation(e.target.value)}
                      className="bg-white border-slate-300"
                    />
                  </div>

                  <div className="space-y-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-sm font-semibold text-slate-800">
                        Seleziona la competenza principale
                      </Label>
                      <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Cerca competenza..."
                          value={compSearch}
                          onChange={(e) => {
                            setCompSearch(e.target.value);
                            setCompPage(1);
                          }}
                          className="pl-9 h-9"
                        />
                      </div>
                    </div>

                    <div className="bg-white flex flex-col flex-1 border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center py-3"></TableHead>
                            <TableHead className="font-semibold text-slate-700 py-3">
                              Titolo
                            </TableHead>
                            <TableHead className="w-20 text-center font-semibold text-slate-700 py-3">
                              Peso
                            </TableHead>
                            <TableHead className="w-20 text-center font-semibold text-slate-700 py-3">
                              Soglia
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedCompetencies.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                                Nessuna competenza trovata
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedCompetencies.map((comp) => {
                              const isSelected = selectedCompetencyId === String(comp.id);
                              return (
                                <TableRow
                                  key={comp.id}
                                  data-state={isSelected ? 'selected' : undefined}
                                  className="cursor-pointer group hover:bg-transparent"
                                  onClick={() => handleCompetencyChange(String(comp.id))}
                                >
                                  <TableCell className="text-center py-3" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="radio"
                                      name="competencySelection"
                                      className="h-4 w-4 rounded-full border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                      checked={isSelected}
                                      onChange={() => handleCompetencyChange(String(comp.id))}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium text-slate-900 py-3">
                                    {comp.title}
                                  </TableCell>
                                  <TableCell className="text-center text-slate-600 py-3">
                                    {comp.weight}
                                  </TableCell>
                                  <TableCell className="text-center text-slate-600 py-3">
                                    {comp.threshold}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Paginazione Competenze */}
                    {filteredCompetencies.length > 0 && (
                      <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                        <span>Pagina {compPage} di {totalCompPages} - {filteredCompetencies.length} elementi totali</span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button" variant="outline" size="icon"
                            disabled={compPage <= 1} onClick={() => setCompPage(p => Math.max(1, p - 1))}
                            className="h-8 w-8"
                          ><ChevronLeft className="h-4 w-4" /></Button>
                          <Button
                            type="button" variant="outline" size="icon"
                            disabled={compPage >= totalCompPages} onClick={() => setCompPage(p => Math.min(totalCompPages, p + 1))}
                            className="h-8 w-8"
                          ><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
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
                                  selectedSubcompetencyIds.includes(s.id)
                                )
                              }
                              onChange={toggleAllVisibleSubcompetencies}
                            />
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3">Titolo</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3 hidden md:table-cell">Input</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3 hidden md:table-cell">Azione</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3 hidden lg:table-cell">Output</TableHead>
                          <TableHead className="w-16 text-center font-semibold text-slate-700 py-3">Peso</TableHead>
                          <TableHead className="w-16 text-center font-semibold text-slate-700 py-3">Soglia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!selectedCompetencyId ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                              Seleziona prima una competenza nello Step 1
                            </TableCell>
                          </TableRow>
                        ) : paginatedSubcompetencies.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-slate-400">
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
                                <TableCell className="text-center py-3" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggleSubcompetency(sub.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium text-slate-900 py-3">
                                  {sub.title}
                                </TableCell>
                                <TableCell className="text-slate-600 py-3 hidden md:table-cell max-w-[150px] truncate" title={sub.input}>
                                  {sub.input || '-'}
                                </TableCell>
                                <TableCell className="text-slate-600 py-3 hidden md:table-cell max-w-[150px] truncate" title={sub.action}>
                                  {sub.action || '-'}
                                </TableCell>
                                <TableCell className="text-slate-600 py-3 hidden lg:table-cell max-w-[150px] truncate" title={sub.output}>
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
                  {selectedCompetencyId && filteredSubcompetencies.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                      <span>Pagina {subPage} di {totalSubPages} - {filteredSubcompetencies.length} elementi totali ({selectedSubcompetencyIds.length} selezionati)</span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button" variant="outline" size="icon"
                          disabled={subPage <= 1} onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                          className="h-8 w-8"
                        ><ChevronLeft className="h-4 w-4" /></Button>
                        <Button
                          type="button" variant="outline" size="icon"
                          disabled={subPage >= totalSubPages} onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
                          className="h-8 w-8"
                        ><ChevronRight className="h-4 w-4" /></Button>
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
                        placeholder="Cerca studente..."
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
                          <TableHead className="font-semibold text-slate-700 py-3">Nome</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3">Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-slate-400">
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
                                <TableCell className="text-center py-3" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggleUser(user.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium text-slate-900 py-3">{user.name}</TableCell>
                                <TableCell className="text-slate-600 py-3">{user.email}</TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredUsers.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                      <span>Pagina {userPage} di {totalUserPages} - {filteredUsers.length} elementi totali ({selectedUserIds.length} selezionati)</span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button" variant="outline" size="icon"
                          disabled={userPage <= 1} onClick={() => setUserPage(p => Math.max(1, p - 1))}
                          className="h-8 w-8"
                        ><ChevronLeft className="h-4 w-4" /></Button>
                        <Button
                          type="button" variant="outline" size="icon"
                          disabled={userPage >= totalUserPages} onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                          className="h-8 w-8"
                        ><ChevronRight className="h-4 w-4" /></Button>
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
                                paginatedEvaluators.every((ev) => selectedEvaluatorIds.includes(ev.id))
                              }
                              onChange={toggleAllVisibleEvaluators}
                            />
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3">Nome</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3">Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedEvaluators.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-slate-400">
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
                                <TableCell className="text-center py-3" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggleEvaluator(ev.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium text-slate-900 py-3">{ev.name}</TableCell>
                                <TableCell className="text-slate-600 py-3">{ev.email}</TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredEvaluators.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                      <span>Pagina {evaluatorPage} di {totalEvaluatorPages} - {filteredEvaluators.length} elementi totali ({selectedEvaluatorIds.length} selezionati)</span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button" variant="outline" size="icon"
                          disabled={evaluatorPage <= 1} onClick={() => setEvaluatorPage(p => Math.max(1, p - 1))}
                          className="h-8 w-8"
                        ><ChevronLeft className="h-4 w-4" /></Button>
                        <Button
                          type="button" variant="outline" size="icon"
                          disabled={evaluatorPage >= totalEvaluatorPages} onClick={() => setEvaluatorPage(p => Math.min(totalEvaluatorPages, p + 1))}
                          className="h-8 w-8"
                        ><ChevronRight className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Riepilogo */}
              {activeStep === 5 && (
                <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-2 pb-4">
                  <div className="bg-slate-50 p-6 rounded-lg border shrink-0">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Informazioni Generali</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-slate-400">Situazione di Valutazione</Label>
                        <p className="text-base font-medium text-slate-900 mt-1">{assessmentSituation || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-400">Competenza Selezionata</Label>
                        <p className="text-base font-medium text-slate-900 mt-1">
                          {competencies.find(c => c.id === selectedCompetencyId)?.title || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                    {/* Prove Selezionate */}
                    <div className="bg-slate-50 p-5 rounded-lg border flex flex-col h-[250px]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Prove</h4>
                        <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2 py-1 rounded-full">
                          {selectedSubcompetencyIds.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {subCompetencies.filter(s => selectedSubcompetencyIds.includes(s.id)).map(sub => (
                          <div key={sub.id} className="bg-white p-3 rounded border shadow-sm text-sm font-medium text-slate-700">
                            {sub.title}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Utenti Selezionati */}
                    <div className="bg-slate-50 p-5 rounded-lg border flex flex-col h-[250px]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Studenti</h4>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                          {selectedUserIds.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {users.filter(u => selectedUserIds.includes(u.id)).map(user => (
                          <div key={user.id} className="bg-white p-2.5 rounded border shadow-sm flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{user.name}</span>
                            <span className="text-xs text-slate-500 truncate ml-2">{user.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Valutatori Selezionati */}
                    <div className="bg-slate-50 p-5 rounded-lg border flex flex-col h-[250px] md:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Valutatori</h4>
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                          {selectedEvaluatorIds.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-2 content-start">
                        {evaluators.filter(e => selectedEvaluatorIds.includes(e.id)).map(evaluator => (
                          <div key={evaluator.id} className="bg-white p-2.5 rounded border shadow-sm flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{evaluator.name}</span>
                            <span className="text-xs text-slate-500 truncate ml-2">{evaluator.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* FOOTER CONTROLS */}
          <DialogFooter className="p-4 md:p-6 border-t border-slate-100 flex flex-row items-center justify-between bg-white mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
