import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function RubricPickerModal({ isOpen, onClose, dbRubrics, newRubrics, onSelect, onCreateNew }: any) {
  
  // Funzione helper per disegnare i livelli di una rubrica orizzontalmente (versione compatta)
  const renderLevels = (levels: any[]) => {
    // ordiniamo per rank per sicurezza
    const sortedLevels = [...levels].sort((a, b) => a.rank - b.rank);
    return (
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1">
        {sortedLevels.map((l, i) => (
          <div key={i} className="flex-shrink-0 bg-slate-100/50 rounded px-2 py-1 text-xs border border-slate-200 max-w-[200px]">
            <span className="font-bold text-slate-700 mr-1">{l.rank}.</span>
            <span className="text-slate-600 whitespace-normal break-words leading-tight">{l.description}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] md:max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Seleziona una Rubrica di Valutazione</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          
          {/* Sezione Nuove Rubriche (se esistono) */}
          {newRubrics && newRubrics.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nuove Rubriche</h3>
              <div className="border border-slate-300 rounded-md overflow-hidden bg-slate-50">
                <div className="divide-y divide-slate-200 max-h-[30vh] overflow-y-auto scrollbar-thin">
                  {newRubrics.map((r: any, idx: number) => (
                    <div key={`temp_${idx}`} className="p-2 hover:bg-slate-100 transition-colors flex gap-3 items-center overflow-hidden">
                      <div className="flex-1 min-w-0">
                        {renderLevels(r.levels)}
                      </div>
                      <Button onClick={() => onSelect(`temp_${idx}`)} variant="outline" size="sm" className="whitespace-nowrap h-7 text-xs px-3 bg-white">
                        Seleziona
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sezione Rubriche DB */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rubriche Esistenti</h3>
            {dbRubrics.length === 0 && <p className="text-slate-500 text-sm">Nessuna rubrica disponibile.</p>}
            
            {dbRubrics.length > 0 && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                <div className="divide-y divide-slate-100 max-h-[40vh] overflow-y-auto scrollbar-thin">
                  {dbRubrics.map((r: any) => (
                    <div key={`db_${r.id}`} className="p-2 hover:bg-slate-50 transition-colors flex gap-3 items-center overflow-hidden">
                      <div className="flex-1 min-w-0">
                        {renderLevels(r.levels)}
                      </div>
                      <Button onClick={() => onSelect(`db_${r.id}`)} variant="outline" size="sm" className="whitespace-nowrap h-7 text-xs px-3">
                        Seleziona
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center mt-4">
            <span className="text-slate-500 text-xs">Non trovi quella giusta?</span>
            <Button onClick={onCreateNew} className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs px-4">
              + Crea Nuova Rubrica
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
