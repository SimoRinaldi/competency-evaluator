import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../auth/auth.api';
import {
  getBestScores,
  UserCompetencyEvaluation,
  UserSubCompetencyEvaluation,
} from './test-executions.api';
import { PageContainer } from '../../components/page-container';
import { CompetencyScoreCard } from './competency-score-card';
import { SubcompetenciesModal } from './subcompetencies-modal';

export function BestScoresPage() {
  const [acquiredCompetencyScores, setAcquiredCompetencyScores] = useState<
    UserCompetencyEvaluation[]
  >([]);
  const [unacquiredCompetencyScores, setUnacquiredCompetencyScores] = useState<
    UserCompetencyEvaluation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCompetency, setSelectedCompetency] =
    useState<UserCompetencyEvaluation | null>(null);
  const [modalSubComps, setModalSubComps] = useState<
    UserSubCompetencyEvaluation[]
  >([]);

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

      const data = await getBestScores(userId);

      setAcquiredCompetencyScores(data.acquired_competencies ?? []);
      setUnacquiredCompetencyScores(data.unacquired_competencies ?? []);
    } catch (err: any) {
      setError(err?.message || 'Errore nel caricamento dello storico');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenSubcompetencies(competency: UserCompetencyEvaluation) {
    setSelectedCompetency(competency);
    const subcomps = (competency.subcompetencies ?? []).map((sc) => ({
      ...sc,
      acquired:
        sc.acquired ??
        (sc.score_percentage !== null && parseFloat(sc.score_percentage) >= sc.threshold),
    }));
    setModalSubComps(subcomps);
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
                key={cs.competency_id}
                competency={cs}
                isAcquired={true}
                onViewSubcompetencies={handleOpenSubcompetencies}
                barColor="#0f172a"
              />
            ))}
          </div>
        </div>
      )}

      {unacquiredCompetencyScores.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Competenze non acquisite</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {unacquiredCompetencyScores.map((cs) => (
              <CompetencyScoreCard
                key={cs.competency_id}
                competency={cs}
                isAcquired={false}
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
        isLoading={false}
      />
    </PageContainer>
  );
}
