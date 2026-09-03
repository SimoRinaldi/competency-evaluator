import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface SubcompetenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  competency: {
    title: string;
    [key: string]: any;
  } | null;
  subcompetencies: any[];
  isLoading: boolean;
  error?: string;
}

export function SubcompetenciesModal({
  isOpen,
  onClose,
  competency,
  subcompetencies,
  isLoading,
  error,
}: SubcompetenciesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[800px] p-6 bg-white rounded-md shadow-lg border-slate-200 gap-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Sotto-competenze
          </DialogTitle>
          <p className="text-sm text-slate-500">{competency?.title}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center text-sm text-slate-500">
            Caricamento sotto-competenze...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
            {error}
          </div>
        ) : (
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
                {subcompetencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500 text-sm">
                      Nessuna sotto-competenza disponibile.
                    </TableCell>
                  </TableRow>
                ) : (
                  subcompetencies.map((sc: any) => {
                    const scorePercent =
                      sc.score_percentage !== null
                        ? parseFloat(sc.score_percentage) || 0
                        : null;
                    return (
                      <TableRow key={sc.subcompetency_id ?? sc.id} className="hover:bg-slate-50">
                        <TableCell className="text-sm font-medium text-slate-900">
                          {sc.title}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              sc.acquired
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {sc.acquired ? 'Acquisita' : 'Non acquisita'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm text-slate-700">
                          {sc.score_absolute !== null ? sc.score_absolute : '-'} / {sc.threshold}
                        </TableCell>
                        <TableCell className="text-center text-sm text-slate-900 font-semibold">
                          {scorePercent !== null ? `${scorePercent.toFixed(0)}%` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium py-2 px-4 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
