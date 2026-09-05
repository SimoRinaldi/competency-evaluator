export function Step3Summary({
  competencyData,
  subCompetencies,
  onSave,
  onEditStep1,
  onEditStep2,
  isLoading,
  error,
}: any) {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Riepilogo e Salvataggio
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Controlla i dati inseriti. Se il riepilogo è corretto, procedi al salvataggio definitivo.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          <strong>Errore durante il salvataggio:</strong> {error}
        </div>
      )}

      {/* --- RECAP COMPETENZA --- */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="bg-muted/30 border-b border-border px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
            1. Dati Generali
          </h3>
          <button
            type="button"
            onClick={onEditStep1}
            className="inline-flex h-7 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-xs font-medium hover:bg-slate-100"
          >
            Modifica
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Titolo
              </span>
              <p className="text-foreground font-medium text-sm mt-0.5">
                {competencyData.title || 'Nessun titolo'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Peso
              </span>
              <p className="text-foreground font-medium text-sm mt-0.5">
                {competencyData.weight || 'Nessun peso'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RECAP SOTTOCOMPETENZE --- */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="bg-muted/30 border-b border-border px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
            2. Sottocompetenze ({subCompetencies.length})
          </h3>
          <button
            type="button"
            onClick={onEditStep2}
            className="inline-flex h-7 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-xs font-medium hover:bg-slate-100"
          >
            Modifica
          </button>
        </div>

        {subCompetencies.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm italic">
            Nessuna sottocompetenza inserita.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {subCompetencies.map((sub: any, idx: number) => (
              <div key={idx} className="p-4">
                {/* RIGA 1: Titolo e Pesi */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="text-muted-foreground font-mono text-xs mr-2">{idx + 1}.</span>
                    <strong className="text-foreground text-sm">{sub.title}</strong>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <span className="text-[11px] bg-muted border border-border px-1.5 py-0.5 rounded text-slate-600 font-medium">
                      P: {sub.weight}
                    </span>
                    <span className="text-[11px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-emerald-700 font-medium">
                      S: {sub.threshold}
                    </span>
                  </div>
                </div>

                {/* RIGA 2: Dettagli base (Input/Action/Output collassati) */}
                <div className="mt-1.5 ml-6 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Osservazione:{' '}
                    <span className="text-slate-700 font-medium">{sub.obsDescription}</span>
                  </span>
                  {sub.input && (
                    <span>
                      • <span className="text-slate-700">Input</span> presente
                    </span>
                  )}
                  {sub.action && (
                    <span>
                      • <span className="text-slate-700">Azione</span> presente
                    </span>
                  )}
                  {sub.output && (
                    <span>
                      • <span className="text-slate-700">Output</span> presente
                    </span>
                  )}
                </div>

                {/* RIGA 3: Metadati M-N */}
                {(sub.tools?.length > 0 || sub.methods?.length > 0 || sub.skills?.length > 0) && (
                  <div className="mt-2 ml-6 flex gap-2">
                    {sub.tools?.length > 0 && (
                      <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border">
                        Strumenti: {sub.tools.length}
                      </span>
                    )}
                    {sub.methods?.length > 0 && (
                      <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border">
                        Metodi: {sub.methods.length}
                      </span>
                    )}
                    {sub.skills?.length > 0 && (
                      <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border">
                        Conoscenze: {sub.skills.length}
                      </span>
                    )}
                  </div>
                )}

                {/* RIGA 4: Indicatori (Compatto) */}
                <div className="mt-3 ml-6 bg-muted/30/50 rounded-md border border-slate-100 p-2.5">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Indicatori ({sub.indicators?.length || 0})
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {sub.indicators?.map((ind: any, i: number) => (
                      <li key={i} className="flex justify-between items-center">
                        <span className="truncate pr-4">- {ind.description}</span>
                        <span className="shrink-0 text-muted-foreground">Peso {ind.weight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTONE FINALE */}
      <div className="pt-4 flex justify-between items-center w-full">
        <button
          type="button"
          onClick={onEditStep2}
          className="inline-flex h-11 items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-sm font-medium hover:bg-gray-100 shadow-sm"
        >
          ← Torna a Sottocompetenze
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading || subCompetencies.length === 0}
          className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-8 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:bg-slate-300 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? 'Salvataggio in corso...' : 'Salva intera Competenza'}
        </button>
      </div>
    </div>
  );
}
