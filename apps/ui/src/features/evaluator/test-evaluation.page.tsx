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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      header: "Stato Valutazione",
      cell: ({ row }) => {
        const exec = row.original;
        const isEvaluated = exec.test_score !== null && exec.test_score !== undefined;
        return isEvaluated ? (
          <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full gap-1.5 border border-green-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Valutato ({exec.test_score}/{exec.max_score})
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full gap-1.5 border border-amber-200">
            <Circle className="h-3.5 w-3.5" /> Da Valutare
          </span>
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
        <Button variant="ghost" onClick={() => navigate('/evaluations/pending')} className="pl-0 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-2 h-4 w-4" /> Torna alla lista dei test
        </Button>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20 mb-6">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
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
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground hidden sm:block">
                Totale Utenti: {executions.length}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Descrizione Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full">
                  <DialogHeader>
                    <DialogTitle>Descrizione Test</DialogTitle>
                    <DialogDescription>Dettagli del test da valutare</DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 prose prose-sm text-slate-700 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                    {test?.assessment_situation}
                  </div>
                </DialogContent>
              </Dialog>
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
