import { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CompetencyScoreCardProps {
  competency: {
    competency_id?: number;
    id?: number;
    title: string;
    threshold: number;
    score_absolute: number | null;
    score_percentage: string | null;
    subcompetencies?: any[];
  };
  onViewSubcompetencies: (competency: any) => void;
  barColor?: string;
  dimmed?: boolean;
  isAcquired?: boolean;
  className?: string;
}

export function CompetencyScoreCard({
  competency,
  onViewSubcompetencies,
  barColor,
  dimmed = false,
  isAcquired: isAcquiredProp,
  className,
}: CompetencyScoreCardProps) {
  const isNotAttempted = competency.score_absolute === null;
  const scorePercent =
    competency.score_percentage !== null
      ? parseFloat(competency.score_percentage) || 0
      : 0;

  const isAcquired =
    isAcquiredProp !== undefined
      ? isAcquiredProp
      : !dimmed && !isNotAttempted && scorePercent >= competency.threshold;

  const delta = !isNotAttempted ? Math.round(scorePercent - competency.threshold) : null;
  const hasMissingSubcompetencies =
    !isAcquired && !isNotAttempted && delta !== null && delta >= 0;

  const maxScore =
    !isNotAttempted && scorePercent > 0
      ? Math.round(((competency.score_absolute as number) / scorePercent) * 100)
      : null;

  const effectiveBarColor =
    barColor ?? (isAcquired ? '#0f172a' : hasMissingSubcompetencies ? '#d97706' : '#64748b');

  // Stato per l'animazione al mount
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Piccolo delay per far scattare l'animazione CSS
    const timer = setTimeout(() => {
      setAnimatedScore(scorePercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [scorePercent]);

  // Metriche per l'SVG circolare
  const circleSize = 56; // 14 * 4 = 56px (w-14 h-14) per ingrandirlo leggermente
  const circleStroke = 5;
  const circleCenter = circleSize / 2;
  const circleRadius = circleCenter - circleStroke;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleStrokeDashoffset = circleCircumference - (animatedScore / 100) * circleCircumference;

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
                : hasMissingSubcompetencies
                ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                : 'bg-white/90 text-slate-700 border-slate-200'
            )}
          >
            {isNotAttempted
              ? 'Non svolta'
              : isAcquired
              ? 'Acquisita'
              : hasMissingSubcompetencies
              ? 'Non acquisita'
              : 'Non superata'}
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
              <span className="font-semibold text-slate-800 tabular-nums">
                {competency.threshold}%
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Metriche analitiche */}
            <div
              className={cn(
                'flex flex-col gap-3 pt-3 border-t mt-3',
                dimmed ? 'border-slate-200' : 'border-slate-100'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-500">Punteggio</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-semibold tabular-nums text-slate-900">
                      {competency.score_absolute}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      / {maxScore !== null ? `${maxScore} pt` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 pt-1">
                  {/* Grafico circolare SVG */}
                  <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                    <svg
                      height={circleSize}
                      width={circleSize}
                      className="rotate-[-90deg] transform origin-center"
                    >
                      <circle
                        stroke={dimmed ? '#e2e8f0' : '#f1f5f9'}
                        fill="transparent"
                        strokeWidth={circleStroke}
                        r={circleRadius}
                        cx={circleCenter}
                        cy={circleCenter}
                      />
                      <circle
                        stroke={effectiveBarColor}
                        fill="transparent"
                        strokeWidth={circleStroke}
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={circleStrokeDashoffset}
                        strokeLinecap="round"
                        r={circleRadius}
                        cx={circleCenter}
                        cy={circleCenter}
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold tabular-nums text-slate-900">
                        {scorePercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Soglia */}
                  <div className="text-[11px] font-medium text-slate-500">
                    Soglia: <span className="text-slate-800">{competency.threshold}%</span>
                  </div>
                </div>
              </div>
            </div>

            {hasMissingSubcompetencies && (
              <div className="my-2.5 p-2.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Per acquisire la competenza è necessario acquisire tutte le sue sotto-competenze.
                </span>
              </div>
            )}
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
