import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Step1Competency({ data, onChange, onNext }: any) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Dati della Competenza
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Definisci il titolo della competenza, il suo peso (intero da 1 a 5) e la soglia minima di acquisizione della competenza.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Titolo */}
          <div className="space-y-2 flex-1">
            <Label>
              Titolo <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              required
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="es. Definire l'idea progettuale"
            />
          </div>

          {/* Peso */}
          <div className="space-y-2 w-full md:w-32 shrink-0">
            <Label>
              Peso (1-5) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              max="5"
              required
              value={data.weight}
              onChange={(e) => onChange({ ...data, weight: e.target.value })}
            />
          </div>

          {/* Soglia */}
          <div className="space-y-2 w-full md:w-36 shrink-0">
            <Label>
              Soglia minima <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              required
              value={data.threshold}
              onChange={(e) => onChange({ ...data, threshold: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8">
            Avanti
          </Button>
        </div>
      </form>
    </div>
  );
}
