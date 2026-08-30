import { useState } from 'react';
import { Step1Competency } from './components/step1-competency';
import { SubCompetencyPanel } from './components/sub-competency-panel';
import { Step3Summary } from './components/step3-summary';

export function CreateCompetencyPage() {
  // Menu principale: 1 = Competenza, 2 = Sottocompetenze, 3 = Riepilogo
  const [activeMenu, setActiveMenu] = useState(1);
  const [isSubmitting] = useState(false);
  const [submitError] = useState('');

  // Sottocompetenza attiva?
  // -1 = Nessuna, 0, 1, 2 = Indice dell'array
  const [activeSubIndex, setActiveSubIndex] = useState(-1);

  const [competencyData, setCompetencyData] = useState({
    title: '',
    weight: '',
    threshold: '',
  });

  const isStep1Valid =
    competencyData.title.trim() !== '' &&
    competencyData.weight !== '' &&
    competencyData.threshold !== '';

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
    // API logic will go here
    console.log('Dati pronti per il salvataggio:', {
      competencyData,
      subCompetencies,
      newRubrics,
      newTools,
      newMethods,
      newSkills,
    });
  };

  const isStep2Enabled = isStep1Valid && hasPassedStep1;
  const isStep3Enabled = subCompetencies.length > 0;

  return (
    <div className="min-h-screen bg-muted/30 flex justify-center items-start py-10 px-4">
      {/* Contenitore Principale */}
      <div className="flex w-full max-w-6xl bg-card rounded-xl shadow-xl overflow-hidden border border-border">
        {/* COLONNA SINISTRA: SIDEBAR */}
        <div className="w-72 shrink-0 p-8 border-r border-border bg-muted/30">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">
            Creazione Guidata
          </h2>

          <ul className="flex flex-col gap-6 relative">
            {/* Linea verticale che congiunge gli step */}
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-200 -z-10"></div>

            {/* STEP 1 */}
            <li className="relative">
              <button
                onClick={() => setActiveMenu(1)}
                className="flex items-start gap-4 text-left w-full group"
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeMenu === 1
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : isStep1Valid
                      ? 'bg-card border-2 border-border text-primary group-hover:border-slate-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  1
                </div>
                <div className="pt-1.5">
                  <div
                    className={`font-semibold transition-colors ${
                      activeMenu === 1
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-primary'
                    }`}
                  >
                    Competenza
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Dati generali</div>
                </div>
              </button>
            </li>

            {/* STEP 2 e Lista */}
            <li className="relative">
              <button
                onClick={() => setActiveMenu(2)}
                disabled={!isStep2Enabled}
                className={`flex items-start gap-4 text-left w-full group ${
                  !isStep2Enabled ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeMenu === 2
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : subCompetencies.length > 0
                      ? 'bg-card border-2 border-border text-primary group-hover:border-slate-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  2
                </div>
                <div className="pt-1.5">
                  <div
                    className={`font-semibold transition-colors ${
                      activeMenu === 2
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-primary'
                    }`}
                  >
                    Sottocompetenze
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {subCompetencies.length > 0
                      ? `${subCompetencies.length} inserit${
                          subCompetencies.length === 1 ? 'a' : 'e'
                        }`
                      : 'Definizione struttura'}
                  </div>
                </div>
              </button>

              {/* LISTA SOTTOCOMPETENZE */}
              {subCompetencies.length > 0 && (
                <ul className="flex flex-col gap-1 pl-[38px] mt-4 mb-2">
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
                            ? 'border-slate-900 bg-muted text-primary font-bold'
                            : 'border-transparent font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 hover:border-border'
                        }`}
                      >
                        <span className="truncate block w-full">
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
                          ? 'border-slate-900 bg-muted text-primary font-bold'
                          : 'border-transparent font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 hover:border-border'
                      }`}
                    >
                      <span>+ Aggiungi un'altra</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* STEP 3 */}
            <li className="relative">
              <button
                onClick={() => setActiveMenu(3)}
                disabled={!isStep3Enabled}
                className={`flex items-start gap-4 text-left w-full group ${
                  !isStep3Enabled ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                    activeMenu === 3
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  3
                </div>
                <div className="pt-1.5">
                  <div
                    className={`font-semibold transition-colors ${
                      activeMenu === 3
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-primary'
                    }`}
                  >
                    Riepilogo
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Verifica e salva</div>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* COLONNA DESTRA: AREA PRINCIPALE */}
        <div className="flex-1 p-10 bg-card">
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
    </div>
  );
}
