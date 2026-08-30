export function RubricPickerModal({
  isOpen,
  onClose,
  dbRubrics,
  newRubrics,
  onSelect,
  onCreateNew,
}: any) {
  if (!isOpen) return null;

  // Funzione helper per disegnare i livelli di una rubrica orizzontalmente (versione compatta)
  const renderLevels = (levels: any[]) => {
    // ordiniamo per rank per sicurezza
    const sortedLevels = [...levels].sort((a, b) => a.rank - b.rank);
    return (
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1">
        {sortedLevels.map((l, i) => (
          <div
            key={i}
            className="flex-shrink-0 bg-muted/50 rounded px-2 py-1 text-xs border border-border max-w-[200px]"
          >
            <span className="font-bold text-slate-700 mr-1">{l.rank}.</span>
            <span className="text-slate-600 whitespace-normal break-words leading-tight">
              {l.description}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[90vw] md:max-w-5xl max-h-[85vh] overflow-y-auto rounded-lg border bg-white p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="mb-4">
          <h2 className="text-xl font-semibold leading-none tracking-tight">
            Seleziona una Rubrica di Valutazione
          </h2>
        </div>

        <div className="space-y-6 mt-2">
          {/* Sezione Nuove Rubriche (se esistono) */}
          {newRubrics && newRubrics.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Nuove Rubriche
              </h3>
              <div className="border border-border rounded-md overflow-hidden bg-muted/30">
                <div className="divide-y divide-slate-200 max-h-[30vh] overflow-y-auto scrollbar-thin">
                  {newRubrics.map((r: any, idx: number) => (
                    <div
                      key={`temp_${idx}`}
                      className="p-2 hover:bg-muted transition-colors flex gap-3 items-center overflow-hidden"
                    >
                      <div className="flex-1 min-w-0">{renderLevels(r.levels)}</div>
                      <button
                        onClick={() => onSelect(`temp_${idx}`)}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs h-7 font-medium whitespace-nowrap hover:bg-gray-100"
                      >
                        Seleziona
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sezione Rubriche DB */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Rubriche Esistenti
            </h3>
            {dbRubrics.length === 0 && (
              <p className="text-muted-foreground text-sm">Nessuna rubrica disponibile.</p>
            )}

            {dbRubrics.length > 0 && (
              <div className="border border-border rounded-md overflow-hidden bg-card shadow-sm">
                <div className="divide-y divide-slate-100 max-h-[40vh] overflow-y-auto scrollbar-thin">
                  {dbRubrics.map((r: any) => (
                    <div
                      key={`db_${r.id}`}
                      className="p-2 hover:bg-muted/30 transition-colors flex gap-3 items-center overflow-hidden"
                    >
                      <div className="flex-1 min-w-0">{renderLevels(r.levels)}</div>
                      <button
                        onClick={() => onSelect(`db_${r.id}`)}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs h-7 font-medium whitespace-nowrap hover:bg-gray-100"
                      >
                        Seleziona
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center mt-4">
            <span className="text-slate-500 text-xs">Non trovi quella giusta?</span>
            <button
              onClick={onCreateNew}
              className="inline-flex h-8 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              + Crea Nuova Rubrica
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
