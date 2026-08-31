import { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '../../components/page-container';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getCompetencies, updateSubCompetency, fetchRubrics, getSubCompetencyById } from '../competencies/competencies.api';
import { RubricPickerModal } from '../competencies/components/rubric-picker-modal';
import { CreateRubricModal } from '../competencies/components/create-rubric-modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Competency = {
  id: number;
  title: string;
  weight: number;
  threshold: number;
  subcompetencies?: any[];
};

export function IndicatorsManagementPage() {
  const [data, setData] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  // Modale
  const [selectedCompetency, setSelectedCompetency] = useState<any | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSubCompetencyId, setSelectedSubCompetencyId] = useState<number | null>(null);
  const [isFetchingSub, setIsFetchingSub] = useState(false);
  const [obsId, setObsId] = useState<number | null>(null);

  // Form Step 2 (Sottocompetenza)
  const [obsDescription, setObsDescription] = useState('');
  const [indicators, setIndicators] = useState<any[]>([]);
  const [dbRubrics, setDbRubrics] = useState<any[]>([]);
  const [newRubrics, setNewRubrics] = useState<any[]>([]);

  // Mini-form indicatore
  const [indDesc, setIndDesc] = useState('');
  const [indWeight, setIndWeight] = useState('');
  const [indRubricId, setIndRubricId] = useState('');

  const [isRubricPickerOpen, setIsRubricPickerOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);

  useEffect(() => {
    loadCompetencies();
    fetchRubrics().then(setDbRubrics).catch(console.error);
  }, []);

  async function loadCompetencies() {
    try {
      setLoading(true);
      const result = await getCompetencies();
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error('Errore nel caricamento delle competenze');
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnDef<Competency>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: "Titolo",
    },
    {
      id: "subcompetencies",
      header: "Sottocompetenze",
      cell: ({ row }) => {
        const count = row.original.subcompetencies?.length || 0;
        return (
          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
            {count} prove
          </span>
        );
      },
    },
    {
      accessorKey: "weight",
      header: () => <div className="text-center">Peso</div>,
      cell: ({ row }) => <div className="text-center">{row.getValue("weight")}</div>,
    },
    {
      accessorKey: "threshold",
      header: () => <div className="text-center">Soglia</div>,
      cell: ({ row }) => <div className="text-center">{row.getValue("threshold")}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Azioni</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCompetency(row.original);
              setStep(1);
              setSelectedSubCompetencyId(null);
            }}
          >
            Gestisci <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleModalClose = () => {
    setSelectedCompetency(null);
    setStep(1);
    setSelectedSubCompetencyId(null);
  };

  const handleNextStep = async () => {
    if (selectedSubCompetencyId) {
      try {
        setIsFetchingSub(true);
        // Fetch detailed subcompetency to get obsDescription and indicators
        const detailedSub = await getSubCompetencyById(selectedSubCompetencyId);
        setObsDescription(detailedSub.obsDescription || '');
        setIndicators(detailedSub.indicators || []);
        setObsId(detailedSub.obsId || null);
        setStep(2);
      } catch (err) {
        toast.error('Impossibile caricare i dati della sottocompetenza');
      } finally {
        setIsFetchingSub(false);
      }
    }
  };

  const handleSaveSubCompetency = async () => {
    if (!selectedSubCompetencyId) return;

    try {
      const payload = {
        obsDescription,
        indicators,
        newRubrics,
      };

      await updateSubCompetency(selectedSubCompetencyId, payload, obsId);
      toast.success('Sottocompetenza aggiornata con successo');
      handleModalClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Errore durante il salvataggio');
    }
  };

  // Funzioni helper rubric
  function getSelectedRubric(idStr: string) {
    if (!idStr) return null;
    if (idStr.startsWith('db_')) {
      const id = parseInt(idStr.replace('db_', ''));
      return dbRubrics.find((r) => r.id === id);
    }
    if (idStr.startsWith('temp_')) {
      const id = parseInt(idStr.replace('temp_', ''));
      return newRubrics?.[id];
    }
    return null;
  }

  const RubricLevelsPreview = ({ rubric }: { rubric: any }) => {
    if (!rubric || !rubric.levels)
      return <span className="text-slate-400 italic">Nessuna rubrica</span>;
    const sortedLevels = [...rubric.levels].sort((a: any, b: any) => a.rank - b.rank);
    return (
      <div className="flex gap-1 overflow-x-auto">
        {sortedLevels.map((l, i) => (
          <div
            key={i}
            className="flex-shrink-0 bg-slate-100 rounded px-2 py-1 text-xs border border-slate-200"
          >
            <span className="font-bold text-slate-700">{l.rank}.</span>{' '}
            <span className="text-slate-600 truncate max-w-[150px] inline-block align-bottom">
              {l.description}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleAddCustomRubric = (rubricData: any) => {
    if (indRubricId && indRubricId.startsWith('temp_')) {
      const isUsedBySavedIndicators = indicators.some((ind: any) => ind.rubricId === indRubricId);
      if (!isUsedBySavedIndicators) {
        const idx = parseInt(indRubricId.split('_')[1], 10);
        const updated = [...newRubrics];
        updated[idx] = rubricData;
        setNewRubrics(updated);
        setIsRubricModalOpen(false);
        setIsRubricPickerOpen(true);
        return;
      }
    }
    const newIdx = newRubrics.length;
    setNewRubrics([...newRubrics, rubricData]);
    setIndRubricId(`temp_${newIdx}`);
    setIsRubricModalOpen(false);
    setIsRubricPickerOpen(true);
  };

  function handleAddIndicator() {
    if (!indDesc || !indWeight || !indRubricId) return;
    setIndicators([
      ...indicators,
      { description: indDesc, weight: indWeight, rubricId: indRubricId },
    ]);
    setIndDesc('');
    setIndWeight('');
    setIndRubricId('');
  }

  const isStep1Valid = selectedSubCompetencyId !== null;
  const isStep2Valid = obsDescription.trim() !== '' && indicators.length > 0;

  return (
    <PageContainer
      title="Gestione Oggetto di Osservazione e Indicatori"
      description="Seleziona una competenza per gestire gli indicatori delle sue sottocompetenze."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="!pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-muted-foreground hidden sm:block">
            Totale: {data.length}
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-4 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  Nessuna competenza trovata per la ricerca.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCompetency} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="max-w-[95vw] xl:max-w-[1200px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
          
          {/* SIDEBAR */}
          <div className="w-full md:w-72 shrink-0 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col md:block">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-8 hidden md:block">
              Gestione Indicatori
            </h2>

            <ul className="flex flex-row md:flex-col gap-2 md:gap-6 relative overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              <div className="hidden md:block absolute left-[15px] top-4 bottom-[calc(100%-6rem)] w-[2px] bg-slate-200 -z-10"></div>

              {/* STEP 1 */}
              <li className="relative shrink-0">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center md:items-start gap-2 md:gap-4 text-left group"
                >
                  <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    step === 1
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : isStep1Valid
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    1
                  </div>
                  <div className="pt-1.5 hidden md:block">
                    <div className={`font-semibold transition-colors ${step === 1 ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                      Seleziona prova
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Scegli sottocompetenza</div>
                  </div>
                </button>
              </li>

              {/* STEP 2 */}
              <li className="relative shrink-0">
                <button
                  onClick={handleNextStep}
                  disabled={!isStep1Valid}
                  className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${!isStep1Valid ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    step === 2
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : isStep2Valid
                      ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    2
                  </div>
                  <div className="pt-1.5 hidden md:block">
                    <div className={`font-semibold transition-colors ${step === 2 ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                      Dati Prova
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Oggetto e Indicatori</div>
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
            <DialogHeader className="p-4 md:px-8 md:pt-8 md:pb-2">
              <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
                {step === 1 && "Seleziona Sottocompetenza"}
                {step === 2 && "Modifica Oggetto e Indicatori"}
              </DialogTitle>
              <div className="w-auto mx-2 mt-4 mb-3 h-px bg-slate-200" />
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4">
              
              {/* CONTENT STEP 1 */}
              {step === 1 && (
                <div className="space-y-4 flex flex-col h-full">
                  <p className="text-sm text-slate-500">
                    Competenza: <strong className="text-slate-900">{selectedCompetency?.title}</strong>
                  </p>
                  <div className="bg-white flex flex-col flex-1 border border-slate-200 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="w-12 text-center"></TableHead>
                          <TableHead>Titolo</TableHead>
                          <TableHead className="text-center">Peso</TableHead>
                          <TableHead className="text-center">Soglia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!selectedCompetency?.subcompetencies || selectedCompetency.subcompetencies.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                              Questa competenza non ha sottocompetenze.
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedCompetency.subcompetencies.map((sub: any) => (
                            <TableRow 
                              key={sub.id}
                              className="cursor-pointer hover:bg-slate-50"
                              onClick={() => setSelectedSubCompetencyId(sub.id)}
                            >
                              <TableCell className="text-center">
                                <input
                                  type="radio"
                                  name="subcomp"
                                  className="cursor-pointer h-4 w-4 text-primary"
                                  checked={selectedSubCompetencyId === sub.id}
                                  onChange={() => setSelectedSubCompetencyId(sub.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium text-slate-900">{sub.title}</TableCell>
                              <TableCell className="text-center text-slate-600">{sub.weight}</TableCell>
                              <TableCell className="text-center text-slate-600">{sub.threshold}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={handleModalClose}>Chiudi</Button>
                    <Button 
                      onClick={handleNextStep} 
                      disabled={!isStep1Valid || isFetchingSub}
                    >
                      {isFetchingSub ? <Loader2 className="h-4 w-4 animate-spin" /> : "Avanti"}
                    </Button>
                  </div>
                </div>
              )}

              {/* CONTENT STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 pb-6 flex flex-col h-full">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Descrizione Oggetto di Osservazione <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={obsDescription}
                      onChange={(e) => setObsDescription(e.target.value)}
                      placeholder="Es. Tema di italiano"
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Indicatori associati ({indicators.length})
                    </h3>

                    {indicators.length > 0 && (
                      <ul className="space-y-3">
                        {indicators.map((ind, idx) => {
                          const r = getSelectedRubric(ind.rubricId);
                          return (
                            <li key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-sm relative group">
                              <button 
                                type="button"
                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  const newInds = [...indicators];
                                  newInds.splice(idx, 1);
                                  setIndicators(newInds);
                                }}
                              >
                                &times;
                              </button>
                              <div className="flex justify-between items-center mb-2 pr-6">
                                <strong className="text-slate-900">{ind.description}</strong>
                                <span className="text-sm bg-white text-slate-600 px-2 py-1 rounded border border-slate-200 font-medium">
                                  Peso: {ind.weight}
                                </span>
                              </div>
                              <RubricLevelsPreview rubric={r} />
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="font-medium text-slate-700">+ Aggiungi un indicatore</h4>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Descrizione <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={indDesc}
                              onChange={(e) => setIndDesc(e.target.value)}
                              placeholder="Es. Usa punteggiatura corretta"
                              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>
                          <div className="w-32 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Peso (1-5) <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={indWeight}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (e.target.value === '' || (val >= 1 && val <= 5)) {
                                  setIndWeight(e.target.value);
                                }
                              }}
                              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4 items-end">
                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Rubrica Valutazione <span className="text-red-500">*</span></label>
                            <div className="flex gap-2 items-stretch">
                              <div className={`flex-1 px-3 py-2 border rounded-md text-sm ${indRubricId ? 'bg-sky-50/50 border-sky-200' : 'bg-white border-slate-200 text-slate-500'}`}>
                                {indRubricId ? <RubricLevelsPreview rubric={getSelectedRubric(indRubricId)} /> : 'Nessuna selezionata'}
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsRubricPickerOpen(true)}
                                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-2 text-sm font-medium hover:bg-slate-100"
                              >
                                Scegli
                              </button>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!indDesc.trim() || !indWeight || parseInt(indWeight) < 1 || parseInt(indWeight) > 5 || !indRubricId}
                            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-300 disabled:pointer-events-none"
                            onClick={handleAddIndicator}
                          >
                            + Aggiungi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setStep(1)}>Indietro</Button>
                    <Button onClick={handleSaveSubCompetency} disabled={!isStep2Valid}>Salva Modifiche</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RubricPickerModal
        isOpen={isRubricPickerOpen}
        onClose={() => setIsRubricPickerOpen(false)}
        dbRubrics={dbRubrics}
        newRubrics={newRubrics}
        onSelect={(selectedId: string) => {
          setIndRubricId(selectedId);
          setIsRubricPickerOpen(false);
        }}
        onCreateNew={() => {
          setIsRubricPickerOpen(false);
          setIsRubricModalOpen(true);
        }}
      />

      {isRubricModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg relative">
            <button
              type="button"
              onClick={() => setIsRubricModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
            >
              &times;
            </button>
            <div className="mb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight">Crea Nuova Rubrica</h2>
            </div>
            <CreateRubricModal onSave={handleAddCustomRubric} />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
