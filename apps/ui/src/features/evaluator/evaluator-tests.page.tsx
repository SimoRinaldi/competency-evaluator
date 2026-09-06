import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api';
import { getEvaluatorProfile, Test, getTestExecutions, TestExecution } from './evaluator.api';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  FileText,
  MousePointerClick,
  RefreshCw,
  Play
} from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type EvaluatorTest = Test & {
  pendingCount: number;
  completedCount: number;
  totalCount: number;
};

const getColumns = (filter: 'pending' | 'completed', navigate: (path: string) => void): ColumnDef<EvaluatorTest>[] => [
  {
    accessorKey: 'id',
    header: 'Numero',
    cell: ({ row }) => <span className="text-sm font-normal text-slate-600">#{row.original.id}</span>,
  },
  {
    accessorKey: 'assessment_situation',
    header: 'Descrizione',
    cell: ({ row }) => {
      const test = row.original;
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="block truncate max-w-[420px] font-normal text-slate-700 cursor-pointer hover:text-primary hover:underline" onClick={() => navigate(`/evaluator/tests/${test.id}`)}>
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
  {
    accessorKey: 'pendingCount',
    header: 'Stato',
    cell: ({ row }) => {
      const test = row.original;
      return test.totalCount === 0 ? (
        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200">
          In attesa di utenti
        </span>
      ) : test.pendingCount > 0 ? (
        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200">
          {test.pendingCount} {test.pendingCount === 1 ? 'utente in sospeso' : 'utenti in sospeso'}
        </span>
      ) : (
        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200">
          completato
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Azioni</div>,
    cell: ({ row }) => {
      const test = row.original;
      return (
        <div className="flex justify-end items-center">
          <TooltipProvider delayDuration={150}>
            {test.pendingCount > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer" onClick={() => navigate(`/evaluator/tests/${test.id}`)}>
                    <Play className="h-4 w-4" />
                    <span className="sr-only">Seleziona test</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Seleziona test</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer" onClick={() => navigate(`/evaluator/tests/${test.id}`)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Dettagli test</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Dettagli test</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      );
    },
  },
];

export function EvaluatorTestsPage({ filter }: { filter: 'pending' | 'completed' }) {
  const [tests, setTests] = useState<EvaluatorTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    setGlobalFilter('');
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      const profile = await getEvaluatorProfile(user.id);

      const evaluatorTests = profile.tests || [];

      // Fetch executions for each test to determine status
      const testsWithStats = await Promise.all(
        evaluatorTests.map(async (test: Test) => {
          try {
            const execs = await getTestExecutions(test.id);
            const totalCount = execs.length;
            const completedCount = execs.filter(
              (e: TestExecution) => e.test_score !== null && e.test_score !== undefined
            ).length;
            const pendingCount = totalCount - completedCount;
            return { ...test, totalCount, completedCount, pendingCount };
          } catch (e) {
            return { ...test, totalCount: 0, completedCount: 0, pendingCount: 0 };
          }
        })
      );

      const filtered = testsWithStats.filter((t) => {
        if (filter === 'pending') {
          return t.pendingCount > 0;
        } else {
          return t.totalCount > 0 && t.pendingCount === 0;
        }
      });

      setTests(filtered);
    } catch (err: any) {
      setError(err?.message || 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo(() => getColumns(filter, navigate), [filter, navigate]);

  const table = useReactTable({
    data: tests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const idStr = String(row.original.id);
      const desc = (row.original.assessment_situation || '').toLowerCase();
      return idStr.includes(search) || desc.includes(search);
    },
  });

  const titles = {
    pending: 'Test da valutare',
    completed: 'Test valutati',
  };

  const descriptions = {
    pending: 'Lista dei test a cui sei assegnato e che richiedono la tua valutazione.',
    completed: 'Storico dei test in cui hai completato tutte le valutazioni.',
  };

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
              placeholder="Cerca test per numero o descrizione..."
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500 font-normal">
                  Caricamento in corso...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-1.5 font-normal">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center p-0">
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="text-slate-400">
                        <ClipboardList />
                      </EmptyMedia>
                      <EmptyTitle>Nessun test trovato</EmptyTitle>
                      <EmptyDescription>
                        {globalFilter
                          ? 'Nessun risultato corrisponde alla tua ricerca.'
                          : filter === 'pending'
                          ? 'Non hai test assegnati da valutare al momento.'
                          : 'Non hai ancora completato la valutazione di alcun test.'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
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
    </PageContainer>
  );
}
