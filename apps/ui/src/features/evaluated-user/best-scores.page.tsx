import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../auth/auth.api';
import {
  getAcquiredCompetencies,
  getAcquiredSubcompetencies,
  getUnacquiredCompetencies,
  getUnacquiredSubcompetencies,
} from './evaluated-user.api';
import { getBestCompetencyScores, getBestSubCompetencyScores } from './evaluated-user.api';
import { PageContainer } from '../../components/page-container';
import { CompetencyScoreCard } from './competency-score-card';
import { SubcompetenciesModal } from './subcompetencies-modal';

export function HistoricalScoresPage() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [acquiredCompetencyScores, setAcquiredCompetencyScores] = useState<any[]>([]);
  const [unacquiredCompetencyScores, setUnacquiredCompetencyScores] = useState<any[]>([]);
export function BestScoresPage() {
  const [competencyScores, setCompetencyScores] = useState<any[]>([]);
  const [subcompetencyScores, setSubcompetencyScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<any | null>(null);
  const [modalSubComps, setModalSubComps] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadScores();
  }, []);

  async function loadScores() {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      if (!user) {
        setError('Utente non trovato');
        return;
      }
      const userId = Number(user.id);
      setCurrentUserId(userId);

      const [acqCompScores, unacqCompScores] = await Promise.all([
        getAcquiredCompetencies(userId),
        getUnacquiredCompetencies(userId),
      ]);
      const compScores = await getBestCompetencyScores(user.id);
      const subScores = await getBestSubCompetencyScores(user.id);

      setAcquiredCompetencyScores(acqCompScores);
      setUnacquiredCompetencyScores(unacqCompScores);
    } catch (err: any) {
      setError(err?.message || 'Errore nel caricamento dello storico');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenSubcompetencies(competency: any) {
    setSelectedCompetency(competency);
    setModalLoading(true);
    setModalError('');
    setModalSubComps([]);

    const userId = currentUserId;
    if (!userId) {
      setModalError('Utente non identificato');
      setModalLoading(false);
      return;
    }

    const competencyId = competency.competency_id ?? competency.id;

    try {
      const [acquired, unacquired] = await Promise.all([
        getAcquiredSubcompetencies(userId, competencyId),
        getUnacquiredSubcompetencies(userId, competencyId),
      ]);

      const combined = [
        ...acquired.map((s: any) => ({ ...s, acquired: true })),
        ...unacquired.map((s: any) => ({ ...s, acquired: false })),
      ].sort((a: any, b: any) => (a.subcompetency_id ?? a.id) - (b.subcompetency_id ?? b.id));

      setModalSubComps(combined);
    } catch (err: any) {
      setModalError(err?.message || 'Errore nel caricamento delle sotto-competenze');
    } finally {
      setModalLoading(false);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Storico punteggi" description="Caricamento in corso...">
        <div className="h-64 flex items-center justify-center text-slate-500">Caricamento...</div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Storico punteggi" description="Errore">
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>
      </PageContainer>
    );
  }

  if (acquiredCompetencyScores.length === 0 && unacquiredCompetencyScores.length === 0) {
    return (
      <PageContainer title="Storico punteggi" description="Nessun punteggio storico disponibile.">
        <div className="mt-12 text-center text-slate-500">
          Non hai ancora ricevuto la valutazione per nessun test.
        </div>
      </PageContainer>
    );
  }

  /* NON SO SE SERVIRA' ANCORA
  const modalSubCompsData = selectedCompetency
    ? (selectedCompetency.competency.subcompetencies || []).map((subC: any) => {
        const subScore = subcompetencyScores.find((ss) => ss.subcompetency_id === subC.id);
        const subScorePercent = subScore ? parseFloat(subScore.best_score_percentage) || 0 : 0;
        return {
          id: subC.id,
          title: subC.title,
          threshold: subC.threshold,
          best_score_absolute: subScore ? subScore.best_score_absolute : 0,
          best_score_percentage: subScorePercent,
          acquired: subScore ? subScore.best_score_absolute >= subC.threshold : false,
        };
      })
    : []; */

  return (
    <PageContainer
      title="Storico punteggi"
      description="Visualizza i punteggi che hai ottenuto nelle singole competenze."
    >
      {acquiredCompetencyScores.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Competenze acquisite</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {acquiredCompetencyScores.map((cs) => (
              <CompetencyScoreCard
                key={cs.competency_id ?? cs.id}
                competency={cs}
                onViewSubcompetencies={handleOpenSubcompetencies}
                barColor="#0f172a"
              />
            ))}
      {/* NON SO SE SERVIRA'
      </div><div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {competencyScores.map((cs) => {
          const competency = cs.competency;
          const scorePercent = parseFloat(cs.best_score_percentage) || 0;
          const chartData = [{ score: scorePercent, fill: '#0f172a' }];

          return (
            <div
              key={cs.id}
              className="border border-slate-200 rounded-md p-5 flex flex-col bg-white"
            >
              <h3 className="text-base font-semibold text-slate-900">{competency.title}</h3>

              <Separator className="my-4 bg-slate-100" />

              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col gap-2 text-sm text-slate-600">
                  <div>
                    Soglia:{' '}
                    <span className="font-semibold text-slate-900">{competency.threshold}</span>
                  </div>
                  <div>
                    Ottenuto:{' '}
                    <span className="font-semibold text-slate-900">{cs.best_score_absolute}</span>
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

      <Dialog
        open={!!selectedCompetency}
        onOpenChange={(open) => !open && setSelectedCompetency(null)}
      >
        <DialogContent className="max-w-[95vw] md:max-w-[800px] p-6 bg-white rounded-md shadow-lg border-slate-200 gap-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Sotto-competenze
            </DialogTitle>
            <p className="text-sm text-slate-500">{selectedCompetency?.competency.title}</p>
          </DialogHeader>

          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium text-slate-500 py-3">
                    Sotto-competenza
                  </TableHead>
                  <TableHead className="text-center font-medium text-slate-500 py-3">
                    Stato
                  </TableHead>
                  <TableHead className="text-center font-medium text-slate-500 py-3">
                    Punteggio
                  </TableHead>
                  <TableHead className="text-center font-medium text-slate-500 py-3">
                    Punteggio %
                  </TableHead>
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
                        {sc.acquired ? 'Acquisita' : 'Non acquisita'}
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-700">
                        {sc.best_score_absolute} / {sc.threshold}
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-900 font-semibold">
                        {sc.best_score_percentage.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table> */}
          </div>
        </div>
      )}

      {unacquiredCompetencyScores.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Competenze non acquisite</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {unacquiredCompetencyScores.map((cs) => (
              <CompetencyScoreCard
                key={cs.competency_id ?? cs.id}
                competency={cs}
                onViewSubcompetencies={handleOpenSubcompetencies}
                dimmed
              />
            ))}
          </div>
        </div>
      )}

      <SubcompetenciesModal
        isOpen={!!selectedCompetency}
        onClose={() => setSelectedCompetency(null)}
        competency={selectedCompetency}
        subcompetencies={modalSubComps}
        isLoading={modalLoading}
        error={modalError}
      />
    </PageContainer>
  );
}
