import { useEffect, useState, useMemo } from 'react';
import { fetchCurrentUser } from '../auth/auth.api';
import {
  getAvailableTestsByUserId,
  getUserExecutions,
} from './evaluated-user.api';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Award,
  ClipboardList,
  Search,
  RefreshCw,
  Play,
  Eye,
  FileCheck,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { UserTestModal } from './user-test-modal';

interface UserTestItem {
  id: number;
  assessment_situation: string;
  execution?: any;
  status: 'todo' | 'submitted' | 'evaluated';
  [key: string]: any;
}

export function UserTestsPage({ filter }: { filter: 'todo' | 'completed' }) {
  const [tests, setTests] = useState<UserTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stato modale
  const [modalTestId, setModalTestId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'execute' | 'view'>('execute');
  const [modalExecution, setModalExecution] = useState<any>(null);

  // Filtro ricerca TanStack Table
  const [globalFilter, setGlobalFilter] = useState('');

  const openModal = (testId: number, mode: 'execute' | 'view', execution?: any) => {
    setModalTestId(testId);
    setModalMode(mode);
    setModalExecution(execution ?? null);
  };

  const closeModal = () => {
    setModalTestId(null);
    setModalExecution(null);
  };

  useEffect(() => {
    setGlobalFilter('');
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      const allTests = await getAvailableTestsByUserId(user.id);
      const myExecs = await getUserExecutions(user?.id);

      const safeAllTests = Array.isArray(allTests) ? allTests : [];
      const safeMyExecs = Array.isArray(myExecs) ? myExecs : [];

      const mappedTests: UserTestItem[] = safeAllTests.map((t: any) => {
        const testExecs = safeMyExecs.filter((ex: any) => ex.test_id === t.id);
        const execution =
          testExecs.find((ex: any) => ex.test_outputs && ex.test_outputs.length > 0) ||
          testExecs[0];

        let status: 'todo' | 'submitted' | 'evaluated' = 'todo';

        // Un test è In Revisione (submitted) solo se ha almeno un output allegato
        const hasOutputs = execution?.test_outputs && execution.test_outputs.length > 0;

        if (execution && hasOutputs) {
          status =
            execution.test_score !== null && execution.test_score !== undefined
              ? 'evaluated'
              : 'submitted';
        }

        return { ...t, execution, status };
      });

      // "todo" -> non consegnati (todo) e consegnati ma in attesa di voto (submitted)
      // "completed" -> valutati definitivamente (evaluated)
      const filtered = mappedTests.filter((t: UserTestItem) => {
        if (filter === 'todo') return t.status === 'todo' || t.status === 'submitted';
        return t.status === 'evaluated';
      });

      setTests(filtered);
    } catch (err: any) {
      setError(err?.message || 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo<ColumnDef<UserTestItem>[]>(() => {
    const cols: ColumnDef<UserTestItem>[] = [
      {
        accessorKey: 'id',
        header: 'Numero',
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-600">
            #{row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'assessment_situation',
        header: 'Descrizione test',
        cell: ({ row }) => {
          const test = row.original;
          return (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span
                  className="block truncate max-w-[420px] font-normal text-slate-700 cursor-pointer hover:text-primary hover:underline"
                  onClick={() => {
                    if (test.status === 'todo') {
                      openModal(test.id, 'execute', test.execution);
                    } else {
                      openModal(test.id, 'view', test.execution);
                    }
                  }}
                >
                  {test.assessment_situation}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-96 bg-white text-sm text-slate-700 shadow-lg border border-slate-200">
                <p className="font-semibold text-slate-900 mb-1">Descrizione test</p>
                <p className="leading-relaxed whitespace-pre-wrap font-normal">{test.assessment_situation}</p>
              </HoverCardContent>
            </HoverCard>
          );
        },
      },
    ];

    if (filter === 'completed') {
      cols.push({
        id: 'score',
        header: 'Punteggio ottenuto / Punteggio massimo',
        cell: ({ row }) => {
          const execution = row.original.execution;
          return (
            <div className="flex items-center font-normal text-slate-700">
              <span className="text-sm mr-1.5">
                {execution?.test_score !== null && execution?.test_score !== undefined
                  ? execution.test_score
                  : '—'}
              </span>
              <span className="text-xs text-muted-foreground">
                / {execution?.max_score ?? '—'}
              </span>
            </div>
          );
        },
      });
    } else {
      cols.push({
        accessorKey: 'status',
        header: 'Stato',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div>
              {status === 'todo' && (
                <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200">
                  Da fare
                </span>
              )}
              {status === 'submitted' && (
                <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200">
                  In revisione
                </span>
              )}
            </div>
          );
        },
      });
    }

    cols.push({
      id: 'actions',
      header: () => <div className="text-right">Azioni</div>,
      cell: ({ row }) => {
        const test = row.original;
        return (
          <div className="flex justify-end items-center">
            <TooltipProvider delayDuration={150}>
              {test.status === 'todo' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer"
                      onClick={() => openModal(test.id, 'execute', test.execution)}
                    >
                      <Play className="h-4 w-4" />
                      <span className="sr-only">Esegui test</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Esegui test</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {test.status === 'submitted' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer"
                      onClick={() => openModal(test.id, 'view', test.execution)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Visualizza dettagli</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Visualizza dettagli</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {test.status === 'evaluated' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer"
                      onClick={() => openModal(test.id, 'view', test.execution)}
                    >
                      <FileCheck className="h-4 w-4" />
                      <span className="sr-only">Visualizza risultato</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Visualizza risultato</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        );
      },
    });

    return cols;
  }, [filter]);

  const table = useReactTable({
    data: tests,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const query = String(filterValue).toLowerCase();
      const situation = String(row.original.assessment_situation || '').toLowerCase();
      const id = String(row.original.id);
      return situation.includes(query) || id.includes(query);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const titles = {
    todo: 'Test da Svolgere',
    completed: 'Test Completati e Valutati',
  };

  const descriptions = {
    todo: 'Lista dei test che ti sono stati assegnati e che devi ancora completare.',
    completed: 'Consulta i tuoi test passati, le sottomissioni e le eventuali valutazioni.',
  };

  const emptyIcons = {
    todo: <ClipboardList />,
    completed: <Award />,
  };

  if (!loading && tests.length === 0) {
    return (
      <PageContainer title={titles[filter]} description={descriptions[filter]}>
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4 border border-red-200">
            {error}
          </div>
        )}
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="text-muted-foreground">
              {emptyIcons[filter]}
            </EmptyMedia>
            <EmptyTitle>Nessun test presente</EmptyTitle>
            <EmptyDescription>
              {filter === 'todo'
                ? 'Ottimo lavoro! Non hai nessun test in sospeso al momento.'
                : 'Non hai ancora completato alcun test.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={titles[filter]} description={descriptions[filter]}>
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca test per situazione o ID..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="!pl-10 bg-white"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={loading}
            className="shrink-0 bg-white"
            title="Aggiorna tabella"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 font-semibold text-slate-900">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Caricamento in corso...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-1.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nessun test trovato per i criteri di ricerca.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4 px-1">
        <div className="text-sm font-medium text-slate-500">
          {table.getFilteredRowModel().rows.length} elementi
        </div>
      </div>

      <UserTestModal
        isOpen={modalTestId !== null}
        testId={modalTestId}
        mode={modalMode}
        execution={modalExecution}
        onClose={closeModal}
        onSubmitted={() => {
          closeModal();
          loadData();
        }}
      />
    </PageContainer>
  );
}
