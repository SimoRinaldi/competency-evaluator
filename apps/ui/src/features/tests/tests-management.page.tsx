import { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '@/components/page-container';
import { fetchTests, deleteTest, ApiTest, ApiCompetency, ApiSubCompetency, ApiUser, fetchCompetencies, fetchSubCompetencies, fetchTestDesigners, createTest, fetchEvaluatedUsers, fetchTestEvaluators } from './tests.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Loader2, FolderCode, Edit, Trash2, RefreshCw, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateTestModal } from './create-test-modal';
import { ViewTestModal } from './view-test-modal';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const ITEMS_PER_PAGE = 5;

export function TestsManagementPage() {
  const [tests, setTests] = useState<ApiTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data per modal
  const [competencies, setCompetencies] = useState<ApiCompetency[]>([]);
  const [subCompetencies, setSubCompetencies] = useState<ApiSubCompetency[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [evaluators, setEvaluators] = useState<ApiUser[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTestId, setViewingTestId] = useState<number | null>(null);
  const [deleteTargetTest, setDeleteTargetTest] = useState<ApiTest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // Stati tabella
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof ApiTest>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTests();
    loadModalData();
  }, []);

  async function loadTests() {
    setIsLoading(true);
    try {
      const [testsRes, evaluatedUsersRes, testEvaluatorsRes] = await Promise.all([
        fetchTests(),
        fetchEvaluatedUsers(),
        fetchTestEvaluators(),
      ]);

      // Conta gli studenti distinti per test (quanti EvaluatedUser hanno almeno un'esecuzione per quel test)
      const evaluatedUsersCountByTest = new Map<number, number>();
      for (const eu of evaluatedUsersRes) {
        const testIds = new Set((eu.test_executions || []).map((e) => e.test_id));
        for (const testId of testIds) {
          evaluatedUsersCountByTest.set(testId, (evaluatedUsersCountByTest.get(testId) || 0) + 1);
        }
      }

      // Conta i valutatori per test
      const evaluatorsCountByTest = new Map<number, number>();
      for (const te of testEvaluatorsRes) {
        for (const t of te.tests || []) {
          evaluatorsCountByTest.set(t.id, (evaluatorsCountByTest.get(t.id) || 0) + 1);
        }
      }

      setTests(testsRes.map((test) => ({
        ...test,
        evaluated_users_count: evaluatedUsersCountByTest.get(test.id) || 0,
        evaluators_count: evaluatorsCountByTest.get(test.id) || 0,
      })));

      // Aggiorna anche i dati dei dropdown nella modale
      setUsers(evaluatedUsersRes.filter((eu) => eu.user).map((eu) => ({ ...eu.user!, id: eu.id })));
      setEvaluators(testEvaluatorsRes.filter((te) => te.user).map((te) => ({ ...te.user!, id: te.id })));
    } catch (err) {
      console.error('Failed to fetch tests', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadModalData() {
    try {
      const [compRes, subRes] = await Promise.all([
        fetchCompetencies(),
        fetchSubCompetencies(),
      ]);
      setCompetencies(compRes);
      setSubCompetencies(subRes);
    } catch (err) {
      console.error('Failed to fetch modal data', err);
      setCompetencies([]);
      setSubCompetencies([]);
    }
  }

  const handleDeleteTest = async (id: number) => {
    try {
      setIsDeletingId(id);
      await deleteTest(id);
      await loadTests();
    } catch (err) {
      console.error('Failed to delete test', err);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCreateTest = async (testData: {
    assessmentSituation: string;
    competencyId: number;
    subcompetencyIds: number[];
    userIds: number[];
    evaluatorIds: number[];
  }) => {
    setIsSubmitting(true);
    try {
      let designerId = 1;
      const designers = await fetchTestDesigners().catch(() => []);
      if (designers.length > 0) {
        designerId = designers[0].id;
      }

      await createTest({
        assessment_situation: testData.assessmentSituation,
        test_designer_id: designerId,
        subcompetency_ids: testData.subcompetencyIds,
        evaluated_user_ids: testData.userIds,
        evaluator_ids: testData.evaluatorIds,
      });

      await loadTests();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Errore durante la creazione del test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (column: keyof ApiTest) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: keyof ApiTest) => {
    if (sortColumn !== column) return <span className="w-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const filteredTests = useMemo(() => {
    return tests.filter(t => 
      t.assessment_situation?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(t.id).includes(searchQuery)
    );
  }, [tests, searchQuery]);

  const sortedTests = useMemo(() => {
    return [...filteredTests].sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];
      
      if (sortColumn === 'subcompetencies') {
        valA = a.subcompetencies?.length || 0;
        valB = b.subcompetencies?.length || 0;
      } else if (sortColumn === 'evaluated_users_count') {
        valA = a.evaluated_users_count || 0;
        valB = b.evaluated_users_count || 0;
      } else if (sortColumn === 'evaluators_count') {
        valA = a.evaluators_count || 0;
        valB = b.evaluators_count || 0;
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

  return (
    <PageContainer 
      title="Gestione Test" 
      description="Visualizza e gestisci tutti i test configurati nel sistema."
    >
      <div className="h-full flex flex-col gap-6">
        
        {/* Intestazione Tabella & Controlli */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Test disponibili</h2>
          
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 w-full max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cerca test per descrizione o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-full bg-transparent"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={loadTests} disabled={isLoading} className="h-9 w-9 shrink-0" title="Aggiorna tabella">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 h-9 ml-auto">
              <Plus className="h-4 w-4" />
              Nuovo
            </Button>
          </div>
        </div>

        {/* Contenuto Tabella o Stato Vuoto */}
        {isLoading && tests.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tests.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12 border border-dashed rounded-lg">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderCode />
                </EmptyMedia>
                <EmptyTitle>Nessun Test Creato</EmptyTitle>
                <EmptyDescription>
                  Non hai ancora creato nessun test. Inizia creando il tuo primo test per valutare le competenze.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <Button onClick={() => setIsModalOpen(true)}>Crea Nuovo Test</Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('assessment_situation')}>
                      <div className="flex items-center gap-1">Descrizione test {getSortIcon('assessment_situation')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('test_designer_id')}>
                      <div className="flex items-center gap-1">Test Designer {getSortIcon('test_designer_id')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort('evaluated_users_count')}>
                      <div className="flex items-center justify-center gap-1">Studenti {getSortIcon('evaluated_users_count')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort('evaluators_count')}>
                      <div className="flex items-center justify-center gap-1">Valutatori {getSortIcon('evaluators_count')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('subcompetencies')}>
                      <div className="flex items-center gap-1">Sottocompetenze {getSortIcon('subcompetencies')}</div>
                    </TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nessun test trovato corrispondente alla ricerca.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTests.map((test) => (
                      <TableRow key={test.id} className="group">
                        <TableCell className="max-w-[420px]">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span
                                className="block truncate font-medium text-slate-900 cursor-pointer hover:text-primary hover:underline"
                                onClick={() => setViewingTestId(test.id)}
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
                        <TableCell className="text-slate-600">
                          {test.test_designer?.user?.name || `ID: ${test.test_designer_id}`}
                        </TableCell>
                        <TableCell className="text-slate-600 text-center">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                            {test.evaluated_users_count || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 text-center">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                            {test.evaluators_count || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                            {test.subcompetencies?.length || 0} prove
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-sky-600 cursor-pointer" title="Modifica">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-red-600 cursor-pointer" 
                              title="Elimina"
                              onClick={() => setDeleteTargetTest(test)}
                              disabled={isDeletingId === test.id}
                            >
                              {isDeletingId === test.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Paginazione Footer */}
            {sortedTests.length > 0 && (
              <div className="flex items-center justify-between py-4 text-sm text-slate-500">
                <div>
                  Mostrando da {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, sortedTests.length)} di {sortedTests.length} test
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
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
                    className="h-8 w-8 bg-transparent"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        competencies={competencies}
        subCompetencies={subCompetencies}
        users={users}
        evaluators={evaluators}
        isSubmitting={isSubmitting}
        onConfirm={handleCreateTest}
      />

      <ViewTestModal
        isOpen={viewingTestId !== null}
        testId={viewingTestId}
        onClose={() => setViewingTestId(null)}
      />

      {/* MODALE CONFERMA ELIMINAZIONE */}
      <AlertDialog
        open={deleteTargetTest !== null}
        onOpenChange={(open) => !open && setDeleteTargetTest(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              Conferma Eliminazione
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Sei sicuro di voler eliminare il test <span className="font-semibold text-slate-900">"{deleteTargetTest?.assessment_situation}"</span> (ID: #{deleteTargetTest?.id})?
              <br className="my-1" />
              Questa operazione è irreversibile e cancellerà definitivamente tutti i dati e le assegnazioni associate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingId !== null}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeletingId !== null}
              onClick={async (e) => {
                e.preventDefault();
                if (deleteTargetTest) {
                  await handleDeleteTest(deleteTargetTest.id);
                  setDeleteTargetTest(null);
                }
              }}
              className="flex items-center gap-2"
            >
              {isDeletingId !== null && <Loader2 className="h-4 w-4 animate-spin" />}
              Elimina Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
