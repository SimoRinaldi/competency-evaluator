import { ChevronRight } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export interface CompetencyScoreCardProps {
  competency: {
    competency_id?: number;
    id?: number;
    title: string;
    threshold: number;
    score_absolute: number | null;
    score_percentage: string | null;
  };
  onViewSubcompetencies: (competency: any) => void;
  barColor?: string;
  dimmed?: boolean;
  className?: string;
}

export function CompetencyScoreCard({
  competency,
  onViewSubcompetencies,
  barColor,
  dimmed = false,
  className,
}: CompetencyScoreCardProps) {
  const isNotAttempted = competency.score_absolute === null;
  const isAcquired = !isNotAttempted && (competency.score_absolute ?? 0) >= competency.threshold;
  const delta = !isNotAttempted ? (competency.score_absolute ?? 0) - competency.threshold : null;
  const scorePercent =
    competency.score_percentage !== null
      ? parseFloat(competency.score_percentage) || 0
      : 0;

  const maxScore =
    !isNotAttempted && scorePercent > 0
      ? Math.round(((competency.score_absolute as number) / scorePercent) * 100)
      : null;

  const effectiveBarColor = barColor ?? (isAcquired ? '#0f172a' : '#64748b');
  const chartData = [{ score: scorePercent, fill: effectiveBarColor }];

  return (
    <div
      className={cn(
        'group border rounded-lg p-5 flex flex-col justify-between transition-colors',
        dimmed
          ? 'bg-slate-100 border-slate-200'
          : 'bg-white border-slate-200 shadow-sm',
        className
      )}
    >
      <div>
        {/* Header: Titolo + Stato sobrio */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            className={cn(
              'text-sm font-semibold leading-snug',
              dimmed ? 'text-slate-700' : 'text-slate-900'
            )}
          >
            {competency.title}
          </h3>

          <span
            className={cn(
              'shrink-0 text-xs px-2 py-0.5 rounded font-medium border',
              isNotAttempted
                ? 'bg-white/90 text-slate-600 border-slate-200'
                : isAcquired
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-white/90 text-slate-700 border-slate-200'
            )}
          >
            {isNotAttempted ? 'Non svolta' : isAcquired ? 'Acquisita' : 'Non superata'}
          </span>
        </div>

        {/* Corpo: Differenziato tra non eseguita ed eseguita */}
        {isNotAttempted ? (
          <div className="py-4 space-y-2">
            <p className="text-xs text-slate-500">
              Nessuna prova completata per questa competenza.
            </p>
            <div className="text-xs text-slate-600">
              Soglia richiesta:{' '}
              <span className="font-semibold text-slate-800 font-mono">
                {competency.threshold} pt
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Metriche analitiche */}
            <div
              className={cn(
                'flex items-center justify-between py-3 border-y my-3',
                dimmed ? 'border-slate-200' : 'border-slate-100'
              )}
            >
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500">Punteggio</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold font-mono text-slate-900">
                    {competency.score_absolute}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {maxScore !== null ? `${maxScore} pt` : '—'}
                  </span>
                </div>
                <div className="text-xs pt-0.5">
                  {delta !== null &&
                    (delta >= 0 ? (
                      <span className="text-emerald-700 font-medium">
                        +{delta} pt rispetto alla soglia ({competency.threshold} pt)
                      </span>
                    ) : (
                      <span className="text-slate-600 font-medium">
                        {delta} pt dalla soglia ({competency.threshold} pt)
                      </span>
                    ))}
                </div>
              </div>

              {/* Grafico circolare */}
              <div className="w-14 h-14 relative shrink-0">
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
                      background={{ fill: dimmed ? '#e2e8f0' : '#f1f5f9' }}
                      cornerRadius={6}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold font-mono text-slate-900">
                    {scorePercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Avanzamento */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Soglia: {competency.threshold} pt</span>
                <span>Max: {maxScore !== null ? `${maxScore} pt` : '—'}</span>
              </div>
              <div
                className={cn(
                  'h-1.5 w-full rounded-full overflow-hidden',
                  dimmed ? 'bg-slate-200' : 'bg-slate-100'
                )}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isAcquired ? 'bg-slate-900' : 'bg-slate-500'
                  )}
                  style={{ width: `${Math.min(scorePercent, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer / Azione */}
      <div
        className={cn(
          'mt-4 pt-3 border-t flex items-center justify-end',
          dimmed ? 'border-slate-200' : 'border-slate-100'
        )}
      >
        <button
          type="button"
          onClick={() => onViewSubcompetencies(competency)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span>Visualizza sotto-competenze</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
