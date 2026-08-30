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
  competencyTitle: string;
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
  competencyTitle,
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
          <span className="text-base font-medium text-slate-900 leading-relaxed">
            {assessmentSituation || '-'}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Competenza Selezionata
          </span>
          <span className="text-base font-medium text-slate-900">
            {competencyTitle || '-'}
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* Prove / Sottocompetenze */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-lg font-semibold text-slate-800">Prove</h4>
          <p className="text-sm text-slate-500">
            {subcompetencies.length}{' '}
            {subcompetencies.length === 1 ? 'elemento' : 'elementi'}
          </p>
        </div>
        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Titolo Prova</TableHead>
                <TableHead className="text-right">Soglia %</TableHead>
                <TableHead className="text-right">Peso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcompetencies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-20 text-center text-slate-400"
                  >
                    Nessuna prova associata
                  </TableCell>
                </TableRow>
              ) : (
                subcompetencies.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-slate-500">
                      {sub.id}
                    </TableCell>
                    <TableCell className="font-medium">{sub.title}</TableCell>
                    <TableCell className="text-right">
                      {sub.threshold}%
                    </TableCell>
                    <TableCell className="text-right">{sub.weight}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* Studenti / Utenti Valutati */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-lg font-semibold text-slate-800">Studenti</h4>
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
                  <TableCell
                    colSpan={2}
                    className="h-16 text-center text-slate-400"
                  >
                    Nessuno studente assegnato
                  </TableCell>
                </TableRow>
              ) : (
                students.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-slate-500">
                      {user.email}
                    </TableCell>
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
            {evaluators.length}{' '}
            {evaluators.length === 1 ? 'elemento' : 'elementi'}
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
                  <TableCell
                    colSpan={2}
                    className="h-16 text-center text-slate-400"
                  >
                    Nessun valutatore assegnato
                  </TableCell>
                </TableRow>
              ) : (
                evaluators.map((evaluator) => (
                  <TableRow key={evaluator.id}>
                    <TableCell className="font-medium">
                      {evaluator.name}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {evaluator.email}
                    </TableCell>
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
