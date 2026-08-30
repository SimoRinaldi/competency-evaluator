import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { PlayCircle, CheckCircle2, Award, ClipboardList, Clock, CheckCircle } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function UserTestsPage({ filter }: { filter: 'todo' | 'completed' }) {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const user = await fetchCurrentUser();
        const allTests = await getAvailableTests();
        const myExecs = await getUserExecutions(user.id);
        
        const mappedTests = allTests.map((t: any) => {
          const execution = myExecs.find((ex: any) => ex.test_id === t.id);
          const isCompleted = !!execution;
          
          let status: 'todo' | 'completed' = 'todo';
          if (isCompleted) status = 'completed';
          
          return { ...t, execution, status };
        });
        
        setTests(mappedTests.filter((t: any) => t.status === filter));
      } catch (err: any) {
        setError(err.message || "Errore nel caricamento dei dati");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filter]);

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

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-20 font-semibold text-slate-700">ID</TableHead>
              <TableHead className="w-[40%] font-semibold text-slate-700">Situazione di Valutazione</TableHead>
              <TableHead className="font-semibold text-slate-700">
                {filter === 'completed' ? 'Punteggio / Stato' : 'Stato'}
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  Caricamento in corso...
                </TableCell>
              </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center p-0">
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="text-slate-400">
                        {emptyIcons[filter]}
                      </EmptyMedia>
                      <EmptyTitle>Nessun test trovato</EmptyTitle>
                      <EmptyDescription>
                        {filter === 'todo' && "Ottimo lavoro! Non hai nessun test in sospeso al momento."}
                        {filter === 'completed' && "Non hai ancora completato alcun test."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <TableRow key={test.id} className="group">
                  <TableCell className="font-medium">#{test.id}</TableCell>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="inline-block max-w-[400px] truncate cursor-help border-b border-dashed border-slate-300">
                          {test.assessment_situation}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 text-sm">
                        <div className="font-semibold mb-1">Situazione di Valutazione</div>
                        <div className="text-slate-600">{test.assessment_situation}</div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell>
                    {filter === 'todo' && (
                      <span className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                        Da Fare
                      </span>
                    )}
                    {filter === 'completed' && (
                      <div className="flex items-center">
                        {test.execution.test_score !== null ? (
                          <>
                            <span className="text-sm font-bold text-green-600 mr-2">
                              {test.execution.test_score}
                            </span>
                            <span className="text-xs text-slate-500">/ {test.execution.max_score}</span>
                          </>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                            In Revisione
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {filter === 'todo' && (
                      <Button size="sm" onClick={() => navigate(`/evaluated-user/tests/${test.id}`)}>
                        <PlayCircle className="mr-2 h-4 w-4" /> Svolgi
                      </Button>
                    )}
                    {filter === 'completed' && (
                      test.execution.test_score !== null ? (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 bg-green-50 pointer-events-none">
                          <CheckCircle className="mr-2 h-4 w-4" /> Valutato
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled>
                          <Clock className="mr-2 h-4 w-4" /> Inviato
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}
