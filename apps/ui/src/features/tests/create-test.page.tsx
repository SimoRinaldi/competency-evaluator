import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ApiCompetency,
  ApiSubCompetency,
  ApiTestEvaluator,
  ApiEvaluatedUser,
  fetchCompetencies,
  fetchSubCompetencies,
  fetchTestEvaluators,
  fetchEvaluatedUsers,
  fetchTestDesigners,
  createTest,
} from './tests.api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const PAGE_SIZE = 5;

export function CreateTestPage() {
  const navigate = useNavigate();

  // Menu attivo: 1 = Competenza, 2 = Sottocompetenze, 3 = Utenti, 4 = Valutatori, 5 = Riepilogo
  const [activeMenu, setActiveMenu] = useState<number>(1);

  // Dati API
  const [competencies, setCompetencies] = useState<ApiCompetency[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<ApiSubCompetency[]>([]);
  const [evaluatedUsers, setEvaluatedUsers] = useState<ApiEvaluatedUser[]>([]);
  const [testEvaluators, setTestEvaluators] = useState<ApiTestEvaluator[]>([]);

  // Stati form
  const [assessmentSituation, setAssessmentSituation] = useState(
    'Valutazione delle competenze teoriche e pratiche',
  );
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string>('');
  const [selectedSubcompetencyIds, setSelectedSubcompetencyIds] = useState<number[]>([]);
  const [selectedEvaluatedUserIds, setSelectedEvaluatedUserIds] = useState<number[]>([]);
  const [selectedTestEvaluatorIds, setSelectedTestEvaluatorIds] = useState<number[]>([]);

  // Stati ricerca
  const [subSearch, setSubSearch] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [evaluatorSearch, setEvaluatorSearch] = useState<string>('');

  // Stati paginazione
  const [subPage, setSubPage] = useState<number>(1);
  const [userPage, setUserPage] = useState<number>(1);
  const [evaluatorPage, setEvaluatorPage] = useState<number>(1);

  // Stati UI
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Caricamento dati
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [compRes, subRes, evaluatedUsersRes, testEvaluatorsRes] = await Promise.all([
          fetchCompetencies().catch(() => []),
          fetchSubCompetencies().catch(() => []),
          fetchEvaluatedUsers().catch(() => []),
          fetchTestEvaluators().catch(() => []),
        ]);

        setCompetencies(compRes);
        setSubCompetencies(subRes);
        setEvaluatedUsers(evaluatedUsersRes);
        setTestEvaluators(testEvaluatorsRes);
      } catch (err: any) {
        console.error('Errore caricamento dati test:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Oggetto competenza selezionata
  const selectedCompetency = useMemo(() => {
    return competencies.find((c) => c.id === Number(selectedCompetencyId));
  }, [competencies, selectedCompetencyId]);

  // Sottocompetenze filtrate
  const allSubcompetenciesForCompetency = useMemo(() => {
    if (!selectedCompetencyId) return [];
    return subCompetencies.filter((sub) => sub.competency_id === Number(selectedCompetencyId));
  }, [selectedCompetencyId, subCompetencies]);

  const filteredSubcompetencies = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return allSubcompetenciesForCompetency;
    return allSubcompetenciesForCompetency.filter((sub) => sub.title.toLowerCase().includes(q));
  }, [allSubcompetenciesForCompetency, subSearch]);

  const totalSubPages = Math.ceil(filteredSubcompetencies.length / PAGE_SIZE) || 1;
  const paginatedSubcompetencies = useMemo(() => {
    const start = (subPage - 1) * PAGE_SIZE;
    return filteredSubcompetencies.slice(start, start + PAGE_SIZE);
  }, [filteredSubcompetencies, subPage]);

  // Utenti valutati filtrati
  const filteredEvaluatedUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return evaluatedUsers;
    return evaluatedUsers.filter(
      (eu) => eu.user?.name.toLowerCase().includes(q) || eu.user?.email.toLowerCase().includes(q),
    );
  }, [evaluatedUsers, userSearch]);

  const totalUserPages = Math.ceil(filteredEvaluatedUsers.length / PAGE_SIZE) || 1;
  const paginatedEvaluatedUsers = useMemo(() => {
    const start = (userPage - 1) * PAGE_SIZE;
    return filteredEvaluatedUsers.slice(start, start + PAGE_SIZE);
  }, [filteredEvaluatedUsers, userPage]);

  // Valutatori filtrati
  const filteredTestEvaluators = useMemo(() => {
    const q = evaluatorSearch.trim().toLowerCase();
    if (!q) return testEvaluators;
    return testEvaluators.filter(
      (te) => te.user?.name.toLowerCase().includes(q) || te.user?.email.toLowerCase().includes(q),
    );
  }, [testEvaluators, evaluatorSearch]);

  const totalEvaluatorPages = Math.ceil(filteredTestEvaluators.length / PAGE_SIZE) || 1;
  const paginatedTestEvaluators = useMemo(() => {
    const start = (evaluatorPage - 1) * PAGE_SIZE;
    return filteredTestEvaluators.slice(start, start + PAGE_SIZE);
  }, [filteredTestEvaluators, evaluatorPage]);

  // Cambio competenza
  const handleCompetencyChange = (val: string) => {
    setSelectedCompetencyId(val);
    setSelectedSubcompetencyIds([]);
    setSubSearch('');
    setSubPage(1);
  };

  // Toggle Sottocompetenza
  const toggleSub = (id: number) => {
    setSelectedSubcompetencyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllVisibleSubs = () => {
    const visibleIds = paginatedSubcompetencies.map((s) => s.id);
    const allSelected = visibleIds.every((id) => selectedSubcompetencyIds.includes(id));
    if (allSelected) {
      setSelectedSubcompetencyIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedSubcompetencyIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Toggle Utente Valutato
  const toggleEvaluatedUser = (id: number) => {
    setSelectedEvaluatedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllVisibleEvaluatedUsers = () => {
    const visibleIds = paginatedEvaluatedUsers.map((eu) => eu.id);
    const allSelected = visibleIds.every((id) => selectedEvaluatedUserIds.includes(id));
    if (allSelected) {
      setSelectedEvaluatedUserIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedEvaluatedUserIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Toggle Valutatore
  const toggleTestEvaluator = (id: number) => {
    setSelectedTestEvaluatorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllVisibleTestEvaluators = () => {
    const visibleIds = paginatedTestEvaluators.map((te) => te.id);
    const allSelected = visibleIds.every((id) => selectedTestEvaluatorIds.includes(id));
    if (allSelected) {
      setSelectedTestEvaluatorIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedTestEvaluatorIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Validità step
  const isStep1Valid = Boolean(selectedCompetencyId);
  const isStep2Valid = isStep1Valid && selectedSubcompetencyIds.length > 0;
  const isStep3Valid = selectedEvaluatedUserIds.length > 0;
  const isStep4Valid = selectedTestEvaluatorIds.length > 0;
  const isAllValid = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  // Invio finale
  const handleFinalSave = async () => {
    if (!isAllValid) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let designerId = 1;
      const designers = await fetchTestDesigners().catch(() => []);
      if (designers.length > 0) {
        designerId = designers[0].id;
      }

      await createTest({
        assessment_situation: assessmentSituation.trim() || 'Assessment di valutazione',
        test_designer_id: designerId,
        subcompetency_ids: selectedSubcompetencyIds,
        evaluated_user_ids: selectedEvaluatedUserIds,
        test_evaluator_ids: selectedTestEvaluatorIds,
      });

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Errore durante la creazione del test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
          <span className="font-medium text-sm">Caricamento dati dal server...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-start py-10 px-4">
      {/* Contenitore Principale con Layout a 2 Colonne */}
      <div className="flex w-full max-w-6xl bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        {/* COLONNA SINISTRA: SIDEBAR GUIDATA */}
        <div className="w-72 shrink-0 p-8 border-r border-slate-200 bg-slate-50/30">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            Creazione Test
          </h2>

          <ul className="flex flex-col gap-6 relative">
            {/* Linea verticale che congiunge gli step */}
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-200 -z-10" />

            {/* STEP 1: Competenza */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(1)}
                className="flex items-start gap-4 text-left w-full group"
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeMenu === 1
                      ? 'bg-slate-900 text-white shadow-md scale-110'
                      : isStep1Valid
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  1
                </div>
                <div className="pt-1.5">
                  <div
                    className={`font-semibold transition-colors ${
                      activeMenu === 1
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Competenza
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedCompetency ? 'Selezionata' : 'Scelta ambito'}
                  </div>
                </div>
              </button>
            </li>

            {/* STEP 2: Sottocompetenze */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(2)}
                disabled={!isStep1Valid}
                className={`flex items-start gap-4 text-left w-full group ${
                  !isStep1Valid ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeMenu === 2
                      ? 'bg-slate-900 text-white shadow-md scale-110'
                      : selectedSubcompetencyIds.length > 0
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </div>
                <div className="pt-1.5">
                  <div
                    className={`font-semibold transition-colors ${
                      activeMenu === 2
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Sottocompetenze
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedSubcompetencyIds.length > 0
                      ? `${selectedSubcompetencyIds.length} selezionat${
                          selectedSubcompetencyIds.length === 1 ? 'a' : 'e'
                        }`
                      : 'Selezione sottocompetenze'}
                  </div>
                </div>
              </button>
            </li>

            {/* STEP 3: Utenti */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(3)}
                disabled={!isStep2Valid}
                className={`flex items-start gap-4 text-left w-full group ${
                  !isStep2Valid ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeMenu === 3
                      ? 'bg-slate-900 text-white shadow-md scale-110'
                      : selectedEvaluatedUserIds.length > 0
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  3
                </div>
                <div className="pt-1.5">
                  <div
                    className={`font-semibold transition-colors ${
                      activeMenu === 3
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Utenti
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedEvaluatedUserIds.length > 0
                      ? `${selectedEvaluatedUserIds.length} partecipanti`
                      : 'Candidati'}
                  </div>
                </div>
              </button>
            </li>

            {/* STEP 4: Valutatori */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(4)}
                disabled={!isStep2Valid}
                className={`flex items-start gap-4 text-left w-full group ${
                  !isStep2Valid ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeMenu === 4
                      ? 'bg-slate-900 text-white shadow-md scale-110'
                      : selectedTestEvaluatorIds.length > 0
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  4
                </div>
                <div className="pt-1.5">
                  <div
                    className={`font-semibold transition-colors ${
                      activeMenu === 4
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Valutatori
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedTestEvaluatorIds.length > 0
                      ? `${selectedTestEvaluatorIds.length} docenti/eval`
                      : 'Commissione'}
                  </div>
                </div>
              </button>
            </li>

            {/* STEP 5: Riepilogo */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(5)}
                disabled={!isAllValid}
                className={`flex items-start gap-4 text-left w-full group ${
                  !isAllValid ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeMenu === 5
                      ? 'bg-slate-900 text-white shadow-md scale-110'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  5
                </div>
                <div className="pt-1.5">
                  <div
                    className={`font-semibold transition-colors ${
                      activeMenu === 5
                        ? 'text-slate-900'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    Riepilogo
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Verifica e salva</div>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* COLONNA DESTRA: AREA PRINCIPALE */}
        <div className="flex-1 p-10 bg-white min-h-[560px] flex flex-col justify-between">
          {/* VISTA 1: SCELTA COMPETENZA */}
          {activeMenu === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Dati del Test e Competenza
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Seleziona la competenza di riferimento per cui strutturare il test e descrivi la
                  Descrizione test.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>
                    Descrizione test <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={assessmentSituation}
                    onChange={(e) => setAssessmentSituation(e.target.value)}
                    placeholder="es. Prova d'esame in laboratorio sul design pattern Observer"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Seleziona la Competenza <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedCompetencyId} onValueChange={handleCompetencyChange}>
                    <SelectTrigger className="w-full h-11 bg-white border-slate-300 rounded-md shadow-sm">
                      <SelectValue placeholder="-- Scegli una competenza dall'elenco --" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {competencies.map((comp) => (
                        <SelectItem key={comp.id} value={String(comp.id)}>
                          <span className="font-medium text-slate-900">{comp.title}</span>{' '}
                          <span className="text-xs text-slate-500">
                            (Peso: {comp.weight}, Soglia: {comp.threshold}%)
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCompetency && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between items-center mt-3">
                    <div>
                      Peso: <strong>{selectedCompetency.weight}</strong> | Soglia minima:{' '}
                      <strong>{selectedCompetency.threshold}%</strong>
                    </div>
                    <span className="text-slate-500 font-medium">
                      {allSubcompetenciesForCompetency.length} sottocompetenze collegate
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-6 mt-8">
                <Button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => setActiveMenu(2)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                >
                  Avanti
                </Button>
              </div>
            </div>
          )}

          {/* VISTA 2: SOTTOCOMPETENZE */}
          {activeMenu === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Seleziona le Sottocompetenze
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Scegli quali sotto-competenze faranno parte di questa prova d'esame.
                  </p>
                </div>

                {/* Ricerca */}
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca sottocompetenza..."
                    value={subSearch}
                    onChange={(e) => {
                      setSubSearch(e.target.value);
                      setSubPage(1);
                    }}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Data table */}
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          disabled={paginatedSubcompetencies.length === 0}
                          checked={
                            paginatedSubcompetencies.length > 0 &&
                            paginatedSubcompetencies.every((s) =>
                              selectedSubcompetencyIds.includes(s.id),
                            )
                          }
                          onChange={toggleAllVisibleSubs}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-slate-900">
                        Titolo Sottocompetenza
                      </TableHead>
                      <TableHead className="w-20 text-center font-semibold text-slate-900">
                        Peso
                      </TableHead>
                      <TableHead className="w-20 text-center font-semibold text-slate-900">
                        Soglia
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubcompetencies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-xs text-slate-400 font-normal">
                          Nessuna sottocompetenza disponibile o trovata.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSubcompetencies.map((sub) => {
                        const isSelected = selectedSubcompetencyIds.includes(sub.id);
                        return (
                          <TableRow
                            key={sub.id}
                            data-state={isSelected ? 'selected' : undefined}
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => toggleSub(sub.id)}
                          >
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleSub(sub.id)}
                              />
                            </TableCell>
                            <TableCell className="font-normal text-slate-900 text-sm">
                              {sub.title}
                            </TableCell>
                            <TableCell className="text-center text-slate-600 text-xs">
                              {sub.weight}
                            </TableCell>
                            <TableCell className="text-center text-slate-600 text-xs">
                              {sub.threshold}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {filteredSubcompetencies.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                    <span>
                      {selectedSubcompetencyIds.length} selezionate su{' '}
                      {filteredSubcompetencies.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        Pagina {subPage} di {totalSubPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={subPage <= 1}
                        onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={subPage >= totalSubPages}
                        onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-6 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveMenu(1)}
                  className="px-6"
                >
                  Indietro
                </Button>
                <Button
                  type="button"
                  disabled={selectedSubcompetencyIds.length === 0}
                  onClick={() => setActiveMenu(3)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                >
                  Avanti
                </Button>
              </div>
            </div>
          )}

          {/* VISTA 3: UTENTI */}
          {activeMenu === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Seleziona i Partecipanti (Utenti)
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Assegna gli utenti che sosterranno questo test.
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca utente per nome/email..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          checked={
                            paginatedEvaluatedUsers.length > 0 &&
                            paginatedEvaluatedUsers.every((eu) =>
                              selectedEvaluatedUserIds.includes(eu.id),
                            )
                          }
                          onChange={toggleAllVisibleEvaluatedUsers}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-slate-900">Nome Utente</TableHead>
                      <TableHead className="font-semibold text-slate-900">Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEvaluatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center text-xs text-slate-400">
                          Nessun utente trovato.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEvaluatedUsers.map((eu) => {
                        const isSelected = selectedEvaluatedUserIds.includes(eu.id);
                        return (
                          <TableRow
                            key={eu.id}
                            data-state={isSelected ? 'selected' : undefined}
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => toggleEvaluatedUser(eu.id)}
                          >
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleEvaluatedUser(eu.id)}
                              />
                            </TableCell>
                            <TableCell className="font-normal text-slate-900 text-sm">
                              {eu.user?.name ?? '-'}
                            </TableCell>
                            <TableCell className="text-slate-600 text-xs">
                              {eu.user?.email ?? '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {filteredEvaluatedUsers.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                    <span>
                      {selectedEvaluatedUserIds.length} selezionati su{' '}
                      {filteredEvaluatedUsers.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        Pagina {userPage} di {totalUserPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={userPage <= 1}
                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={userPage >= totalUserPages}
                        onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-6 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveMenu(2)}
                  className="px-6"
                >
                  Indietro
                </Button>
                <Button
                  type="button"
                  disabled={selectedEvaluatedUserIds.length === 0}
                  onClick={() => setActiveMenu(4)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                >
                  Avanti
                </Button>
              </div>
            </div>
          )}

          {/* VISTA 4: VALUTATORI */}
          {activeMenu === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Seleziona i Valutatori
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Assegna i valutatori o docenti responsabili della correzione.
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca valutatore..."
                    value={evaluatorSearch}
                    onChange={(e) => {
                      setEvaluatorSearch(e.target.value);
                      setEvaluatorPage(1);
                    }}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          checked={
                            paginatedTestEvaluators.length > 0 &&
                            paginatedTestEvaluators.every((te) =>
                              selectedTestEvaluatorIds.includes(te.id),
                            )
                          }
                          onChange={toggleAllVisibleTestEvaluators}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-slate-900">
                        Nome Valutatore
                      </TableHead>
                      <TableHead className="font-semibold text-slate-900">Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTestEvaluators.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center text-xs text-slate-400 font-normal">
                          Nessun valutatore trovato.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTestEvaluators.map((te) => {
                        const isSelected = selectedTestEvaluatorIds.includes(te.id);
                        return (
                          <TableRow
                            key={te.id}
                            data-state={isSelected ? 'selected' : undefined}
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => toggleTestEvaluator(te.id)}
                          >
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleTestEvaluator(te.id)}
                              />
                            </TableCell>
                            <TableCell className="font-normal text-slate-900 text-sm">
                              {te.user?.name ?? '-'}
                            </TableCell>
                            <TableCell className="text-slate-600 text-xs">
                              {te.user?.email ?? '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {filteredTestEvaluators.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                    <span>
                      {selectedTestEvaluatorIds.length} selezionati su{' '}
                      {filteredTestEvaluators.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        Pagina {evaluatorPage} di {totalEvaluatorPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={evaluatorPage <= 1}
                        onClick={() => setEvaluatorPage((p) => Math.max(1, p - 1))}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={evaluatorPage >= totalEvaluatorPages}
                        onClick={() =>
                          setEvaluatorPage((p) => Math.min(totalEvaluatorPages, p + 1))
                        }
                        className="h-7 w-7 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-6 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveMenu(3)}
                  className="px-6"
                >
                  Indietro
                </Button>
                <Button
                  type="button"
                  disabled={selectedTestEvaluatorIds.length === 0}
                  onClick={() => setActiveMenu(5)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                >
                  Avanti
                </Button>
              </div>
            </div>
          )}

          {/* VISTA 5: RIEPILOGO E SALVATAGGIO */}
          {activeMenu === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Riepilogo Test</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Verifica tutte le informazioni configurate prima di salvare il test.
                </p>
              </div>

              {submitSuccess ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-xl space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                  <h3 className="text-lg font-bold text-emerald-900">Test Creato con Successo!</h3>
                  <p className="text-sm text-emerald-700 max-w-md mx-auto">
                    Il test è stato registrato nel database con le relative associazioni di
                    sotto-competenze, partecipanti e valutatori.
                  </p>
                  <div className="pt-2">
                    <Button
                      onClick={() => navigate('/')}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-6"
                    >
                      Torna alla Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {submitError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span>Situazione & Competenza</span>
                        <button
                          onClick={() => setActiveMenu(1)}
                          className="text-sky-600 hover:underline"
                        >
                          Modifica
                        </button>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {selectedCompetency?.title}
                      </p>
                      <p className="text-xs text-slate-500">"{assessmentSituation}"</p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span>Sottocompetenze ({selectedSubcompetencyIds.length})</span>
                        <button
                          onClick={() => setActiveMenu(2)}
                          className="text-sky-600 hover:underline"
                        >
                          Modifica
                        </button>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {selectedSubcompetencyIds.length} selezionate
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {subCompetencies
                          .filter((s) => selectedSubcompetencyIds.includes(s.id))
                          .map((s) => s.title)
                          .join(', ')}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span>Utenti ({selectedEvaluatedUserIds.length})</span>
                        <button
                          onClick={() => setActiveMenu(3)}
                          className="text-sky-600 hover:underline"
                        >
                          Modifica
                        </button>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {selectedEvaluatedUserIds.length} partecipanti
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {evaluatedUsers
                          .filter((eu) => selectedEvaluatedUserIds.includes(eu.id))
                          .map((eu) => eu.user?.name ?? '-')
                          .join(', ')}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span>Valutatori ({selectedTestEvaluatorIds.length})</span>
                        <button
                          onClick={() => setActiveMenu(4)}
                          className="text-sky-600 hover:underline"
                        >
                          Modifica
                        </button>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {selectedTestEvaluatorIds.length} valutatori
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {testEvaluators
                          .filter((te) => selectedTestEvaluatorIds.includes(te.id))
                          .map((te) => te.user?.name ?? '-')
                          .join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-6 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveMenu(4)}
                      className="px-6"
                    >
                      Indietro
                    </Button>
                    <Button
                      type="button"
                      disabled={!isAllValid || isSubmitting}
                      onClick={handleFinalSave}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-8 gap-2"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      Salva e Crea Test
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
