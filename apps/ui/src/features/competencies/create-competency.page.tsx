import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Step1Competency } from './components/step1-competency';
import { SubCompetencyPanel } from './components/sub-competency-panel';
import { Step3Summary } from './components/step3-summary';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createCompetencyChain } from './competencies.api';
import { useFeedback } from '../../providers/feedback-provider';

export function CreateCompetencyPage({ onSuccess }: { onSuccess?: () => void }) {
  const navigate = useNavigate();
  const { showSuccess } = useFeedback();
  // Menu principale: 1 = Competenza, 2 = Sottocompetenze, 3 = Riepilogo
  const [activeMenu, setActiveMenu] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Sottocompetenza attiva?
  // -1 = Nessuna, 0, 1, 2 = Indice dell'array
  const [activeSubIndex, setActiveSubIndex] = useState(-1);

  const [competencyData, setCompetencyData] = useState({
    title: '',
    weight: '',
  });

  const isStep1Valid = competencyData.title.trim() !== '' && competencyData.weight !== '';

  const [subCompetencies, setSubCompetencies] = useState<any[]>([]);

  // Rubriche temporanee (create nel form ma non ancora salvate sul server)
  const [newRubrics, setNewRubrics] = useState<any[]>([]);
  const [newTools, setNewTools] = useState<any[]>([]);
  const [newMethods, setNewMethods] = useState<any[]>([]);
  const [newSkills, setNewSkills] = useState<any[]>([]);

  // Indica se l'utente ha mai cliccato "Avanti" nello step 1
  const [hasPassedStep1, setHasPassedStep1] = useState(false);

  // Chiave per forzare lo svuotamento del form quando si crea una nuova sottocompetenza
  const [formResetKey, setFormResetKey] = useState(0);

  // Funzione per salvare la sottocompetenza dalla modale/panel
  const handleSaveSubCompetency = (subData: any) => {
    const updatedSubs = [...subCompetencies];
    if (activeSubIndex === -1) {
      updatedSubs.push(subData);
    } else {
      updatedSubs[activeSubIndex] = subData;
    }
    setSubCompetencies(updatedSubs);
    setActiveSubIndex(-1); // torna alla visualizzazione vuota

    // --- GARBAGE COLLECTION ---
    // Eliminiamo dalla memoria globale i tools/methods/skills temporanei
    // che l'utente aveva creato col bottone "+ Crea" ma che alla fine
    // NON sono stati associati a NESSUNA sottocompetenza salvata.
    const referencedTools = new Set<string>();
    const referencedMethods = new Set<string>();
    const referencedSkills = new Set<string>();

    updatedSubs.forEach((sub) => {
      sub.tools.forEach((t: any) => {
        if (String(t).startsWith('temp_')) referencedTools.add(String(t));
      });
      sub.methods.forEach((m: any) => {
        if (String(m).startsWith('temp_')) referencedMethods.add(String(m));
      });
      sub.skills.forEach((s: any) => {
        if (String(s).startsWith('temp_')) referencedSkills.add(String(s));
      });
    });

    setNewTools(newTools.filter((t) => referencedTools.has(t.tempId)));
    setNewMethods(newMethods.filter((m) => referencedMethods.has(m.tempId)));
    setNewSkills(newSkills.filter((s) => referencedSkills.has(s.tempId)));

    setFormResetKey((prev) => prev + 1);
  };

  function handleCreateNewSub() {
    if (isStep1Valid) {
      setHasPassedStep1(true);
      setActiveMenu(2);
      setActiveSubIndex(-1);
      setFormResetKey((prev) => prev + 1);
    }
  }

  const handleFinalSave = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        title: competencyData.title,
        weight: parseInt(competencyData.weight),
        subcompetencies: subCompetencies.map((sub) => {
          const tool_ids = sub.tools
            .filter(
              (t: any) => typeof t === 'number' || (typeof t === 'string' && t.startsWith('db_')),
            )
            .map((t: any) => (typeof t === 'string' ? parseInt(t.replace('db_', '')) : t));
          const tools = sub.tools
            .filter((t: any) => typeof t === 'string' && t.startsWith('temp_'))
            .map((t: any) => ({ name: newTools.find((nt) => nt.tempId === t)?.name }));

          const method_ids = sub.methods
            .filter(
              (m: any) => typeof m === 'number' || (typeof m === 'string' && m.startsWith('db_')),
            )
            .map((m: any) => (typeof m === 'string' ? parseInt(m.replace('db_', '')) : m));
          const methods = sub.methods
            .filter((m: any) => typeof m === 'string' && m.startsWith('temp_'))
            .map((m: any) => ({ name: newMethods.find((nm) => nm.tempId === m)?.name }));

          const skill_ids = sub.skills
            .filter(
              (s: any) => typeof s === 'number' || (typeof s === 'string' && s.startsWith('db_')),
            )
            .map((s: any) => (typeof s === 'string' ? parseInt(s.replace('db_', '')) : s));
          const skills = sub.skills
            .filter((s: any) => typeof s === 'string' && s.startsWith('temp_'))
            .map((s: any) => ({ name: newSkills.find((ns) => ns.tempId === s)?.name }));

          return {
            title: sub.title,
            weight: parseInt(sub.weight),
            threshold: parseInt(sub.threshold),
            input: sub.input || undefined,
            action: sub.action || undefined,
            output: sub.output || undefined,
            tool_ids,
            tools: tools.filter((t: any) => t.name),
            method_ids,
            methods: methods.filter((m: any) => m.name),
            skill_ids,
            skills: skills.filter((s: any) => s.name),
            observationObject: {
              description: sub.obsDescription,
              indicators: sub.indicators.map((ind: any) => {
                const isTempRubric =
                  typeof ind.rubricId === 'string' && ind.rubricId.startsWith('temp_');
                const isDbRubric =
                  typeof ind.rubricId === 'string' && ind.rubricId.startsWith('db_');
                let rubric_set_id = undefined;
                let rubricSet = undefined;

                if (isDbRubric) {
                  rubric_set_id = parseInt(ind.rubricId.replace('db_', ''));
                } else if (typeof ind.rubricId === 'number') {
                  rubric_set_id = ind.rubricId;
                } else if (isTempRubric) {
                  const idx = parseInt(ind.rubricId.replace('temp_', ''));
                  const rData = newRubrics[idx];
                  rubricSet = {
                    yes_no: rData.yesNo,
                    levels: rData.levels.map((l: any) => ({
                      description: l.description,
                      rank: l.rank,
                    })),
                  };
                }

                return {
                  description: ind.description,
                  weight: parseInt(ind.weight),
                  ...(rubric_set_id ? { rubric_set_id } : { rubricSet }),
                };
              }),
            },
          };
        }),
      };

      await createCompetencyChain(payload);
      showSuccess('Competenza creata con successo!');
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Errore durante il salvataggio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep2Enabled = isStep1Valid && hasPassedStep1;
  const isStep3Enabled = subCompetencies.length > 0;

  return (
    <>
      {/* COLONNA SINISTRA: SIDEBAR STEPS */}
      <div className="w-full md:w-72 shrink-0 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col md:block">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-8 hidden md:block">
          Creazione Guidata
        </h2>

        <ul className="flex flex-row md:flex-col gap-2 md:gap-6 relative overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {/* Linea verticale (solo desktop) */}
          <div className="hidden md:block absolute left-[15px] top-4 bottom-[calc(100%-12rem)] w-[2px] bg-slate-200 -z-10"></div>

          {/* STEP 1 */}
          <li className="relative shrink-0">
            <button
              onClick={() => setActiveMenu(1)}
              className="flex items-center md:items-start gap-2 md:gap-4 text-left group"
            >
              <div
                className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  activeMenu === 1
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : isStep1Valid
                    ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                1
              </div>
              <div className="pt-1.5 hidden md:block">
                <div
                  className={`font-semibold transition-colors ${
                    activeMenu === 1
                      ? 'text-slate-900'
                      : 'text-slate-500 group-hover:text-slate-900'
                  }`}
                >
                  Competenza
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Dati generali</div>
              </div>
            </button>
          </li>

          {/* STEP 2 */}
          <li className="relative shrink-0 flex flex-col">
            <button
              onClick={() => setActiveMenu(2)}
              disabled={!isStep2Enabled}
              className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${
                !isStep2Enabled ? 'cursor-not-allowed opacity-60' : ''
              }`}
            >
              <div
                className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  activeMenu === 2
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : subCompetencies.length > 0
                    ? 'bg-white border-2 border-slate-300 text-slate-900 group-hover:border-slate-400'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <div className="pt-1.5 hidden md:block">
                <div
                  className={`font-semibold transition-colors ${
                    activeMenu === 2
                      ? 'text-slate-900'
                      : 'text-slate-500 group-hover:text-slate-900'
                  }`}
                >
                  Sottocompetenze
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {subCompetencies.length > 0
                    ? `${subCompetencies.length} inserit${subCompetencies.length === 1 ? 'a' : 'e'}`
                    : 'Definizione struttura'}
                </div>
              </div>
            </button>

            {/* LISTA SOTTOCOMPETENZE (Solo Desktop) */}
            {subCompetencies.length > 0 && (
              <ul className="hidden md:flex flex-col gap-1 pl-[38px] mt-4 mb-2">
                {subCompetencies.map((sub, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => {
                        setActiveMenu(2);
                        setActiveSubIndex(idx);
                      }}
                      disabled={!isStep1Valid}
                      className={`text-left text-sm w-full py-1.5 px-3 rounded-md transition-colors border-l-2 ${
                        activeSubIndex === idx && activeMenu === 2
                          ? 'border-slate-900 bg-slate-100 text-slate-900 font-bold'
                          : 'border-transparent font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate block w-full max-w-[150px]">
                        {sub.title || `Sottocompetenza ${idx + 1}`}
                      </span>
                    </button>
                  </li>
                ))}

                {/* BOTTONE + NUOVA */}
                <li className="mt-1">
                  <button
                    onClick={handleCreateNewSub}
                    disabled={!isStep1Valid}
                    className={`text-left text-sm transition-colors flex items-center gap-2 py-1.5 px-3 rounded-md border-l-2 ${
                      activeSubIndex === -1 && activeMenu === 2
                        ? 'border-slate-900 bg-slate-100 text-slate-900 font-bold'
                        : 'border-transparent font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 hover:border-slate-300'
                    }`}
                  >
                    <span>+ Aggiungi un'altra</span>
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* STEP 3 */}
          <li className="relative shrink-0">
            <button
              onClick={() => setActiveMenu(3)}
              disabled={!isStep3Enabled}
              className={`flex items-center md:items-start gap-2 md:gap-4 text-left group ${
                !isStep3Enabled ? 'cursor-not-allowed opacity-60' : ''
              }`}
            >
              <div
                className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  activeMenu === 3
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </div>
              <div className="pt-1.5 hidden md:block">
                <div
                  className={`font-semibold transition-colors ${
                    activeMenu === 3
                      ? 'text-slate-900'
                      : 'text-slate-500 group-hover:text-slate-900'
                  }`}
                >
                  Riepilogo
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Verifica e salva</div>
              </div>
            </button>
          </li>
        </ul>
      </div>

      {/* COLONNA DESTRA: AREA PRINCIPALE */}
      <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
        <DialogHeader className="p-4 md:p-8 md:pb-4 border-b border-slate-100 md:border-b-0">
          <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
            {activeMenu === 1 && 'Dati generali'}
            {activeMenu === 2 && 'Sottocompetenze'}
            {activeMenu === 3 && 'Riepilogo'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 pt-4 md:pt-0">
          {activeMenu === 1 && (
            <Step1Competency
              data={competencyData}
              onChange={setCompetencyData}
              onNext={handleCreateNewSub}
            />
          )}

          {activeMenu === 2 && (
            <SubCompetencyPanel
              key={activeSubIndex === -1 ? `new-${formResetKey}` : activeSubIndex}
              initialData={activeSubIndex === -1 ? null : subCompetencies[activeSubIndex]}
              newRubrics={newRubrics}
              setNewRubrics={setNewRubrics}
              newTools={newTools}
              setNewTools={setNewTools}
              newMethods={newMethods}
              setNewMethods={setNewMethods}
              newSkills={newSkills}
              setNewSkills={setNewSkills}
              onSave={handleSaveSubCompetency}
              onCancel={() => setActiveSubIndex(-1)}
              onGoToSummary={() => setActiveMenu(3)}
              showGoToSummary={subCompetencies.length > 0 && activeSubIndex === -1}
              onGoBack={() => setActiveMenu(1)}
            />
          )}

          {activeMenu === 3 && (
            <Step3Summary
              competencyData={competencyData}
              subCompetencies={subCompetencies}
              isLoading={isSubmitting}
              error={submitError}
              onEditStep1={() => setActiveMenu(1)}
              onEditStep2={() => setActiveMenu(2)}
              onSave={handleFinalSave}
            />
          )}
        </div>
      </div>
    </>
  );
}
