import { useEffect, useState } from "react";
import { fetchCurrentUser } from "../auth/auth.api";
import { getCompetencyHistoricalScores, getSubCompetencyHistoricalScores } from "./evaluated-user.api";
import { PageContainer } from "../../components/page-container";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export function HistoricalScoresPage() {
  const [competencyScores, setCompetencyScores] = useState<any[]>([]);
  const [subcompetencyScores, setSubcompetencyScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompetency, setSelectedCompetency] = useState<any | null>(null);

  useEffect(() => {
    loadScores();
  }, []);

  async function loadScores() {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      if (!user) {
        setError("Utente non trovato");
        return;
      }
      
      const compScores = await getCompetencyHistoricalScores(user.id);
      const subScores = await getSubCompetencyHistoricalScores(user.id);
      
      setCompetencyScores(compScores);
      setSubcompetencyScores(subScores);
    } catch (err: any) {
      setError(err?.message || "Errore nel caricamento dello storico");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Storico punteggi" description="Caricamento in corso...">
        <div className="h-64 flex items-center justify-center text-slate-500">
          Caricamento...
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Storico punteggi" description="Errore">
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      </PageContainer>
    );
  }

  if (competencyScores.length === 0) {
    return (
      <PageContainer title="Storico punteggi" description="Nessun punteggio storico disponibile.">
        <div className="mt-12 text-center text-slate-500">
          Non hai ancora ricevuto la valutazione per nessun test.
        </div>
      </PageContainer>
    );
  }

  const modalSubCompsData = selectedCompetency 
    ? (selectedCompetency.competency.subcompetencies || []).map((subC: any) => {
        const subScore = subcompetencyScores.find(ss => ss.subcompetency_id === subC.id);
        const subScorePercent = subScore ? parseFloat(subScore.score_percentage) || 0 : 0;
        return {
          id: subC.id,
          title: subC.title,
          threshold: subC.threshold,
          score_absolute: subScore ? subScore.score_absolute : 0,
          score_percentage: subScorePercent,
          acquired: subScore ? subScore.score_absolute >= subC.threshold : false
        };
      })
    : [];

  return (
    <PageContainer 
      title="Storico punteggi" 
      description="Visualizza i punteggi che hai ottenuto nelle singole competenze."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {competencyScores.map(cs => {
          const competency = cs.competency;
          const scorePercent = parseFloat(cs.score_percentage) || 0;
          const chartData = [{ score: scorePercent, fill: "#0f172a" }];

          return (
            <div key={cs.id} className="border border-slate-200 rounded-md p-5 flex flex-col bg-white">
              
              <h3 className="text-base font-semibold text-slate-900">
                {competency.title}
              </h3>
              
              <Separator className="my-4 bg-slate-100" />
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col gap-2 text-sm text-slate-600">
                  <div>
                    Soglia: <span className="font-semibold text-slate-900">{competency.threshold}</span>
                  </div>
                  <div>
                    Ottenuto: <span className="font-semibold text-slate-900">{cs.score_absolute}</span>
                  </div>
                </div>

                <div className="w-16 h-16 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="75%" 
                      outerRadius="100%" 
                      data={chartData} 
                      startAngle={90} 
                      endAngle={-270} 
                      barSize={4}
                    >
                      <RadialBar 
                        dataKey="score" 
                        background={{ fill: '#f1f5f9' }} 
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-900">
                      {scorePercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto text-right">
                <button 
                  onClick={() => setSelectedCompetency(cs)} 
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Visualizza sotto-competenze
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedCompetency} onOpenChange={(open) => !open && setSelectedCompetency(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[800px] p-6 bg-white rounded-md shadow-lg border-slate-200 gap-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Sotto-competenze
            </DialogTitle>
            <p className="text-sm text-slate-500">
              {selectedCompetency?.competency.title}
            </p>
          </DialogHeader>

          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium text-slate-500 py-3">Sotto-competenza</TableHead>
                  <TableHead className="text-center font-medium text-slate-500 py-3">Stato</TableHead>
                  <TableHead className="text-center font-medium text-slate-500 py-3">Punteggio</TableHead>
                  <TableHead className="text-center font-medium text-slate-500 py-3">Globale %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modalSubCompsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500 text-sm">
                      Nessun dato disponibile.
                    </TableCell>
                  </TableRow>
                ) : (
                  modalSubCompsData.map((sc: any) => (
                    <TableRow key={sc.id} className="hover:bg-slate-50">
                      <TableCell className="text-sm font-medium text-slate-900">
                        {sc.title}
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-700">
                        {sc.acquired ? "Acquisita" : "Non acquisita"}
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-700">
                        {sc.score_absolute} / {sc.threshold}
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-900 font-semibold">
                        {sc.score_percentage.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="sm:justify-end">
            <button 
              type="button" 
              onClick={() => setSelectedCompetency(null)} 
              className="text-sm text-slate-600 hover:text-slate-900 font-medium py-2 px-4 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Chiudi
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
