import { Separator } from '@/components/ui/separator';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

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
}

export function CompetencyScoreCard({
  competency,
  onViewSubcompetencies,
  barColor = '#0f172a',
}: CompetencyScoreCardProps) {
  const scorePercent =
    competency.score_percentage !== null
      ? parseFloat(competency.score_percentage) || 0
      : 0;

  const chartData = [{ score: scorePercent, fill: barColor }];

  return (
    <div className="border border-slate-200 rounded-md p-5 flex flex-col bg-white">
      <h3 className="text-base font-semibold text-slate-900">{competency.title}</h3>

      <Separator className="my-4 bg-slate-100" />

      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          <div>
            Ottenuto:{' '}
            <span className="font-semibold text-slate-900">
              {competency.score_absolute !== null ? competency.score_absolute : 'Non svolta'}
            </span>
          </div>
          <div>
            Soglia:{' '}
            <span className="font-semibold text-slate-900">{competency.threshold}</span>
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
              {competency.score_percentage !== null ? `${scorePercent.toFixed(0)}%` : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto text-right">
        <button
          type="button"
          onClick={() => onViewSubcompetencies(competency)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors underline underline-offset-4 cursor-pointer"
        >
          Visualizza sotto-competenze
        </button>
      </div>
    </div>
  );
}
