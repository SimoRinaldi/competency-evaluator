import { useState, useEffect } from 'react';
import { fetchRubrics, fetchTools, fetchMethods, fetchSkills } from '../competencies.api';
import { CreateRubricModal } from './create-rubric-modal';
import { RubricPickerModal } from './rubric-picker-modal';
import { MetadataPickerModal } from './metadata-picker-modal';

export function SubCompetencyPanel({
  initialData,
  newRubrics,
  setNewRubrics,
  newTools,
  setNewTools,
  newMethods,
  setNewMethods,
  newSkills,
  setNewSkills,
  onSave,
  onCancel,
}: any) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [threshold, setThreshold] = useState(initialData?.threshold || '');
  const [obsDescription, setObsDescription] = useState(initialData?.obsDescription || '');

  const [subInput, setSubInput] = useState(initialData?.input || '');
  const [subAction, setSubAction] = useState(initialData?.action || '');
  const [subOutput, setSubOutput] = useState(initialData?.output || '');

  const [indicators, setIndicators] = useState<any[]>(initialData?.indicators || []);

  const [selectedTools, setSelectedTools] = useState<(number | string)[]>(initialData?.tools || []);
  const [selectedMethods, setSelectedMethods] = useState<(number | string)[]>(
    initialData?.methods || [],
  );
  const [selectedSkills, setSelectedSkills] = useState<(number | string)[]>(
    initialData?.skills || [],
  );

  const [indDesc, setIndDesc] = useState('');
  const [indWeight, setIndWeight] = useState('');
  const [indRubricId, setIndRubricId] = useState('');

  const [dbRubrics, setDbRubrics] = useState<any[]>([]);
  const [dbTools, setDbTools] = useState<any[]>([]);
  const [dbMethods, setDbMethods] = useState<any[]>([]);
  const [dbSkills, setDbSkills] = useState<any[]>([]);

  // Gestione Modali
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false); // Modale Creazione
  const [isRubricPickerOpen, setIsRubricPickerOpen] = useState(false); // Modale Selezione
  const [pickerType, setPickerType] = useState<'tools' | 'methods' | 'skills' | null>(null);

  useEffect(() => {
    fetchRubrics().then(setDbRubrics).catch(console.error);
    fetchTools().then(setDbTools).catch(console.error);
    fetchMethods().then(setDbMethods).catch(console.error);
    fetchSkills().then(setDbSkills).catch(console.error);
  }, []);

  function handleSavePanel(e: React.FormEvent) {
    e.preventDefault();

    onSave({
      title,
      weight,
      threshold,
      obsDescription,
      input: subInput,
      action: subAction,
      output: subOutput,
      tools: selectedTools,
      methods: selectedMethods,
      skills: selectedSkills,
      indicators,
    });
  }

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
      return dbRubrics.find((r) => r.id === id);
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
    const sortedLevels = [...rubric.levels].sort((a, b) => a.rank - b.rank);
    return (
      <div className="flex gap-1 overflow-x-auto">
        {sortedLevels.map((l, i) => (
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

  const renderSelectedBadges = (
    dbItems: any[],
    tempItems: any[],
    selectedIds: (string | number)[],
  ) => {
    if (selectedIds.length === 0)
      return (
        <span className="text-muted-foreground text-sm italic font-normal">
          Nessun elemento selezionato
        </span>
      );
    const merged = [
      ...(dbItems || []),
      ...(tempItems || []).map((item: any) => ({ id: item.tempId, name: item.name })),
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {selectedIds.map((id) => {
          const match = merged.find((m) => m.id === id);
          return match ? (
            <span
              key={id}
              className="bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full shadow-sm font-medium"
            >
              {match.name}
            </span>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <form onSubmit={handleSavePanel} className="space-y-8">
      <div className="mb-6 flex items-start justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground">
            {initialData ? 'Modifica Sottocompetenza' : 'Nuova Sottocompetenza'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            Definisci il titolo della sottocompetenza, il suo peso (intero da 1 a 5) e la soglia
            minima di acquisizione. Specifica (opzionalmente) input, azione e output, e associa
            strumenti, metodi e conoscenze.
            <br />
            Infine, ricorda che ogni sottocompetenza ha un oggetto di osservazione associato a cui è
            possibile collegare uno o più indicatori.
          </p>
        </div>
      </div>

      {/* --- DATI BASE E RELAZIONI --- */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Titolo Sottocompetenza <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Comunicazione scritta"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2 w-full md:w-32">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Peso (1-5) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="5"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2 w-full md:w-32">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Soglia minima <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* --- CAMPI AGGIUNTIVI OPZIONALI --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Input
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              value={subInput}
              onChange={(e) => setSubInput(e.target.value)}
              placeholder="Es. Documento di specifiche..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Azione da svolgere
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              value={subAction}
              onChange={(e) => setSubAction(e.target.value)}
              placeholder="Es. Analizzare i requisiti..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Output
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              value={subOutput}
              onChange={(e) => setSubOutput(e.target.value)}
              placeholder="Es. Diagramma UML..."
            />
          </div>
        </div>

        {/* --- M-N RELATIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-muted/30 p-4 rounded-xl border border-border/60 flex flex-col justify-between">
            <div className="space-y-3 mb-4">
              <label className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                Strumenti
              </label>
              <div className="content-start">
                {renderSelectedBadges(dbTools, newTools, selectedTools)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPickerType('tools')}
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Scegli / Crea Strumenti
            </button>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border border-border/60 flex flex-col justify-between">
            <div className="space-y-3 mb-4">
              <label className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                Metodi
              </label>
              <div className="content-start">
                {renderSelectedBadges(dbMethods, newMethods, selectedMethods)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPickerType('methods')}
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Scegli / Crea Metodi
            </button>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border border-border/60 flex flex-col justify-between">
            <div className="space-y-3 mb-4">
              <label className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                Conoscenze (Skills)
              </label>
              <div className="content-start">
                {renderSelectedBadges(dbSkills, newSkills, selectedSkills)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPickerType('skills')}
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Scegli / Crea Conoscenze
            </button>
          </div>
        </div>

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
      </div>

      <div className="border-b border-border"></div>

      {/* --- SEZIONE INDICATORI --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Indicatori associati ({indicators.length})
        </h3>

        {indicators.length > 0 && (
          <ul className="space-y-3">
            {indicators.map((ind, idx) => {
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

        {/* Mini-form per aggiungere un indicatore con Shadcn */}
        <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-4">
          <h4 className="font-medium text-slate-700">+ Aggiungi un indicatore</h4>

          <div className="space-y-4">
            {/* RIGA 1: Descrizione e Peso */}
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

            {/* RIGA 2: Rubrica e Bottone Aggiungi */}
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

      <div className="border-b border-border"></div>

      {/* --- BOTTONI SALVATAGGIO --- */}
      <div className="flex justify-end gap-3">
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Annulla Modifiche
          </button>
        )}
        <button
          type="submit"
          disabled={indicators.length === 0}
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          Conferma Sottocompetenza
        </button>
      </div>

      {/* ===================== MODALE 1: SCELTA RUBRICA VISUALE ===================== */}
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

      {/* ===================== MODALE 2: CREAZIONE RUBRICA ===================== */}
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

      {/* ===================== MODALE METADATI ===================== */}
      {pickerType && (
        <MetadataPickerModal
          isOpen={!!pickerType}
          onClose={() => setPickerType(null)}
          title={
            pickerType === 'tools'
              ? 'Gestione Strumenti'
              : pickerType === 'methods'
              ? 'Gestione Metodi'
              : 'Gestione Conoscenze (Skills)'
          }
          dbItems={
            pickerType === 'tools' ? dbTools : pickerType === 'methods' ? dbMethods : dbSkills
          }
          tempItems={
            pickerType === 'tools' ? newTools : pickerType === 'methods' ? newMethods : newSkills
          }
          selectedIds={
            pickerType === 'tools'
              ? selectedTools
              : pickerType === 'methods'
              ? selectedMethods
              : selectedSkills
          }
          onToggleSelection={(id: string | number) => {
            const list =
              pickerType === 'tools'
                ? selectedTools
                : pickerType === 'methods'
                ? selectedMethods
                : selectedSkills;
            const setList =
              pickerType === 'tools'
                ? setSelectedTools
                : pickerType === 'methods'
                ? setSelectedMethods
                : setSelectedSkills;
            if (list.includes(id)) {
              setList(list.filter((item: string | number) => item !== id));
            } else {
              setList([...list, id]);
            }
          }}
          onCreateNew={(name: string) => {
            const newId = `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            if (pickerType === 'tools') {
              setNewTools([...newTools, { tempId: newId, name }]);
              setSelectedTools([...selectedTools, newId]);
            } else if (pickerType === 'methods') {
              setNewMethods([...newMethods, { tempId: newId, name }]);
              setSelectedMethods([...selectedMethods, newId]);
            } else if (pickerType === 'skills') {
              setNewSkills([...newSkills, { tempId: newId, name }]);
              setSelectedSkills([...selectedSkills, newId]);
            }
          }}
        />
      )}
    </form>
  );
}
