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
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Titolo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="es. Definire l'idea progettuale"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Peso */}
          <div className="space-y-2 w-full md:w-32 shrink-0">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Peso (1-5) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="5"
              required
              value={data.weight}
              onChange={(e) => onChange({ ...data, weight: e.target.value })}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Soglia */}
          <div className="space-y-2 w-full md:w-36 shrink-0">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Soglia minima <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={data.threshold}
              onChange={(e) => onChange({ ...data, threshold: e.target.value })}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-8 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            Avanti
          </button>
        </div>
      </form>
    </div>
  );
}
