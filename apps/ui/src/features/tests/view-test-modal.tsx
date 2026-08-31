import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { fetchTestDetails, ApiTestDetails } from './tests.api';
import { TestSummaryView } from './test-summary-view';

export interface ViewTestModalProps {
  testId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewTestModal({
  testId,
  isOpen,
  onClose,
}: ViewTestModalProps) {
  const [details, setDetails] = useState<ApiTestDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && testId) {
      loadData(testId);
    } else {
      setDetails(null);
      setError(null);
    }
  }, [isOpen, testId]);

  async function loadData(id: number) {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTestDetails(id);
      setDetails(data);
    } catch (err: any) {
      console.error('Errore durante il recupero dei dettagli del test:', err);
      setError(err?.message || 'Impossibile caricare i dati del test');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] xl:max-w-[1200px] w-full max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
        
        {/* HEADER */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Dettagli Test
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
              Riepilogo completo della configurazione del test {testId ? `#${testId}` : ''}
            </p>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Caricamento dettagli del test...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testId && loadData(testId)}
                className="mt-2"
              >
                Riprova
              </Button>
            </div>
          ) : details ? (
            <TestSummaryView
              assessmentSituation={details.test.assessment_situation}
              competencyTitle={details.competencyTitle}
              subcompetencies={details.subcompetencies}
              students={details.students}
              evaluators={details.evaluators}
            />
          ) : null}
        </div>

        {/* FOOTER */}
        <DialogFooter className="p-4 md:p-6 border-t border-slate-100 flex flex-row items-center justify-end bg-white mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 border-slate-300 text-slate-700"
          >
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
