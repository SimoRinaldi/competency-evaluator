import { useState, useEffect } from 'react';
import { fetchRubrics, fetchTools, fetchMethods, fetchSkills } from '../competencies.api';
import { CreateRubricModal } from './create-rubric-modal';
import { RubricPickerModal } from './rubric-picker-modal';
import { MetadataPickerModal } from './metadata-picker-modal';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function SubCompetencyPanel({ 
  initialData, 
  newRubrics, setNewRubrics,
  newTools, setNewTools,
  newMethods, setNewMethods,
  newSkills, setNewSkills,
  onSave, onCancel 
}: any) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [threshold, setThreshold] = useState(initialData?.threshold || '');
  const [obsDescription, setObsDescription] = useState(
    initialData?.obsDescription || ''
  );

  const [subInput, setSubInput] = useState(initialData?.input || '');
  const [subAction, setSubAction] = useState(initialData?.action || '');
  const [subOutput, setSubOutput] = useState(initialData?.output || '');

  const [indicators, setIndicators] = useState<any[]>(
    initialData?.indicators || []
  );

  const [selectedTools, setSelectedTools] = useState<(number|string)[]>(initialData?.tools || []);
  const [selectedMethods, setSelectedMethods] = useState<(number|string)[]>(initialData?.methods || []);
  const [selectedSkills, setSelectedSkills] = useState<(number|string)[]>(initialData?.skills || []);

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
    if (!rubric || !rubric.levels) return <span className="text-slate-400 italic">Nessuna rubrica</span>;
    const sortedLevels = [...rubric.levels].sort((a, b) => a.rank - b.rank);
    return (
      <div className="flex gap-1 overflow-x-auto">
        {sortedLevels.map((l, i) => (
          <div key={i} className="flex-shrink-0 bg-slate-100 rounded px-2 py-1 text-xs border border-slate-200">
            <span className="font-bold text-slate-700">{l.rank}.</span> <span className="text-slate-600 truncate max-w-[150px] inline-block align-bottom">{l.description}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSelectedBadges = (dbItems: any[], tempItems: any[], selectedIds: (string|number)[]) => {
    if (selectedIds.length === 0) return <span className="text-slate-400 text-sm italic font-normal">Nessun elemento selezionato</span>;
    const merged = [
      ...(dbItems || []), 
      ...(tempItems || []).map((item: any) => ({ id: item.tempId, name: item.name }))
    ];
    
    return (
      <div className="flex flex-wrap gap-2">
        {selectedIds.map(id => {
          const match = merged.find(m => m.id === id);
          return match ? (
            <span key={id} className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-full shadow-sm font-medium">
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
          <h2 className="text-2xl font-bold text-slate-900">
            {initialData ? 'Modifica Sottocompetenza' : 'Nuova Sottocompetenza'}
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            Definisci il titolo della sottocompetenza, il suo peso (intero da 1 a 5) e la soglia minima di acquisizione. Specifica (opzionalmente) input, azione e output, e associa strumenti, metodi e conoscenze.
            <br />
            Infine, ricorda che ogni sottocompetenza ha un oggetto di osservazione associato a cui è possibile collegare uno o più indicatori.
          </p>
        </div>
      </div>

      {/* --- DATI BASE E RELAZIONI --- */}
      <div className="space-y-6">
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="space-y-2 flex-1">
            <Label>
              Titolo Sottocompetenza <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Comunicazione scritta"
            />
          </div>

          <div className="space-y-2 w-full md:w-32">
            <Label>
              Peso (1-5) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              max="5"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2 w-full md:w-32">
            <Label>
              Soglia minima <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              required
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
        </div>

        {/* --- CAMPI AGGIUNTIVI OPZIONALI --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <Label>Input</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              value={subInput}
              onChange={(e) => setSubInput(e.target.value)}
              placeholder="Es. Documento di specifiche..."
            />
          </div>
          <div className="space-y-2">
            <Label>Azione da svolgere</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              value={subAction}
              onChange={(e) => setSubAction(e.target.value)}
              placeholder="Es. Analizzare i requisiti..."
            />
          </div>
          <div className="space-y-2">
            <Label>Output</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              value={subOutput}
              onChange={(e) => setSubOutput(e.target.value)}
              placeholder="Es. Diagramma UML..."
            />
          </div>
        </div>

        {/* --- M-N RELATIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between">
            <div className="space-y-3 mb-4">
              <Label className="text-slate-700 font-bold">Strumenti</Label>
              <div className="content-start">
                {renderSelectedBadges(dbTools, newTools, selectedTools)}
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full bg-white hover:bg-slate-100" onClick={() => setPickerType('tools')}>
              Scegli / Crea Strumenti
            </Button>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between">
            <div className="space-y-3 mb-4">
              <Label className="text-slate-700 font-bold">Metodi</Label>
              <div className="content-start">
                {renderSelectedBadges(dbMethods, newMethods, selectedMethods)}
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full bg-white hover:bg-slate-100" onClick={() => setPickerType('methods')}>
              Scegli / Crea Metodi
            </Button>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between">
            <div className="space-y-3 mb-4">
              <Label className="text-slate-700 font-bold">Conoscenze (Skills)</Label>
              <div className="content-start">
                {renderSelectedBadges(dbSkills, newSkills, selectedSkills)}
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full bg-white hover:bg-slate-100" onClick={() => setPickerType('skills')}>
              Scegli / Crea Conoscenze
            </Button>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label>
            Descrizione Oggetto di Osservazione <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            required
            value={obsDescription}
            onChange={(e) => setObsDescription(e.target.value)}
            placeholder="Es. Tema di italiano"
          />
        </div>
      </div>

      <div className="border-b border-slate-200"></div>

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
                <li key={idx} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-slate-900">{ind.description}</strong>
                    <span className="text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">Peso: {ind.weight}</span>
                  </div>
                  <RubricLevelsPreview rubric={r} />
                </li>
              );
            })}
          </ul>
        )}

        {/* Mini-form per aggiungere un indicatore con Shadcn */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <h4 className="font-medium text-slate-700">
            + Aggiungi un indicatore
          </h4>

          <div className="space-y-4">
            {/* RIGA 1: Descrizione e Peso */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label>Descrizione <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  value={indDesc}
                  onChange={(e) => setIndDesc(e.target.value)}
                  placeholder="Es. Usa punteggiatura corretta"
                />
              </div>
              <div className="w-32 space-y-2">
                <Label>Peso (1-5) <span className="text-red-500">*</span></Label>
                <Input
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
                />
              </div>
            </div>

            {/* RIGA 2: Rubrica e Bottone Aggiungi */}
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Rubrica Valutazione <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 items-stretch">
                  <div className={`flex-1 px-3 py-2 border rounded-md text-sm ${indRubricId ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200 text-slate-500'}`}>
                    {indRubricId ? <RubricLevelsPreview rubric={getSelectedRubric(indRubricId)} /> : "Nessuna selezionata"}
                  </div>
                  <Button type="button" variant="outline" className="h-auto px-6 bg-white" onClick={() => setIsRubricPickerOpen(true)}>
                    Scegli
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                disabled={!indDesc.trim() || !indWeight || parseInt(indWeight) < 1 || parseInt(indWeight) > 5 || !indRubricId}
                className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm disabled:bg-slate-300 h-10"
                onClick={handleAddIndicator}
              >
                + Aggiungi
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200"></div>

      {/* --- BOTTONI SALVATAGGIO --- */}
      <div className="flex justify-end gap-3">
        {initialData && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla Modifiche
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={indicators.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Conferma Sottocompetenza
        </Button>
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
      <Dialog open={isRubricModalOpen} onOpenChange={setIsRubricModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crea Nuova Rubrica</DialogTitle>
          </DialogHeader>

          <CreateRubricModal
            onSave={handleAddCustomRubric}
          />
        </DialogContent>
      </Dialog>

      {/* ===================== MODALE METADATI ===================== */}
      {pickerType && (
        <MetadataPickerModal
          isOpen={!!pickerType}
          onClose={() => setPickerType(null)}
          title={
            pickerType === 'tools' ? 'Gestione Strumenti' :
            pickerType === 'methods' ? 'Gestione Metodi' :
            'Gestione Conoscenze (Skills)'
          }
          dbItems={
            pickerType === 'tools' ? dbTools : 
            pickerType === 'methods' ? dbMethods : 
            dbSkills
          }
          tempItems={
            pickerType === 'tools' ? newTools : 
            pickerType === 'methods' ? newMethods : 
            newSkills
          }
          selectedIds={
            pickerType === 'tools' ? selectedTools : 
            pickerType === 'methods' ? selectedMethods : 
            selectedSkills
          }
          onToggleSelection={(id: string | number) => {
            const list = pickerType === 'tools' ? selectedTools : pickerType === 'methods' ? selectedMethods : selectedSkills;
            const setList = pickerType === 'tools' ? setSelectedTools : pickerType === 'methods' ? setSelectedMethods : setSelectedSkills;
            if (list.includes(id)) {
              setList(list.filter((item: string|number) => item !== id));
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
