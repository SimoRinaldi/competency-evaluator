import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTestExecutions, TestExecution, Test } from "./evaluator.api";
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
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, CheckCircle2, Circle, Search, Eye, Users } from "lucide-react";
import { PageContainer } from "../../components/page-container";
import { fetchCurrentUser } from "../auth/auth.api";
import { getEvaluatorProfile } from "./evaluator.api";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function TestEvaluationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const user = await fetchCurrentUser();
        const profile = await getEvaluatorProfile(user.id);
        const currentTest = profile.tests.find(t => t.id === Number(id));
        
        if (!currentTest) {
          throw new Error("Test non trovato o non assegnato a te.");
        }
        setTest(currentTest);

        const execs = await getTestExecutions(id as string);
        setExecutions(execs);
      } catch (err: any) {
        setError(err.message || "Errore nel caricamento dei dati.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const columns: ColumnDef<TestExecution>[] = [
    {
      accessorFn: (row) => row.evaluated_user?.user?.name || "Utente Sconosciuto",
      id: "name",
      header: "Nome",
    },
    {
      accessorFn: (row) => row.evaluated_user?.user?.email || "N/D",
      id: "email",
      header: "Email",
    },
    {
      id: "status",
      header: "Stato",
      cell: ({ row }) => {
        const exec = row.original;
        const isEvaluated = exec.test_score !== null && exec.test_score !== undefined;
        return isEvaluated ? (
          <div className="flex items-center text-green-600 font-medium gap-2">
            <CheckCircle2 className="h-4 w-4" /> Valutato ({exec.test_score}/{exec.max_score})
          </div>
        ) : (
          <div className="flex items-center text-amber-600 font-medium gap-2">
            <Circle className="h-4 w-4" /> Da Valutare
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Azioni</div>,
      cell: ({ row }) => {
        const exec = row.original;
        const isEvaluated = exec.test_score !== null && exec.test_score !== undefined;
        return (
          <div className="flex justify-end">
            <Button 
              variant={isEvaluated ? "outline" : "default"} 
              size="sm"
              onClick={() => navigate(`/evaluator/tests/${id}/execution/${exec.id}`)}
              className={isEvaluated ? "text-green-600 border-green-200 bg-green-50 gap-1.5" : "gap-1.5"}
            >
              {isEvaluated ? <Eye className="h-3.5 w-3.5" /> : null}
              {isEvaluated ? "Rivedi" : "Valuta"}
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: executions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (!loading && executions.length === 0 && !error) {
    return (
      <PageContainer 
        title={`Utenti del Test #${id}`}
        description="Elenco degli utenti assegnati a questo test da valutare."
      >
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" /> Torna indietro
          </Button>
        </div>
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Nessun utente trovato</EmptyTitle>
            <EmptyDescription>
              Nessun utente ha ancora svolto questo test. Torna più tardi per valutare le loro esecuzioni.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title={`Utenti del Test #${id}`}
      description="Visualizza e valuta le esecuzioni degli utenti per questo test."
    >
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-2 h-4 w-4" /> Torna alla lista
        </Button>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20 mb-6">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-md border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-2">Situation Assessment</h2>
            <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-wrap">
              {test?.assessment_situation}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome o email..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="!pl-10"
              />
            </div>
            <div className="text-sm font-medium text-muted-foreground hidden sm:block">
              Totale Utenti: {executions.length}
            </div>
          </div>

          <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="px-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
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
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-slate-500"
                    >
                      Nessun utente trovato per la ricerca.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
