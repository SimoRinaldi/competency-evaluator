import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../auth/auth.api';
import {
  getAcquiredCompetencies,
  getAcquiredSubcompetencies,
  getUnacquiredCompetencies,
  getUnacquiredSubcompetencies,
} from './evaluated-user.api';
import { PageContainer } from '../../components/page-container';
import { CompetencyScoreCard } from './competency-score-card';
import { SubcompetenciesModal } from './subcompetencies-modal';

export function HistoricalScoresPage() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [acquiredCompetencyScores, setAcquiredCompetencyScores] = useState<any[]>([]);
  const [unacquiredCompetencyScores, setUnacquiredCompetencyScores] = useState<any[]>([]);
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
                barColor="#f59e0b"
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
