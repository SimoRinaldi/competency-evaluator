import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../auth/auth.api";
import { getEvaluatorProfile, Test, getTestExecutions, TestExecution } from "./evaluator.api";
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
  ClipboardList, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, CheckCircle
} from "lucide-react";
import { 
  Empty, EmptyDescription, 
  EmptyHeader, EmptyMedia, EmptyTitle 
} from "@/components/ui/empty";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const ITEMS_PER_PAGE = 5;

type EvaluatorTest = Test & {
  pendingCount: number;
  completedCount: number;
  totalCount: number;
};

export function EvaluatorTestsPage({ filter }: { filter: 'pending' | 'completed' }) {
  const [tests, setTests] = useState<EvaluatorTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Stati tabella
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

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
      const profile = await getEvaluatorProfile(user.id);
      
      const evaluatorTests = profile.tests || [];
      
      // Fetch executions for each test to determine status
      const testsWithStats = await Promise.all(
        evaluatorTests.map(async (test: Test) => {
          try {
            const execs = await getTestExecutions(test.id);
            // Consideriamo solo le esecuzioni con materiale consegnato
            const deliveredExecs = execs.filter((e: TestExecution) => e.test_outputs && e.test_outputs.length > 0);
            const totalCount = deliveredExecs.length;
            const completedCount = deliveredExecs.filter((e: TestExecution) => e.test_score !== null && e.test_score !== undefined).length;
            const pendingCount = totalCount - completedCount;
            return { ...test, totalCount, completedCount, pendingCount };
          } catch (e) {
            return { ...test, totalCount: 0, completedCount: 0, pendingCount: 0 };
          }
        })
      );
      
      const filtered = testsWithStats.filter((t) => {
        if (filter === 'pending') {
          // Mostriamo nei pending SOLO i test che hanno esecuzioni da valutare
          return t.pendingCount > 0;
        } else {
          // Mostriamo nei completati solo i test che hanno ALMENO un'esecuzione, e TUTTE le esecuzioni sono valutate
          return t.totalCount > 0 && t.pendingCount === 0;
        }
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
      let valA: any = a[sortColumn as keyof typeof a];
      let valB: any = b[sortColumn as keyof typeof b];
      
      if (sortColumn === 'score') {
        valA = (a as any).score || 0;
        valB = (b as any).score || 0;
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
    pending: "Test da Valutare",
    completed: "Test Valutati"
  };

  const descriptions = {
    pending: "Lista dei test a cui sei assegnato e che richiedono la tua valutazione.",
    completed: "Storico dei test in cui hai completato tutte le valutazioni."
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
                <TableHead className="w-48 cursor-pointer select-none font-semibold text-slate-700" onClick={() => handleSort('pendingCount')}>
                  <div className="flex items-center gap-1">Stato {getSortIcon('pendingCount')}</div>
                </TableHead>
                <TableHead className="w-24 text-right font-semibold text-slate-700 whitespace-nowrap">Azioni</TableHead>
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
                          <ClipboardList />
                        </EmptyMedia>
                        <EmptyTitle>Nessun test trovato</EmptyTitle>
                        <EmptyDescription>
                          {searchQuery 
                            ? "Nessun risultato corrisponde alla tua ricerca." 
                            : (filter === 'pending' ? "Non hai test assegnati da valutare al momento." : "Non hai ancora completato la valutazione di alcun test.")}
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
                            onClick={() => navigate(`/evaluator/tests/${test.id}`)}
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
                    <TableCell>
                      {test.totalCount === 0 ? (
                        <span className="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                          In attesa di utenti
                        </span>
                      ) : test.pendingCount > 0 ? (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                          {test.pendingCount} da valutare
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                          Tutti valutati ({test.completedCount})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {test.pendingCount > 0 ? (
                        <Button size="sm" className="h-7 px-2.5 text-xs gap-1.5" onClick={() => navigate(`/evaluator/tests/${test.id}`)}>
                          <Eye className="h-3.5 w-3.5" /> Seleziona
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs gap-1.5" onClick={() => navigate(`/evaluator/tests/${test.id}`)}>
                          <CheckCircle className="h-3.5 w-3.5" /> Dettagli
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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
    </PageContainer>
  );
}
