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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2, Pencil } from "lucide-react";

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

  function handleDeleteIndicator() {
    if (editingIndex === null) return;
    const updated = indicators.filter((_, idx) => idx !== editingIndex);
    setIndicators(updated);
    closeForm();
  }

  const handleCreateNewRubricFromPicker = (rubricData: any) => {
    // Aggiunge la rubrica alla lista di quelle temporanee e la rende disponibile nel picker
    setNewRubrics([...newRubrics, rubricData]);
  };

  function getSelectedRubric(idStr: any) {
    if (!idStr) return null;
    if (typeof idStr === 'number') {
      return dbRubrics?.find((r: any) => r.id === idStr);
    }
    const str = String(idStr);
    if (str.startsWith('db_')) {
      const id = parseInt(str.replace('db_', ''), 10);
      return dbRubrics?.find((r: any) => r.id === id);
    }
    if (str.startsWith('temp_')) {
      const id = parseInt(str.replace('temp_', ''), 10);
      return newRubrics?.[id];
    }
    return null;
  }

  function getLevelColorClassByColIndex(colIndex: number) {
    switch (colIndex) {
      case 1: return "bg-red-100 text-slate-700 border-red-200";
      case 2: return "bg-orange-100 text-slate-700 border-orange-200";
      case 3: return "bg-slate-100 text-slate-700 border-slate-200";
      case 4: return "bg-lime-100 text-slate-700 border-lime-200";
      case 5: return "bg-green-100 text-slate-700 border-green-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  }

  function getLevelForColumn(rubric: any, colIndex: number) {
    if (!rubric || !rubric.levels) return null;
    if (rubric.yes_no || rubric.levels.length === 2) {
      if (colIndex === 1) return rubric.levels.find((l: any) => l.rank === 1) || rubric.levels[0];
      if (colIndex === 5) return rubric.levels.find((l: any) => l.rank === 5) || rubric.levels[1];
      return null;
    }
    return rubric.levels.find((l: any) => l.rank === colIndex);
  }

  const RubricLevelsPreview = ({ rubric }: { rubric: any }) => {
    if (!rubric || !rubric.levels || rubric.levels.length === 0)
      return <span className="text-muted-foreground italic text-xs">Nessuna rubrica</span>;

    const isBinary = rubric.yes_no || rubric.levels.length === 2;
    const colIndices = isBinary ? [1, 5] : [1, 2, 3, 4, 5];

    return (
      <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto py-0.5">
        {colIndices.map((colIdx) => {
          const level = getLevelForColumn(rubric, colIdx);
          if (!level) return null;
          const colorClass = getLevelColorClassByColIndex(colIdx);
          return (
            <HoverCard key={colIdx} openDelay={10} closeDelay={100}>
              <HoverCardTrigger asChild>
                <span
                  className={`inline-block max-w-[90px] sm:max-w-[110px] truncate px-2 py-0.5 rounded text-[11px] font-medium border cursor-default select-none shrink-0 ${colorClass}`}
                >
                  {level.description || `Livello ${colIdx}`}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="flex w-64 flex-col gap-0.5 z-50 bg-white shadow-md border p-3 rounded-lg" side="top">
                <div className="font-semibold text-xs text-slate-900">Livello {colIdx}</div>
                <div className="text-xs text-slate-700 break-words mt-1">{level.description}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {rubric.yes_no ? "Scala Binaria" : "Scala Standard"}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
        {isBinary && (
          <span className="text-[10px] text-slate-500 font-medium ml-1 shrink-0">
            (Binaria)
          </span>
        )}
      </div>
    );
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "description",
      header: "Descrizione",
      cell: ({ row }) => (
        <span className="block truncate font-normal text-slate-900 max-w-[180px] sm:max-w-xs">
          {row.getValue("description")}
        </span>
      ),
    },
    {
      accessorKey: "weight",
      header: () => <div className="text-center">Peso</div>,
      cell: ({ row }) => (
        <div className="text-center font-normal text-slate-700">
          {row.getValue("weight")}
        </div>
      ),
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
      header: () => <div className="text-right">Azioni</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer"
                  onClick={() => openEditForm(row.index)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Modifica indicatore</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
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
          <Button type="button" onClick={openNewForm} disabled={isFormOpen}>
            <Plus className="mr-2 h-4 w-4" /> Nuovo
          </Button>
        </div>

        {isFormOpen && (
          <div className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
            <h4 className="font-semibold text-sm text-slate-700">
              {editingIndex !== null ? 'Modifica Indicatore' : 'Nuovo Indicatore'}
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Descrizione <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={indDesc}
                  onChange={(e) => setIndDesc(e.target.value)}
                  placeholder="Es. Capacità di sintesi"
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 mt-1"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">Peso (1-5) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={indWeight}
                    onChange={(e) => setIndWeight(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Rubrica Associata <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white"
                      onClick={() => setIsRubricPickerOpen(true)}
                    >
                      {indRubricId ? (
                        <span className="truncate">
                          {getSelectedRubric(indRubricId)?.title || "Rubrica selezionata"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Seleziona una rubrica...</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {indRubricId && (
                <div className="mt-2 p-3 bg-white border rounded-lg">
                  <div className="text-xs font-medium text-slate-500 mb-1.5">Anteprima livelli rubrica:</div>
                  <RubricLevelsPreview rubric={getSelectedRubric(indRubricId)} />
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                {editingIndex !== null ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteIndicator(editingIndex)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Elimina
                  </Button>
                ) : <div />}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Annulla
                  </Button>
                  <Button 
                    type="button"
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
          </div>
        )}

        <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="px-4 font-semibold text-slate-900">
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
                      <TableCell key={cell.id} className="px-4 py-1.5 align-middle">
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
                    className="h-24 text-center text-muted-foreground font-normal"
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
