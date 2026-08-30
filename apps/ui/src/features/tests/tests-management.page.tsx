import React, { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '@/components/page-container';
import { fetchTests, ApiTest, ApiCompetency, ApiSubCompetency, ApiUser, fetchCompetencies, fetchSubCompetencies, fetchUsers, fetchTestDesigners, createTest, fetchEvaluatedUsers, fetchTestEvaluators } from './tests.api';
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
import { Plus, Loader2, FolderCode, Edit, Trash2, RefreshCw, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CreateTestModal } from './create-test-modal';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const data = await fetchTests();
      setTests(data);
    } catch (err) {
      console.error('Failed to fetch tests', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadModalData() {
    try {
      const [compRes, subRes, evaluatedUsersRes, testEvaluatorsRes] = await Promise.all([
        fetchCompetencies(),
        fetchSubCompetencies(),
        fetchEvaluatedUsers(),
        fetchTestEvaluators(),
      ]);

      setCompetencies(compRes);
      setSubCompetencies(subRes);

      const students = evaluatedUsersRes
        .filter((eu: any) => eu.user)
        .map((eu: any) => ({
          ...eu.user,
          id: eu.id, // the ID passed to the backend must be the EvaluatedUser ID
        }));

      const evaluators = testEvaluatorsRes
        .filter((te: any) => te.user)
        .map((te: any) => ({
          ...te.user,
          id: te.id, // the ID passed to the backend must be the TestEvaluator ID
        }));

      setUsers(students);
      setEvaluators(evaluators);
    } catch (err) {
      console.error('Failed to fetch modal data', err);
      // Fallback empty if needed so UI doesn't crash completely, but now we know it failed
      setCompetencies([]);
      setSubCompetencies([]);
      setUsers([]);
      setEvaluators([]);
    }
  }

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
                  placeholder="Cerca test per situazione o ID..."
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
                    <TableHead className="w-[96px] cursor-pointer select-none" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">ID {getSortIcon('id')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('assessment_situation')}>
                      <div className="flex items-center gap-1">Situazione di Valutazione {getSortIcon('assessment_situation')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('test_designer_id')}>
                      <div className="flex items-center gap-1">Test Designer {getSortIcon('test_designer_id')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort('executions_count')}>
                      <div className="flex items-center justify-center gap-1">Esecuzioni {getSortIcon('executions_count')}</div>
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
                        <TableCell className="font-medium text-slate-500">{test.id}</TableCell>
                        <TableCell 
                          className="font-medium text-slate-900 cursor-pointer"
                          onClick={() => console.log('Apri dettaglio test', test.id)}
                        >
                          {test.assessment_situation}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {test.test_designer?.user?.name || `ID: ${test.test_designer_id}`}
                        </TableCell>
                        <TableCell className="text-slate-600 text-center">
                          {test.executions_count || 0}
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 cursor-pointer" title="Elimina">
                              <Trash2 className="h-4 w-4" />
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
    </PageContainer>
  );
}
