import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompetency } from './competencies.api';
import styles from '../css/shared.module.css';
import { Step1Competency } from './components/step1-competency';
import { Step2SubCompetencies } from './components/step2-subcompetencies';
import { Step3Indicators } from './components/step3-indicators';

export function CreateCompetencyPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [competencyData, setCompetencyData] = useState({
    title: '',
    weight: '',
    threshold: '',
  });

  const [subCompetencies, setSubCompetencies] = useState<any[]>([]);

  const [indicators, setIndicators] = useState<any>([]);

  const [newRubrics, setNewRubrics] = useState<any>([]);

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardLarge}`}>
        <h2 className={styles.title}>Creazione Competenza</h2>

        {/* Indicatore visivo dello step */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#6b7280',
          }}
        >
          Step {step} di 4
        </div>

        {/* LOGICA DEGLI STEP */}
        {step === 1 && (
          <Step1Competency
            data={competencyData}
            onChange={setCompetencyData}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2SubCompetencies
            list={subCompetencies}
            onAdd={(newSub) => setSubCompetencies([...subCompetencies, newSub])}
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3Indicators
            subCompetencies={subCompetencies}
            indicators={indicators}
            onAdd={(newIndicator: any) =>
              setIndicators([...indicators, newIndicator])
            }
            newRubrics={newRubrics}
            onAddRubric={(newRubric: any) =>
              setNewRubrics([...newRubrics, newRubric])
            }
            onNext={() => setStep(4)}
            onPrev={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}

/*async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createCompetency(title, Number(weight), Number(threshold));
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  }
}*/
