import { useEffect, useState } from 'react';
import { createRubric, getRubricById, updateRubric } from './rubrics.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash } from 'lucide-react';

function getPlaceholderForLevel(rank: number, isBinary: boolean) {
  if (isBinary) {
    return rank === 1 ? 'Es: No' : 'Es: Sì';
  }
  switch (rank) {
    case 1:
      return 'Es: Inadeguato';
    case 2:
      return 'Es: Base';
    case 3:
      return 'Es: Intermedio';
    case 4:
      return 'Es: Avanzato';
    case 5:
      return 'Es: Eccellente';
    default:
      return 'Es: Ottimo';
  }
}

export function RubricFormPage({
  rubricId,
  onSuccess,
}: {
  rubricId?: string;
  onSuccess?: () => void;
}) {
  const isEditing = Boolean(rubricId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<{
    type?: string;
    yes_no: boolean;
    levels: { description: string; rank: number }[];
  }>({
    type: undefined,
    yes_no: false,
    levels: [],
  });

  useEffect(() => {
    if (isEditing && rubricId) {
      async function loadRubric() {
        try {
          const rubric = await getRubricById(rubricId);
          setFormData({
            type: rubric.yes_no ? 'yes_no' : 'standard',
            yes_no: rubric.yes_no || false,
            levels: rubric.levels ? [...rubric.levels].sort((a, b) => a.rank - b.rank) : [],
          });
        } catch (e) {
          setError('Impossibile caricare la rubrica.');
        } finally {
          setLoading(false);
        }
      }
      loadRubric();
    }
  }, [rubricId, isEditing]);

  const addLevel = () => {
    const nextRank =
      formData.levels.length > 0 ? Math.max(...formData.levels.map((l) => l.rank)) + 1 : 1;
    setFormData({
      ...formData,
      levels: [...formData.levels, { description: '', rank: nextRank }],
    });
  };

  const removeLevel = (index: number) => {
    setFormData({
      ...formData,
      levels: formData.levels.filter((_, i) => i !== index),
    });
  };

  const updateLevel = (index: number, field: 'description' | 'rank', value: string | number) => {
    const newLevels = [...formData.levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setFormData({ ...formData, levels: newLevels });
  };

  const handleYesNoChange = (isYesNo: boolean) => {
    const existing = formData.levels;
    const findOld = (rank: number) => {
      const old = existing.find((l) => l.rank === rank);
      return old ? { id: (old as any).id } : {};
    };

    if (isYesNo) {
      setFormData({
        type: 'yes_no',
        yes_no: true,
        levels: [
          { ...findOld(1), description: '', rank: 1 },
          { ...findOld(5), description: '', rank: 5 },
        ],
      });
    } else {
      setFormData({
        type: 'standard',
        yes_no: false,
        levels: [
          { ...findOld(1), description: '', rank: 1 },
          { ...findOld(2), description: '', rank: 2 },
          { ...findOld(3), description: '', rank: 3 },
          { ...findOld(4), description: '', rank: 4 },
          { ...findOld(5), description: '', rank: 5 },
        ],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.levels.length < 2) {
      setError(
        'Devi selezionare un tipo di rubrica (che genererà i relativi livelli) e compilarli.',
      );
      return;
    }

    if (formData.levels.some((l) => !l.description || !l.description.trim())) {
      setError('Devi compilare la descrizione per tutti i livelli.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (isEditing) {
        await updateRubric(rubricId as string, formData.yes_no, formData.levels);
      } else {
        await createRubric(formData.yes_no, formData.levels);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* COLONNA SINISTRA: SIDEBAR STEPS */}
      <div className="w-full md:w-72 shrink-0 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col md:block">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-8 hidden md:block">
          {isEditing ? 'Modifica Rubrica' : 'Nuova Rubrica'}
        </h2>

        <ul className="flex flex-row md:flex-col gap-2 md:gap-6 relative overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <li className="relative shrink-0">
            <button className="flex items-center md:items-start gap-2 md:gap-4 text-left group">
              <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all bg-primary text-primary-foreground shadow-md scale-110">
                1
              </div>
              <div className="pt-1.5 hidden md:block">
                <div className="font-semibold transition-colors text-slate-900">
                  Dettagli Rubrica
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Tipo e Livelli</div>
              </div>
            </button>
          </li>
        </ul>
      </div>

      {/* COLONNA DESTRA: AREA PRINCIPALE */}
      <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
        <DialogHeader className="p-4 md:p-8 md:pb-4 border-b border-slate-100 md:border-b-0">
          <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
            Impostazioni Rubrica
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 pt-4 md:pt-0">
          {loading ? (
            <div className="text-center py-8">Caricamento dati rubrica...</div>
          ) : (
            <form id="rubric-form" onSubmit={handleSubmit} className="space-y-8 max-w-2xl pb-8">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>
                    Tipo <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type || undefined}
                    onValueChange={(val) => handleYesNoChange(val === 'yes_no')}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleziona il tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (5 livelli)</SelectItem>
                      <SelectItem value="yes_no">Binaria (2 livelli)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Livelli della Rubrica</Label>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 px-3">
                    <div className="w-16 shrink-0 text-xs font-semibold text-slate-500 text-center">
                      Livello
                    </div>
                    <div className="flex-1 text-xs font-semibold text-slate-500">
                      Descrizione <span className="text-red-500">*</span>
                    </div>
                  </div>
                  {formData.levels.map((level, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-md border border-slate-100"
                    >
                      <div className="w-16 shrink-0 flex items-center justify-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-200 text-sm font-bold text-slate-600">
                          {level.rank}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder={getPlaceholderForLevel(level.rank, formData.yes_no)}
                          className="h-9 bg-white"
                          value={level.description}
                          onChange={(e) => updateLevel(index, 'description', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvataggio...' : isEditing ? 'Salva Modifiche' : 'Crea Rubrica'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
