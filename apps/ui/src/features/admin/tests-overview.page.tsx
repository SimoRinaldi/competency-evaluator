import { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '@/components/page-container';
import { fetchTests, ApiTest, fetchEvaluatedUsers, fetchTestEvaluators } from '../tests/tests.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { FolderCode, Search } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ViewTestModal } from '../tests/view-test-modal';

const columns: ColumnDef<ApiTest>[] = [
  {
    accessorKey: "assessment_situation",
    header: "Descrizione test",
    cell: ({ row }) => {
      const test = row.original;
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="block truncate font-medium text-slate-900 cursor-pointer hover:text-primary hover:underline">
              {test.assessment_situation}
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="w-96 bg-white text-sm text-slate-700 shadow-lg border border-slate-200">
            <p className="font-semibold text-slate-900 mb-1">Descrizione test</p>
            <p className="leading-relaxed">{test.assessment_situation}</p>
          </HoverCardContent>
        </HoverCard>
      );
    }
  },
  {
    id: "designer",
    header: "Test Designer",
    cell: ({ row }) => {
      const test = row.original;
      return <span className="text-slate-600">{test.test_designer?.user?.name || `ID: ${test.test_designer_id}`}</span>;
    }
  },
  {
    accessorKey: "evaluated_users_count",
    header: "Studenti",
    cell: ({ row }) => (
      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
        {row.original.evaluated_users_count || 0}
      </span>
    )
  },
  {
    accessorKey: "evaluators_count",
    header: "Valutatori",
    cell: ({ row }) => (
      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
        {row.original.evaluators_count || 0}
      </span>
    )
  },
  {
    id: "subcompetencies",
    header: "Prove",
    cell: ({ row }) => (
      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
        {row.original.subcompetencies?.length || 0} prove
      </span>
    )
  }
];

export function TestsOverviewPage() {
  const [data, setData] = useState<ApiTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [viewingTestId, setViewingTestId] = useState<number | null>(null);

  useEffect(() => {
    async function loadTests() {
      setLoading(true);
      try {
        const [testsRes, evaluatedUsersRes, testEvaluatorsRes] = await Promise.all([
          fetchTests(),
          fetchEvaluatedUsers(),
          fetchTestEvaluators(),
        ]);

        const evaluatedUsersCountByTest = new Map<number, number>();
        for (const eu of evaluatedUsersRes) {
          const testIds = new Set((eu.test_executions || []).map((e) => e.test_id));
          for (const testId of testIds) {
            evaluatedUsersCountByTest.set(testId, (evaluatedUsersCountByTest.get(testId) || 0) + 1);
          }
        }

        const evaluatorsCountByTest = new Map<number, number>();
        for (const te of testEvaluatorsRes) {
          for (const t of te.tests || []) {
            evaluatorsCountByTest.set(t.id, (evaluatorsCountByTest.get(t.id) || 0) + 1);
          }
        }

        setData(testsRes.map((test) => ({
          ...test,
          evaluated_users_count: evaluatedUsersCountByTest.get(test.id) || 0,
          evaluators_count: evaluatorsCountByTest.get(test.id) || 0,
        })));
      } catch (err) {
        console.error('Failed to fetch tests', err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

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

  if (!loading && data.length === 0) {
    return (
      <PageContainer
        title="Visualizzazione Test"
        description="Visualizza e consulta tutti i test presenti nel sistema."
      >
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderCode />
            </EmptyMedia>
            <EmptyTitle>Nessun test presente</EmptyTitle>
            <EmptyDescription>
              Non ci sono test configurati nel sistema al momento.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Visualizzazione Test"
      description="Visualizza e consulta tutti i test presenti nel sistema."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per descrizione..."
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
                    <TableHead key={header.id} className="px-4">
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Caricamento in corso...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => setViewingTestId(row.original.id)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-1.5">
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nessun test trovato per la ricerca.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ViewTestModal
        isOpen={viewingTestId !== null}
        testId={viewingTestId}
        onClose={() => setViewingTestId(null)}
      />
    </PageContainer>
  );
}
