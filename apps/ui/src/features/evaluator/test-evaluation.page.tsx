import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTestExecutions, TestExecution, getEvaluatorStatus } from "./evaluator.api";
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
import { ChevronLeft, CheckCircle2, Circle, Search, Eye, Users, FileText } from "lucide-react";
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

import { UserEvaluationModal } from "./user-evaluation-modal";

type ExtendedExecution = TestExecution & { _is_evaluated_by_me?: boolean };

export function TestEvaluationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [executions, setExecutions] = useState<ExtendedExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      const profile = await getEvaluatorProfile(user.id);
      const currentTest = profile.tests.find(t => t.id === Number(id));
      
      if (!currentTest) {
        throw new Error("Test non trovato o non assegnato a te.");
      }

      const [execs, statuses] = await Promise.all([
        getTestExecutions(id as string),
        getEvaluatorStatus(id as string)
      ]);

      const statusMap = new Map(statuses.map(s => [s.execution_id, s.is_evaluated_by_me]));

      const allExecs = execs.map(e => ({
        ...e,
        _is_evaluated_by_me: statusMap.get(e.id) || false
      }));
        
      setExecutions(allExecs);
    } catch (err: any) {
      setError(err.message || "Errore nel caricamento dei dati.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const columns: ColumnDef<ExtendedExecution>[] = [
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
        const hasDelivered = exec.test_outputs && exec.test_outputs.length > 0;
        const isCompletelyEvaluated = exec.test_score !== null && exec.test_score !== undefined;
        const isEvaluatedByMe = exec._is_evaluated_by_me;
        
        if (!hasDelivered) {
          return (
            <span className="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full gap-1.5 border border-slate-200">
              <Circle className="h-3.5 w-3.5" /> In attesa di consegna
            </span>
          );
        } else if (isCompletelyEvaluated) {
          return (
            <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full gap-1.5 border border-green-200">
              <CheckCircle2 className="h-3.5 w-3.5" /> Punteggio Finale ({exec.test_score}/{exec.max_score})
            </span>
          );
        } else if (isEvaluatedByMe) {
          return (
            <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full gap-1.5 border border-blue-200">
              <FileText className="h-3.5 w-3.5" /> La tua valutazione è stata inviata
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full gap-1.5 border border-amber-200">
              <Circle className="h-3.5 w-3.5" /> Da Valutare
            </span>
          );
        }
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Azioni</div>,
      cell: ({ row }) => {
        const exec = row.original;
        const hasDelivered = exec.test_outputs && exec.test_outputs.length > 0;
        const isCompletelyEvaluated = exec.test_score !== null && exec.test_score !== undefined;
        const isEvaluatedByMe = exec._is_evaluated_by_me;
        
        if (!hasDelivered) {
          return (
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                disabled
                className="text-slate-400 gap-1.5"
              >
                In attesa
              </Button>
            </div>
          );
        }

        const canEdit = !isCompletelyEvaluated;
        const btnVariant = isEvaluatedByMe || isCompletelyEvaluated ? "outline" : "default";
        
        return (
          <div className="flex justify-end">
            <Button 
              variant={btnVariant} 
              size="sm"
              onClick={() => setSelectedExecutionId(exec.id)}
              className={btnVariant === "outline" ? "text-slate-600 gap-1.5" : "gap-1.5"}
            >
              {btnVariant === "outline" ? <Eye className="h-3.5 w-3.5" /> : null}
              {!canEdit ? "Dettagli" : isEvaluatedByMe ? "Visualizza" : "Valuta"}
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

      {selectedExecutionId && (
        <UserEvaluationModal
          testId={id as string}
          executionId={selectedExecutionId}
          isOpen={!!selectedExecutionId}
          onClose={() => setSelectedExecutionId(null)}
          onSubmitted={() => {
            setSelectedExecutionId(null);
            loadData();
          }}
        />
      )}
    </PageContainer>
  );
}
