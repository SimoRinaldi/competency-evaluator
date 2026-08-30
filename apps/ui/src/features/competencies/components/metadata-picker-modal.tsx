import { useState } from 'react';

export function MetadataPickerModal({
  isOpen,
  onClose,
  title,
  dbItems = [],
  tempItems = [],
  selectedIds = [],
  onToggleSelection,
  onCreateNew,
}: any) {
  const [newItemName, setNewItemName] = useState('');

  if (!isOpen) return null;

  // Uniamo gli elementi dal DB con quelli appena creati (temp_)
  const merged = [
    ...(dbItems || []),
    ...(tempItems || []).map((item: any) => ({ id: item.tempId, name: item.name })),
  ];

  // Cerchiamo case-insensitive per evitare duplicati
  const query = newItemName.toLowerCase().trim();
  const hasExactMatch = merged.some((item) => item?.name?.toLowerCase() === query);

  const handleCreate = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (newItemName.trim() && !hasExactMatch) {
      onCreateNew(newItemName.trim());
      setNewItemName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
        </div>

        {/* Creation Input */}
        <div className="flex gap-2 mt-2">
          <input
            placeholder="Aggiungi nuovo..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate(e)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newItemName.trim() || hasExactMatch}
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            + Crea
          </button>
        </div>

        {/* List of items */}
        <div className="border border-border rounded-md mt-4 max-h-[40vh] overflow-y-auto divide-y divide-slate-100 bg-card">
          {merged.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Nessun elemento disponibile.
            </div>
          )}
          {merged.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelection(item.id)}
                  className="w-4 h-4 text-foreground border-border rounded focus:ring-slate-900 cursor-pointer"
                />
                <span
                  className={`text-sm ${
                    isSelected ? 'font-bold text-foreground' : 'font-medium text-slate-700'
                  }`}
                >
                  {item.name}
                </span>
                {String(item.id).startsWith('temp_') && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Nuovo
                  </span>
                )}
              </label>
            );
          })}
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
