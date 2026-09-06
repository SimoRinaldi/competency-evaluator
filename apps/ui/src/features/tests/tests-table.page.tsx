import { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '@/components/page-container';
import {
  fetchTests,
  deleteTest,
  ApiTest,
  ApiCompetency,
  ApiSubCompetency,
  ApiUser,
  fetchCompetencies,
  fetchSubCompetencies,
  fetchTestDesigners,
  createTest,
  updateTest,
  fetchTestDetails,
  fetchEvaluatedUsers,
  fetchTestEvaluators,
  fetchTestExecutionsByTestId,
} from './tests.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Plus,
  Loader2,
  FolderCode,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  TriangleAlert,
} from 'lucide-react';
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
import { ViewTestModal } from './tests-view-modal';
import { toast } from 'sonner';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface TestsManagementPageProps {
  readOnly?: boolean;
}

export function TestsManagementPage({ readOnly = false }: TestsManagementPageProps) {
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
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingTestData, setEditingTestData] = useState<any>(null);

  useEffect(() => {
    loadTests();
    if (!readOnly) {
      loadModalData();
    }
  }, [readOnly]);

  async function loadTests() {
    setIsLoading(true);
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

      setTests(
        testsRes.map((test) => ({
          ...test,
          evaluated_users_count: evaluatedUsersCountByTest.get(test.id) || 0,
          evaluators_count: evaluatorsCountByTest.get(test.id) || 0,
        })),
      );

      if (!readOnly) {
        setUsers(
          evaluatedUsersRes.filter((eu) => eu.user).map((eu) => ({ ...eu.user!, id: eu.id })),
        );
        setEvaluators(
          testEvaluatorsRes.filter((te) => te.user).map((te) => ({ ...te.user!, id: te.id })),
        );
      }
    } catch (err) {
      console.error('Failed to fetch tests', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadModalData() {
    try {
      const [compRes, subCompRes, evalRes, usersRes] = await Promise.all([
        fetchCompetencies(),
        fetchSubCompetencies(),
        fetchTestEvaluators(),
        fetchEvaluatedUsers(),
      ]);
      setCompetencies(compRes);
      setSubCompetencies(subCompRes);

      // Mappa i test_evaluator con id = test_evaluator.id e dati utente per il display
      setEvaluators(evalRes.filter((te) => te.user).map((te) => ({ ...te.user!, id: te.id })));

      // Mappa gli evaluated_user con id = evaluated_user.id e dati utente per il display
      setUsers(usersRes.filter((eu) => eu.user).map((eu) => ({ ...eu.user!, id: eu.id })));
    } catch (error) {
      console.error('Errore nel caricamento dei dati per la modale:', error);
    }
  }

  const handleDeleteTest = async () => {
    if (!deleteTargetTest) return;
    setIsDeletingId(deleteTargetTest.id);
    try {
      await deleteTest(deleteTargetTest.id);
      await loadTests();
      toast.success('Test eliminato con successo');
    } catch (error) {
      console.error("Errore durante l'eliminazione del test:", error);
      toast.error("Errore durante l'eliminazione  del test");
    } finally {
      setIsDeletingId(null);
      setDeleteTargetTest(null);
    }
  };

  const handleDeleteClick = async (test: ApiTest) => {
    try {
      // controllo se il test è già iniziato
      const executions = await fetchTestExecutionsByTestId(test.id);
      const isStarted = executions.some((ex) => ex.test_outputs && ex.test_outputs.length > 0);

      if (isStarted) {
        toast.error('Impossibile eliminare: il test è in corso');
        return;
      }

      // se il test non è iniziato, procede all'eliminazione
      setDeleteTargetTest(test);
    } catch (err) {
      toast.error("Errore durante la verifica per l'eliminazione del test");
    }
  };

  const handleEditClick = async (test_id: number) => {
    try {
      // controllo se il test è già iniziato
      const executions = await fetchTestExecutionsByTestId(test_id);
      const isStarted = executions.some((ex) => ex.test_outputs && ex.test_outputs.length > 0);

      if (isStarted) {
        toast.error('Impossibile modificare: il test è in corso');
        return;
      }

      // se il test non è iniziato, carica i dettagli e apre la modale
      const details = await fetchTestDetails(test_id);

      let competencyId = null;
      if (details.subcompetencies.length > 0) {
        const firstSub = details.subcompetencies[0] as any;
        competencyId = firstSub.competency_id || firstSub.competency?.id;
      }

      setEditingTestData({
        id: test_id,
        assessmentSituation: details.test.assessment_situation,
        competencyId,
        subcompetencyIds: details.subcompetencies.map((s) => s.id),
        userIds: details.students.map((s) => s.id),
        evaluatorIds: details.evaluators.map((e) => e.id),
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Errore nel caricamento del test');
    }
  };

  const handleSaveTest = async (testData: any) => {
    if (readOnly) return;
    setIsSubmitting(true);
    try {
      let designerId = 1;
      const designers = await fetchTestDesigners().catch(() => []);
      if (designers.length > 0) {
        designerId = designers[0].id;
      }

      const payload = {
        assessment_situation: testData.assessmentSituation,
        test_designer_id: designerId,
        subcompetency_ids: testData.subcompetencyIds,
        evaluated_user_ids: testData.userIds,
        test_evaluator_ids: testData.evaluatorIds,
      };

      if (editingTestData) {
        await updateTest(editingTestData.id, payload);
        toast.success('Test aggiornato con successo');
      } else {
        await createTest(payload);
        toast.success('Test creato con successo');
      }

      await loadTests();
      setIsModalOpen(false);
      setEditingTestData(null);
    } catch (error) {
      console.error('Errore durante il salvataggio del test:', error);
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<ApiTest>[]>(() => {
    const baseCols: ColumnDef<ApiTest>[] = [
      {
        accessorKey: 'id',
        header: 'Numero',
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-600">#{row.original.id}</span>
        ),
      },
      {
        accessorKey: 'assessment_situation',
        header: 'Descrizione test',
        cell: ({ row }) => (
          <HoverCard>
            <HoverCardTrigger asChild>
              <span
                className="block truncate max-w-150 font-normal text-slate-700 cursor-pointer hover:text-primary hover:underline"
                onClick={() => setViewingTestId(row.original.id)}
              >
                {row.original.assessment_situation}
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-96 bg-white text-sm text-slate-700 shadow-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-1">Descrizione test</p>
              <p className="leading-relaxed whitespace-pre-wrap font-normal">
                {row.original.assessment_situation}
              </p>
            </HoverCardContent>
          </HoverCard>
        ),
      },
      {
        accessorKey: 'evaluated_users_count',
        header: () => <div className="text-center">Utenti</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200">
              {row.original.evaluated_users_count || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'evaluators_count',
        header: () => <div className="text-center">Valutatori</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200">
              {row.original.evaluators_count || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'subcompetencies_count',
        header: () => <div className="text-center">Sottocompetenze</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-normal border border-slate-200">
              {row.original.subcompetencies?.length || 0}
            </span>
          </div>
        ),
      },
    ];

    if (!readOnly) {
      baseCols.push({
        id: 'actions',
        header: () => <div className="text-right">Azioni</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer"
                    onClick={() => handleEditClick(row.original.id)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Modifica test</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Modifica test</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-red-600 cursor-pointer"
                    onClick={() => handleDeleteClick(row.original)}
                    disabled={isDeletingId === row.original.id}
                  >
                    {isDeletingId === row.original.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Elimina test</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Elimina test</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      });
    }

    return baseCols;
  }, [readOnly, isDeletingId]);

  const table = useReactTable({
    data: tests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <PageContainer
      title={readOnly ? 'Consultazione Test' : 'Gestione test'}
      description={
        readOnly
          ? 'Visualizza tutti i test configurati nel sistema.'
          : 'Visualizza e gestisci tutti i tuoi test.'
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca test per descrizione..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="!pl-10 bg-white"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadTests}
            disabled={isLoading}
            className="h-9 w-9 shrink-0 bg-white"
            title="Aggiorna tabella"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {!readOnly && (
            <Button
              onClick={() => {
                setEditingTestData(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 h-9"
            >
              <Plus className="h-4 w-4" />
              Nuovo
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 font-semibold text-slate-900 whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-slate-50/50 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-1.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <Empty className="pt-4">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <FolderCode />
                        </EmptyMedia>
                        <EmptyTitle>Nessun Test</EmptyTitle>
                        <EmptyDescription>
                          {readOnly
                            ? 'Nessun test presente nel sistema.'
                            : 'Non hai ancora creato nessun test. Inizia creando il tuo primo test per valutare le competenze.'}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 px-1">
        <div className="text-sm font-medium text-slate-500">
          {table.getFilteredRowModel().rows.length} elementi
        </div>
      </div>

      {/* MODALS */}
      {!readOnly && (
        <>
          <CreateTestModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTestData(null);
            }}
            competencies={competencies}
            subCompetencies={subCompetencies}
            users={users}
            evaluators={evaluators}
            isSubmitting={isSubmitting}
            initialData={editingTestData}
            onConfirm={handleSaveTest}
          />
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
                <AlertDialogDescription className="text-slate-600 space-y-2 mt-2">
                  <p>Sei sicuro di voler eliminare questo test?</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingId !== null}>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isDeletingId !== null}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (deleteTargetTest) {
                      await handleDeleteTest();
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
        </>
      )}

      <ViewTestModal
        isOpen={viewingTestId !== null}
        testId={viewingTestId}
        onClose={() => setViewingTestId(null)}
      />
    </PageContainer>
  );
}
