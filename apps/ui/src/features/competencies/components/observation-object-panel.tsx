import { useState, useMemo } from 'react';
import { RubricPickerModal } from './rubric-picker-modal';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";

export function ObservationObjectPanel({
  obsDescription,
  setObsDescription,
  indicators,
  setIndicators,
  dbRubrics,
  newRubrics,
  setNewRubrics,
  allowCreateRubric = true,
}: any) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [indDesc, setIndDesc] = useState('');
  const [indWeight, setIndWeight] = useState('');
  const [indRubricId, setIndRubricId] = useState('');

  const [isRubricPickerOpen, setIsRubricPickerOpen] = useState(false);

  function openNewForm() {
    setEditingIndex(null);
    setIndDesc('');
    setIndWeight('');
    setIndRubricId('');
    setIsFormOpen(true);
  }

  function openEditForm(index: number) {
    const ind = indicators[index];
    setEditingIndex(index);
    setIndDesc(ind.description);
    setIndWeight(ind.weight.toString());
    setIndRubricId(ind.rubricId);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingIndex(null);
    setIndDesc('');
    setIndWeight('');
    setIndRubricId('');
  }

  function handleSaveIndicator() {
    if (!indDesc || !indWeight || !indRubricId) return;
    
    const newIndicator = {
      ...(editingIndex !== null && indicators[editingIndex]?.id
        ? { id: indicators[editingIndex].id }
        : {}),
      description: indDesc,
      weight: indWeight,
      rubricId: indRubricId,
    };

    if (editingIndex !== null) {
      const updated = [...indicators];
      updated[editingIndex] = newIndicator;
      setIndicators(updated);
    } else {
      setIndicators([...indicators, newIndicator]);
    }
    
    closeForm();
  }

  const handleCreateNewRubricFromPicker = (rubricData: any) => {
    // Aggiunge la rubrica alla lista di quelle temporanee e la rende disponibile nel picker
    setNewRubrics([...newRubrics, rubricData]);
  };

  function getSelectedRubric(idStr: string) {
    if (!idStr) return null;
    if (idStr.startsWith('db_')) {
      const id = parseInt(idStr.replace('db_', ''));
      return dbRubrics.find((r: any) => r.id === id);
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
    const sortedLevels = [...rubric.levels].sort((a: any, b: any) => a.rank - b.rank);
    return (
      <div className="flex gap-1 overflow-x-auto scrollbar-thin">
        {sortedLevels.map((l: any, i: number) => (
          <div
            key={i}
            className="flex-shrink-0 bg-muted rounded px-2 py-1 text-[10px] border border-border max-w-[120px]"
          >
            <span className="font-bold text-slate-700">{l.rank}.</span>{' '}
            <span className="text-slate-600 truncate inline-block align-bottom max-w-[90px]">
              {l.description}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "description",
      header: "Descrizione",
    },
    {
      accessorKey: "weight",
      header: () => <div className="text-center">Peso</div>,
      cell: ({ row }) => <div className="text-center">{row.getValue("weight")}</div>,
    },
    {
      id: "rubric",
      header: "Rubrica",
      cell: ({ row }) => {
        const rubric = getSelectedRubric(row.original.rubricId);
        return <RubricLevelsPreview rubric={rubric} />;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => openEditForm(row.index)}
            >
              <span className="sr-only">Modifica</span>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ], [dbRubrics, newRubrics]);

  const table = useReactTable({
    data: indicators,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
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

      <div className="border-b border-border"></div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Indicatori associati ({indicators.length})
          </h3>
          <Button onClick={openNewForm} disabled={isFormOpen}>
            <Plus className="mr-2 h-4 w-4" /> Nuovo
          </Button>
        </div>

        {isFormOpen && (
          <div className="bg-card p-5 rounded-md border border-border shadow-sm space-y-4 mb-4">
            <h4 className="font-semibold text-foreground text-base">
              {editingIndex !== null ? 'Modifica indicatore' : 'Nuovo indicatore'}
            </h4>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Descrizione <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={indDesc}
                    onChange={(e) => setIndDesc(e.target.value)}
                    placeholder="Es. Usa punteggiatura corretta"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-sm font-medium leading-none">
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Rubrica Valutazione <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 items-stretch">
                    <div
                      className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                        indRubricId
                          ? 'bg-background border-input'
                          : 'bg-muted/30 border-input text-muted-foreground'
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
                      className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground h-auto"
                    >
                      Scegli
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border mt-4">
                <Button variant="outline" onClick={closeForm}>
                  Annulla
                </Button>
                <Button 
                  onClick={handleSaveIndicator}
                  disabled={
                    !indDesc.trim() ||
                    !indWeight ||
                    parseInt(indWeight) < 1 ||
                    parseInt(indWeight) > 5 ||
                    !indRubricId
                  }
                >
                  {editingIndex !== null ? 'Salva modifiche' : 'Crea'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="px-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nessun indicatore aggiunto.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <RubricPickerModal
        isOpen={isRubricPickerOpen}
        onClose={() => setIsRubricPickerOpen(false)}
        dbRubrics={dbRubrics}
        newRubrics={newRubrics}
        onSelect={(selectedId: string) => {
          setIndRubricId(selectedId);
          setIsRubricPickerOpen(false);
        }}
        onCreateNew={handleCreateNewRubricFromPicker}
        allowCreate={allowCreateRubric}
      />
    </div>
  );
}
