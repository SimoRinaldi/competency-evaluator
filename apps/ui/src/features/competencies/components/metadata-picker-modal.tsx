import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function MetadataPickerModal({
  isOpen,
  onClose,
  title,
  dbItems = [],
  tempItems = [],
  selectedIds = [],
  onToggleSelection,
  onCreateNew
}: any) {
  const [newItemName, setNewItemName] = useState('');

  // Uniamo gli elementi dal DB con quelli appena creati (temp_)
  const merged = [
    ...(dbItems || []),
    ...(tempItems || []).map((item: any) => ({ id: item.tempId, name: item.name }))
  ];

  // Cerchiamo case-insensitive per evitare duplicati
  const query = newItemName.toLowerCase().trim();
  const hasExactMatch = merged.some(item => item?.name?.toLowerCase() === query);

  const handleCreate = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (newItemName.trim() && !hasExactMatch) {
      onCreateNew(newItemName.trim());
      setNewItemName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {/* Creation Input */}
        <div className="flex gap-2 mt-2">
          <Input 
            placeholder="Aggiungi nuovo..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate(e)}
          />
          <Button type="button" onClick={handleCreate} disabled={!newItemName.trim() || hasExactMatch} className="bg-slate-900 text-white hover:bg-slate-800">
            + Crea
          </Button>
        </div>

        {/* List of items */}
        <div className="border border-slate-200 rounded-md mt-4 max-h-[40vh] overflow-y-auto divide-y divide-slate-100 bg-white">
          {merged.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-sm">Nessun elemento disponibile.</div>
          )}
          {merged.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <label key={item.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelection(item.id)}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
                />
                <span className={`text-sm ${isSelected ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
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
          <Button type="button" onClick={onClose} variant="outline" className="w-full">
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
