import { useState } from 'react';
import { CreateRubricModal } from './create-rubric-modal';
import { RubricPickerModal } from './rubric-picker-modal';

export function ObservationObjectPanel({
  obsDescription,
  setObsDescription,
  indicators,
  setIndicators,
  dbRubrics,
  newRubrics,
  setNewRubrics,
}: any) {
  const [indDesc, setIndDesc] = useState('');
  const [indWeight, setIndWeight] = useState('');
  const [indRubricId, setIndRubricId] = useState('');

  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [isRubricPickerOpen, setIsRubricPickerOpen] = useState(false);

  function handleAddIndicator() {
    if (!indDesc || !indWeight || !indRubricId) return;
    setIndicators([
      ...indicators,
      { description: indDesc, weight: indWeight, rubricId: indRubricId },
    ]);
    setIndDesc('');
    setIndWeight('');
    setIndRubricId('');
  }

  const handleAddCustomRubric = (rubricData: any) => {
    if (indRubricId && indRubricId.startsWith('temp_')) {
      const isUsedBySavedIndicators = indicators.some((ind: any) => ind.rubricId === indRubricId);
      if (!isUsedBySavedIndicators) {
        const idx = parseInt(indRubricId.split('_')[1], 10);
        const updated = [...newRubrics];
        updated[idx] = rubricData;
        setNewRubrics(updated);
        setIsRubricModalOpen(false);
        setIsRubricPickerOpen(true);
        return;
      }
    }

    const newIdx = newRubrics.length;
    setNewRubrics([...newRubrics, rubricData]);
    setIndRubricId(`temp_${newIdx}`);
    setIsRubricModalOpen(false);
    setIsRubricPickerOpen(true);
  };

  function getSelectedRubric(idStr: string) {
    if (!idStr) return null;
    if (idStr.startsWith('db_')) {
      const id = parseInt(idStr.replace('db_', ''));
      return dbRubrics.find((r: any) => r.id === id);
    }
    if (idStr.startsWith('temp_')) {
      const id = parseInt(idStr.replace('temp_', ''));
      return newRubrics?.[id];
    }
    return null;
  }

  const RubricLevelsPreview = ({ rubric }: { rubric: any }) => {
    if (!rubric || !rubric.levels)
      return <span className="text-muted-foreground italic">Nessuna rubrica</span>;
    const sortedLevels = [...rubric.levels].sort((a: any, b: any) => a.rank - b.rank);
    return (
      <div className="flex gap-1 overflow-x-auto">
        {sortedLevels.map((l: any, i: number) => (
          <div
            key={i}
            className="flex-shrink-0 bg-muted rounded px-2 py-1 text-xs border border-border"
          >
            <span className="font-bold text-slate-700">{l.rank}.</span>{' '}
            <span className="text-slate-600 truncate max-w-[150px] inline-block align-bottom">
              {l.description}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Descrizione Oggetto di Osservazione <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={obsDescription}
          onChange={(e) => setObsDescription(e.target.value)}
          placeholder="Es. Tema di italiano"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="border-b border-border"></div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Indicatori associati ({indicators.length})
        </h3>

        {indicators.length > 0 && (
          <ul className="space-y-3">
            {indicators.map((ind: any, idx: number) => {
              const r = getSelectedRubric(ind.rubricId);
              return (
                <li key={idx} className="bg-card border border-border rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-foreground">{ind.description}</strong>
                    <span className="text-sm bg-muted text-slate-600 px-2 py-1 rounded font-medium">
                      Peso: {ind.weight}
                    </span>
                  </div>
                  <RubricLevelsPreview rubric={r} />
                </li>
              );
            })}
          </ul>
        )}

        <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-4">
          <h4 className="font-medium text-slate-700">+ Aggiungi un indicatore</h4>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Descrizione <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={indDesc}
                  onChange={(e) => setIndDesc(e.target.value)}
                  placeholder="Es. Usa punteggiatura corretta"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="w-32 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Peso (1-5) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={indWeight}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (e.target.value === '' || (val >= 1 && val <= 5)) {
                      setIndWeight(e.target.value);
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Rubrica Valutazione <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 items-stretch">
                  <div
                    className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                      indRubricId
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-card border-border text-muted-foreground'
                    }`}
                  >
                    {indRubricId ? (
                      <RubricLevelsPreview rubric={getSelectedRubric(indRubricId)} />
                    ) : (
                      'Nessuna selezionata'
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRubricPickerOpen(true)}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium hover:bg-gray-100 h-auto"
                  >
                    Scegli
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  !indDesc.trim() ||
                  !indWeight ||
                  parseInt(indWeight) < 1 ||
                  parseInt(indWeight) > 5 ||
                  !indRubricId
                }
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-300 disabled:pointer-events-none"
                onClick={handleAddIndicator}
              >
                + Aggiungi
              </button>
            </div>
          </div>
        </div>
      </div>

      <RubricPickerModal
        isOpen={isRubricPickerOpen}
        onClose={() => setIsRubricPickerOpen(false)}
        dbRubrics={dbRubrics}
        newRubrics={newRubrics}
        onSelect={(selectedId: string) => {
          setIndRubricId(selectedId);
          setIsRubricPickerOpen(false);
        }}
        onCreateNew={() => {
          setIsRubricPickerOpen(false);
          setIsRubricModalOpen(true);
        }}
      />

      {isRubricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg relative">
            <button
              type="button"
              onClick={() => setIsRubricModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              &times;
            </button>
            <div className="mb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                Crea Nuova Rubrica
              </h2>
            </div>
            <CreateRubricModal onSave={handleAddCustomRubric} />
          </div>
        </div>
      )}
    </div>
  );
}
