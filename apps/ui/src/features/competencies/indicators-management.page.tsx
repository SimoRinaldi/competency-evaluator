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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, RefreshCw, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getSubCompetencies, updateSubCompetencyObservationObject } from './competencies.api';
import { fetchRubrics } from '../rubrics/rubrics.api';
import { ObservationObjectPanel } from './components/observation-object-panel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type SubCompetencyItem = {
  id: number;
  title: string;
  weight: number;
  threshold: number;
  input?: string;
  output?: string;
  action?: string;
  competency?: {
    id: number;
    title: string;
    weight?: number;
    threshold?: number;
  };
  competency_id?: number;
  observation_object?: {
    id?: number;
    description: string;
    indicators?: any[];
  };
  tools?: any[];
  methods?: any[];
  skills?: any[];
};

export function IndicatorsManagementPage() {
  const [data, setData] = useState<SubCompetencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  // Stato per la modale di modifica
  const [editingSubCompetency, setEditingSubCompetency] = useState<SubCompetencyItem | null>(null);
  const [obsDescription, setObsDescription] = useState('');
  const [indicators, setIndicators] = useState<any[]>([]);
  const [dbRubrics, setDbRubrics] = useState<any[]>([]);
  const [newRubrics, setNewRubrics] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSubCompetencies();
    fetchRubrics().then(setDbRubrics).catch(console.error);
  }, []);

  async function loadSubCompetencies() {
    try {
      setLoading(true);
      const result = await getSubCompetencies();
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error('Errore nel caricamento delle sottocompetenze');
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (sub: SubCompetencyItem) => {
    setEditingSubCompetency(sub);
    setObsDescription(sub.observation_object?.description || '');
    const mappedIndicators = (sub.observation_object?.indicators || []).map((ind: any) => ({
      id: ind.id,
      description: ind.description,
      weight: ind.weight?.toString() || '1',
      rubricId: ind.rubric_set?.id
        ? `db_${ind.rubric_set.id}`
        : ind.rubric_set_id
        ? `db_${ind.rubric_set_id}`
        : '',
    }));
    setIndicators(mappedIndicators);
    setNewRubrics([]);
  };

  const handleSaveEdits = async () => {
    if (!editingSubCompetency) return;
    setIsSaving(true);
    try {
      // Invio mirato del solo oggetto di osservazione e indicatori
      const payload = {
        ...(editingSubCompetency.observation_object?.id
          ? { id: editingSubCompetency.observation_object.id }
          : {}),
        description: obsDescription,
        indicators: indicators.map((ind: any) => {
          const isTemp = ind.rubricId?.toString().startsWith('temp_');
          if (isTemp) {
            const tempIdx = parseInt(ind.rubricId.replace('temp_', ''));
            return {
              ...(ind.id ? { id: ind.id } : {}),
              description: ind.description,
              weight: parseInt(ind.weight),
              rubricSet: newRubrics[tempIdx],
            };
          } else {
            return {
              ...(ind.id ? { id: ind.id } : {}),
              description: ind.description,
              weight: parseInt(ind.weight),
              rubric_set_id: parseInt(ind.rubricId?.toString().replace('db_', '')),
            };
          }
        }),
      };

      await updateSubCompetencyObservationObject(editingSubCompetency.id, payload);
      toast.success('Oggetto di osservazione e indicatori aggiornati con successo');
      setEditingSubCompetency(null);
      await loadSubCompetencies();
    } catch (err) {
      console.error(err);
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<SubCompetencyItem>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Nome',
        cell: ({ row }) => (
          <span className="block truncate font-normal text-slate-900 max-w-[200px] md:max-w-xs">
            {row.original.title}
          </span>
        ),
      },
      {
        id: 'observation_object',
        header: 'Oggetto di Osservazione',
        cell: ({ row }) => {
          const obsDesc = row.original.observation_object?.description;
          return obsDesc ? (
            <span
              className="text-slate-700 block truncate max-w-[220px] md:max-w-md font-normal"
              title={obsDesc}
            >
              {obsDesc}
            </span>
          ) : (
            <span className="text-slate-400 italic font-normal">Non definito</span>
          );
        },
      },
      {
        id: 'indicators_count',
        header: () => <div className="text-center">Indicatori</div>,
        cell: ({ row }) => {
          const count = row.original.observation_object?.indicators?.length || 0;
          return (
            <div className="text-center">
              <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200 min-w-[24px]">
                {count}
              </span>
            </div>
          );
        },
      },
      {
        id: 'competency',
        header: 'Nome Competenza',
        cell: ({ row }) => {
          const compTitle = row.original.competency?.title;
          return compTitle ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[180px]">
              {compTitle}
            </span>
          ) : (
            <span className="text-slate-400 italic font-normal">-</span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Azioni</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer"
                    onClick={() => handleEditClick(row.original)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Modifica oggetto di osservazione e indicatori</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const title = row.original.title?.toLowerCase() || '';
      const obs = row.original.observation_object?.description?.toLowerCase() || '';
      const comp = row.original.competency?.title?.toLowerCase() || '';
      return title.includes(search) || obs.includes(search) || comp.includes(search);
    },
  });

  return (
    <PageContainer
      title="Gestione Oggetto di Osservazione e Indicatori"
      description="Seleziona una sottocompetenza per visualizzare e modificare il relativo oggetto di osservazione e i suoi indicatori."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca per sottocompetenza, oggetto o competenza..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="!pl-10 bg-white"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadSubCompetencies}
            disabled={loading}
            className="h-9 w-9 shrink-0 bg-white"
            title="Aggiorna tabella"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-slate-50/50 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-1.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                    Nessuna sottocompetenza trovata per la ricerca.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 px-1">
        <div className="text-sm font-medium text-slate-500">{table.getFilteredRowModel().rows.length} elementi</div>
      </div>

      {/* MODALE DI MODIFICA: Oggetto di osservazione e indicatori */}
      <Dialog
        open={!!editingSubCompetency}
        onOpenChange={(open) => !open && setEditingSubCompetency(null)}
      >
        <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
          <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
            <DialogHeader className="p-4 md:px-8 md:pt-8 md:pb-2">
              <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
                Modifica Oggetto di Osservazione e Indicatori
              </DialogTitle>
              {editingSubCompetency && (
                <p className="text-sm text-slate-500 mt-1">
                  {editingSubCompetency.competency?.title
                    ? `${editingSubCompetency.competency.title} > `
                    : ''}
                  {editingSubCompetency.title}
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
              <Button
                variant="outline"
                onClick={() => setEditingSubCompetency(null)}
                disabled={isSaving}
              >
                Annulla
              </Button>
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

