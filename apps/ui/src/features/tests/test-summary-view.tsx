import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface TestSummaryViewProps {
  assessmentSituation: string;
  subcompetencies: Array<{
    id: number;
    title: string;
    threshold: number;
    weight: number;
  }>;
  students: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  evaluators: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

export function TestSummaryView({
  assessmentSituation,
  subcompetencies,
  students,
  evaluators,
}: TestSummaryViewProps) {
  return (
    <div className="space-y-8 flex flex-col h-full overflow-y-auto pr-2 pb-4">
      {/* Informazioni Generali */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Descrizione test
          </span>
          <span className="text-base text-slate-800 leading-relaxed  whitespace-pre-wrap">
            {assessmentSituation || '-'}
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* Sottocompetenze */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-lg font-semibold text-slate-800">Sottocompetenze</h4>
          <p className="text-sm text-slate-500">
            {subcompetencies.length} {subcompetencies.length === 1 ? 'elemento' : 'elementi'}
          </p>
        </div>
        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Titolo</TableHead>
                <TableHead>Soglia %</TableHead>
                <TableHead>Peso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcompetencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-slate-400">
                    Nessuna sottocompetenza associata
                  </TableCell>
                </TableRow>
              ) : (
                subcompetencies.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.title}</TableCell>
                    <TableCell>{sub.threshold}%</TableCell>
                    <TableCell>{sub.weight}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* Utenti */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-lg font-semibold text-slate-800">Utenti</h4>
          <p className="text-sm text-slate-500">
            {students.length} {students.length === 1 ? 'elemento' : 'elementi'}
          </p>
        </div>
        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-16 text-center text-slate-400">
                    Nessuno utente assegnato
                  </TableCell>
                </TableRow>
              ) : (
                students.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-slate-500">{user.email}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* Valutatori */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-lg font-semibold text-slate-800">Valutatori</h4>
          <p className="text-sm text-slate-500">
            {evaluators.length} {evaluators.length === 1 ? 'elemento' : 'elementi'}
          </p>
        </div>
        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-16 text-center text-slate-400">
                    Nessun valutatore assegnato
                  </TableCell>
                </TableRow>
              ) : (
                evaluators.map((evaluator) => (
                  <TableRow key={evaluator.id}>
                    <TableCell>{evaluator.name}</TableCell>
                    <TableCell className="text-slate-500">{evaluator.email}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
