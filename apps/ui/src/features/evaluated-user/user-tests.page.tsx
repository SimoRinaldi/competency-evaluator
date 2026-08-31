import { useEffect, useState, useMemo } from "react";
import { fetchCurrentUser } from "../auth/auth.api";
import { getAvailableTests, getUserExecutions } from "./evaluated-user.api";
import { PageContainer } from "../../components/page-container";
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
import { 
  PlayCircle, Award, ClipboardList, Clock, 
  CheckCircle, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import { 
  Empty, EmptyContent, EmptyDescription, 
  EmptyHeader, EmptyMedia, EmptyTitle 
} from "@/components/ui/empty";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { UserTestModal } from "./user-test-modal";

const ITEMS_PER_PAGE = 5;

export function UserTestsPage({ filter }: { filter: 'todo' | 'completed' }) {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stato modale
  const [modalTestId, setModalTestId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'execute' | 'view'>('execute');
  const [modalExecution, setModalExecution] = useState<any>(null);

  // Stati tabella
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const openModal = (testId: number, mode: 'execute' | 'view', execution?: any) => {
    setModalTestId(testId);
    setModalMode(mode);
    setModalExecution(execution ?? null);
  };

  const closeModal = () => {
    setModalTestId(null);
    setModalExecution(null);
  };

  // Reset pagina e ricerca quando si cambia tab
  useEffect(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      const allTests = await getAvailableTests();
      const myExecs = await getUserExecutions(user?.id);
      
      const safeAllTests = Array.isArray(allTests) ? allTests : [];
      const safeMyExecs = Array.isArray(myExecs) ? myExecs : [];
      
      const mappedTests = safeAllTests.map((t: any) => {
        const testExecs = safeMyExecs.filter((ex: any) => ex.test_id === t.id);
        const execution = testExecs.find((ex: any) => ex.test_outputs && ex.test_outputs.length > 0) || testExecs[0];
        
        let status: 'todo' | 'submitted' | 'evaluated' = 'todo';
        
        // Un test è In Revisione (submitted) solo se ha almeno un output allegato
        const hasOutputs = execution?.test_outputs && execution.test_outputs.length > 0;
        
        if (execution && hasOutputs) {
          status = (execution.test_score !== null && execution.test_score !== undefined) ? 'evaluated' : 'submitted';
        }
        
        return { ...t, execution, status };
      });
      
      // "todo" -> non consegnati (todo) e consegnati ma in attesa di voto (submitted)
      // "completed" -> valutati definitivamente (evaluated)
      const filtered = mappedTests.filter((t: any) => {
        if (filter === 'todo') return t.status === 'todo' || t.status === 'submitted';
        return t.status === 'evaluated';
      });
      
      setTests(filtered);
    } catch (err: any) {
      setError(err?.message || "Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <span className="w-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const filteredTests = useMemo(() => {
    return tests.filter(t => 
      (t.assessment_situation || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(t.id).includes(searchQuery)
    );
  }, [tests, searchQuery]);

  const sortedTests = useMemo(() => {
    return [...filteredTests].sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];
      
      if (sortColumn === 'score') {
        valA = a.execution?.test_score || 0;
        valB = b.execution?.test_score || 0;
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTests, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedTests.length / ITEMS_PER_PAGE) || 1;
  const paginatedTests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTests.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTests, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const titles = {
    todo: "Test da Svolgere",
    completed: "Test Completati e Valutati"
  };

  const descriptions = {
    todo: "Lista dei test che ti sono stati assegnati e che devi ancora completare.",
    completed: "Consulta i tuoi test passati, le sottomissioni e le eventuali valutazioni."
  };

  const emptyIcons = {
    todo: <ClipboardList />,
    completed: <Award />
  };

  return (
    <PageContainer 
      title={titles[filter]} 
      description={descriptions[filter]}
    >
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4 border border-red-200">{error}</div>
      )}

      <div className="h-full flex flex-col gap-6">
        {/* Intestazione Tabella & Controlli */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 w-full max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cerca test per situazione o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-full bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="cursor-pointer select-none font-semibold text-slate-700" onClick={() => handleSort('assessment_situation')}>
                  <div className="flex items-center gap-1">Descrizione test {getSortIcon('assessment_situation')}</div>
                </TableHead>
                <TableHead className="w-44 pl-8 cursor-pointer select-none font-semibold text-slate-700 whitespace-nowrap" onClick={() => handleSort(filter === 'completed' ? 'score' : 'status')}>
                  <div className="flex items-center gap-1">
                    {filter === 'completed' ? 'Punteggio ottenuto / Punteggio massimo' : 'Stato'} {getSortIcon(filter === 'completed' ? 'score' : 'status')}
                  </div>
                </TableHead>
                <TableHead className="w-20 text-right font-semibold text-slate-700 whitespace-nowrap">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                    Caricamento in corso...
                  </TableCell>
                </TableRow>
              ) : paginatedTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center p-0">
                    <Empty className="border-0">
                      <EmptyHeader>
                        <EmptyMedia variant="icon" className="text-slate-400">
                          {emptyIcons[filter]}
                        </EmptyMedia>
                        <EmptyTitle>Nessun test trovato</EmptyTitle>
                        <EmptyDescription>
                          {searchQuery 
                            ? "Nessun risultato corrisponde alla tua ricerca." 
                            : (filter === 'todo' ? "Ottimo lavoro! Non hai nessun test in sospeso al momento." : "Non hai ancora completato alcun test.")}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTests.map((test) => (
                  <TableRow key={test.id} className="group">
                    <TableCell className="max-w-[420px]">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <span
                            className="block truncate text-slate-700 cursor-pointer hover:text-primary hover:underline"
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
                          <p className="leading-relaxed">{test.assessment_situation}</p>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="pl-8">
                      {test.status === 'todo' && (
                        <span className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                          Da Fare
                        </span>
                      )}
                      {test.status === 'submitted' && (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                          In Revisione
                        </span>
                      )}
                      {test.status === 'evaluated' && (
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-green-600 mr-2">
                            {test.execution?.test_score}
                          </span>
                          <span className="text-xs text-slate-500">/ {test.execution?.max_score}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {test.status === 'todo' && (
                        <Button size="sm" className="h-7 px-2.5 text-xs gap-1.5" onClick={() => openModal(test.id, 'execute', test.execution)}>
                          <PlayCircle className="h-3.5 w-3.5" /> Esegui
                        </Button>
                      )}
                      {test.status === 'submitted' && (
                        <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs gap-1.5" onClick={() => openModal(test.id, 'view', test.execution)}>
                          <Eye className="h-3.5 w-3.5" /> Dettagli
                        </Button>
                      )}
                      {test.status === 'evaluated' && (
                        <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1.5 text-green-600 border-green-200 bg-green-50" onClick={() => openModal(test.id, 'view', test.execution)}>
                          <CheckCircle className="h-3.5 w-3.5" /> Valutato
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginazione Footer */}
        {sortedTests.length > 0 && !loading && (
          <div className="flex items-center justify-between py-4 text-sm text-slate-500">
            <div>
              Mostrando da {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, sortedTests.length)} di {sortedTests.length} test
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserTestModal
        isOpen={modalTestId !== null}
        testId={modalTestId}
        mode={modalMode}
        execution={modalExecution}
        onClose={closeModal}
        onSubmitted={() => { closeModal(); loadData(); }}
      />
    </PageContainer>
  );
}

