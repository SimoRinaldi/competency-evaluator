import { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '../../components/page-container';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { Search, Loader2, RefreshCw, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getCompetencies, getCompetencyById, updateCompetencyChain, fetchRubrics } from '../competencies/competencies.api';
import { ObservationObjectPanel } from '../competencies/components/observation-object-panel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

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

  // Modale e selezione
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailedCompetency, setDetailedCompetency] = useState<any>(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // Editing state
  const [editingSubCompetency, setEditingSubCompetency] = useState<any>(null);
  const [obsDescription, setObsDescription] = useState('');
  const [indicators, setIndicators] = useState<any[]>([]);
  const [dbRubrics, setDbRubrics] = useState<any[]>([]);
  const [newRubrics, setNewRubrics] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSelectCompetency = async (id: number) => {
    setSelectedCompetencyId(id);
    setIsModalOpen(true);
    setLoadingModal(true);
    setEditingSubCompetency(null);
    try {
      const detailed = await getCompetencyById(id);
      setDetailedCompetency(detailed);
    } catch (err) {
      console.error(err);
      toast.error('Errore nel caricamento del dettaglio competenza');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleEditClick = (sub: any) => {
    setEditingSubCompetency(sub);
    setObsDescription(sub.observation_object?.description || '');
    const mappedIndicators = (sub.observation_object?.indicators || []).map((ind: any) => ({
      id: ind.id,
      description: ind.description,
      weight: ind.weight.toString(),
      rubricId: ind.rubric_set?.id ? `db_${ind.rubric_set.id}` : ''
    }));
    setIndicators(mappedIndicators);
    setNewRubrics([]);
  };

  const handleSaveEdits = async () => {
    if (!detailedCompetency || !editingSubCompetency) return;
    setIsSaving(true);
    try {
      const payload = {
        title: detailedCompetency.title,
        weight: detailedCompetency.weight,
        threshold: detailedCompetency.threshold,
        subcompetencies: detailedCompetency.subcompetencies.map((sub: any) => {
          if (sub.id === editingSubCompetency.id) {
            return {
              id: sub.id,
              title: sub.title,
              weight: sub.weight,
              threshold: sub.threshold,
              input: sub.input,
              output: sub.output,
              action: sub.action,
              tool_ids: sub.tools?.map((t: any) => t.id) || [],
              method_ids: sub.methods?.map((m: any) => m.id) || [],
              skill_ids: sub.skills?.map((s: any) => s.id) || [],
              observationObject: {
                id: sub.observation_object?.id,
                description: obsDescription,
                indicators: indicators.map(ind => {
                  const isTemp = ind.rubricId?.toString().startsWith('temp_');
                  if (isTemp) {
                    const tempIdx = parseInt(ind.rubricId.replace('temp_', ''));
                    return {
                      ...(ind.id ? { id: ind.id } : {}),
                      description: ind.description,
                      weight: parseInt(ind.weight),
                      rubricSet: newRubrics[tempIdx]
                    };
                  } else {
                    return {
                      ...(ind.id ? { id: ind.id } : {}),
                      description: ind.description,
                      weight: parseInt(ind.weight),
                      rubric_set_id: parseInt(ind.rubricId?.toString().replace('db_', ''))
                    };
                  }
                })
              }
            };
          } else {
            return {
              id: sub.id,
              title: sub.title,
              weight: sub.weight,
              threshold: sub.threshold,
              input: sub.input,
              output: sub.output,
              action: sub.action,
              tool_ids: sub.tools?.map((t: any) => t.id) || [],
              method_ids: sub.methods?.map((m: any) => m.id) || [],
              skill_ids: sub.skills?.map((s: any) => s.id) || [],
              observationObject: {
                id: sub.observation_object?.id,
                description: sub.observation_object?.description || "Mancante",
                indicators: (sub.observation_object?.indicators || []).map((ind: any) => ({
                  id: ind.id,
                  description: ind.description,
                  weight: ind.weight,
                  rubric_set_id: ind.rubric_set?.id
                }))
              }
            };
          }
        })
      };
      
      await updateCompetencyChain(detailedCompetency.id, payload);
      toast.success('Sottocompetenza aggiornata con successo');
      await handleSelectCompetency(detailedCompetency.id); // Ricarica
    } catch (err) {
      console.error(err);
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<Competency>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: "Titolo",
      cell: ({ row }) => (
        <span 
          className="block truncate font-medium text-slate-900 cursor-pointer hover:text-primary hover:underline"
          onClick={() => handleSelectCompetency(row.original.id)}
        >
          {row.original.title}
        </span>
      )
    },
    {
      id: "subcompetencies",
      header: "Sottocompetenze",
      cell: ({ row }) => {
        const count = row.original.subcompetencies?.length || 0;
        return (
          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
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
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  });

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCompetencyId(null);
    setDetailedCompetency(null);
    setEditingSubCompetency(null);
  };

  return (
    <PageContainer
      title="Gestione Oggetto di Osservazione e Indicatori"
      description="Seleziona una competenza per visualizzare le sue sottocompetenze e i relativi oggetti di valutazione."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca per titolo..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9 h-9 w-full bg-white"
            />
          </div>
          <Button variant="outline" size="icon" onClick={loadCompetencies} disabled={loading} className="h-9 w-9 shrink-0 bg-white" title="Aggiorna tabella">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="px-4 whitespace-nowrap">
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
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-slate-50/50 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 align-middle">
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
      </div>

      <div className="flex items-center justify-between py-4 px-1">
        <div className="text-sm font-medium text-slate-500">
          {data.length} elementi
        </div>
        {table.getPageCount() > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Precedente
            </Button>
            <div className="text-sm font-medium text-slate-600 px-2">
              Pagina {table.getState().pagination.pageIndex + 1} di {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Successiva <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* MODALE 1: Lista Sottocompetenze */}
      <Dialog open={isModalOpen && !editingSubCompetency} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
          <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
            <DialogHeader className="p-4 md:px-8 md:pt-8 md:pb-2">
              <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
                Sottocompetenze e Indicatori
              </DialogTitle>
              {detailedCompetency && (
                <p className="text-sm text-slate-500 mt-1">
                  {detailedCompetency.title}
                </p>
              )}
              <div className="w-auto mx-2 mt-4 mb-3 h-px bg-slate-200" />
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4">
              {loadingModal ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-slate-500">Caricamento dati dal server...</p>
                </div>
              ) : detailedCompetency ? (
                <div className="space-y-6 flex flex-col h-full">
                  <div className="bg-white flex flex-col flex-1 border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold text-slate-700 py-3 w-1/2">
                            Descrizione della sottocompetenza
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3 w-1/2">
                            Oggetto di valutazione
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 py-3 text-right">
                            Azioni
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedCompetency.subcompetencies && detailedCompetency.subcompetencies.length > 0 ? (
                          detailedCompetency.subcompetencies.map((sub: any) => (
                            <TableRow key={sub.id} className="hover:bg-slate-50 group">
                              <TableCell className="font-medium text-slate-900 py-3 align-middle">
                                {sub.title}
                              </TableCell>
                              <TableCell className="text-slate-600 py-3 align-middle">
                                {sub.observation_object?.description || <span className="text-slate-400 italic">Non definito</span>}
                              </TableCell>
                              <TableCell className="text-right py-3 align-middle">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-500 hover:text-sky-600 cursor-pointer" 
                                    title="Modifica"
                                    onClick={() => handleEditClick(sub)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-slate-400">
                              Nessuna sottocompetenza trovata per questa competenza.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
                  <p className="text-sm text-slate-500">Errore nel caricamento dei dati.</p>
                </div>
              )}
            </div>
            <div className="p-4 md:px-8 md:py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50/50">
               <Button variant="outline" onClick={handleModalClose}>Chiudi</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODALE 2: Modifica Sottocompetenza */}
      <Dialog open={!!editingSubCompetency} onOpenChange={(open) => !open && setEditingSubCompetency(null)}>
        <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
          <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
            <DialogHeader className="p-4 md:px-8 md:pt-8 md:pb-2">
              <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
                Modifica Sottocompetenza
              </DialogTitle>
              {detailedCompetency && editingSubCompetency && (
                <p className="text-sm text-slate-500 mt-1">
                  {detailedCompetency.title} &gt; {editingSubCompetency.title}
                </p>
              )}
              <div className="w-auto mx-2 mt-4 mb-3 h-px bg-slate-200" />
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4">
              <div className="space-y-4">
                <ObservationObjectPanel
                  obsDescription={obsDescription}
                  setObsDescription={setObsDescription}
                  indicators={indicators}
                  setIndicators={setIndicators}
                  dbRubrics={dbRubrics}
                  newRubrics={newRubrics}
                  setNewRubrics={setNewRubrics}
                  allowCreateRubric={false}
                />
              </div>
            </div>
            <div className="p-4 md:px-8 md:py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50/50">
               <Button variant="outline" onClick={() => setEditingSubCompetency(null)} disabled={isSaving}>Annulla</Button>
               <Button onClick={handleSaveEdits} disabled={isSaving}>
                 {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                 Salva Modifiche
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

