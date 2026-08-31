import { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateRubricForm } from './create-rubric-modal';

const DEFAULT_LEVELS = [
  { description: '', rank: 1 },
  { description: '', rank: 2 },
  { description: '', rank: 3 },
  { description: '', rank: 4 },
  { description: '', rank: 5 },
];

export function RubricPickerModal({
  isOpen,
  onClose,
  dbRubrics,
  newRubrics,
  onSelect,
  onCreateNew,
  allowCreate = true,
}: any) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Stato per la creazione della rubrica mantendo i valori anche chiudendo il popover (finche non si salva)
  const [draftIsBinary, setDraftIsBinary] = useState('false');
  const [draftLevels, setDraftLevels] = useState([...DEFAULT_LEVELS]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
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
      if (rubric.yes_no || rubric.levels?.length === 2) {
        if (colIndex === 1) return rubric.levels.find((l:any) => l.rank === 1) || rubric.levels[0];
        if (colIndex === 5) return rubric.levels.find((l:any) => l.rank === 5) || rubric.levels[1];
        return null;
      }
      return rubric.levels?.find((l:any) => l.rank === colIndex);
    }

    const renderLevelCell = (rubric: any, colIndex: number) => {
      const level = getLevelForColumn(rubric, colIndex);
      if (!level) return <span className="text-muted-foreground">-</span>;
      
      const colorClass = getLevelColorClassByColIndex(colIndex);
      
      return (
        <HoverCard openDelay={10} closeDelay={100}>
          <HoverCardTrigger asChild>
            <span 
              className={`inline-block max-w-[130px] truncate items-center px-2.5 py-0.5 rounded-md text-xs font-medium border cursor-default ${colorClass}`}
            >
              {level.description}
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="flex w-64 flex-col gap-0.5" side="top">
            <div className="font-semibold text-sm">Livello {colIndex}</div>
            <div className="text-sm text-slate-800 break-words mt-1">{level.description}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {rubric.yes_no ? "Scala Binaria" : "Scala Standard"}
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    };

    return [
      {
        id: "select",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <input
              type="radio"
              name="rubric-selection"
              className="h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500 border-gray-300"
              onChange={() => onSelect(row.original._id)}
            />
          </div>
        ),
      },
      {
        id: "level_1",
        header: "Livello 1",
        cell: ({ row }) => renderLevelCell(row.original, 1),
      },
      {
        id: "level_2",
        header: "Livello 2",
        cell: ({ row }) => renderLevelCell(row.original, 2),
      },
      {
        id: "level_3",
        header: "Livello 3",
        cell: ({ row }) => renderLevelCell(row.original, 3),
      },
      {
        id: "level_4",
        header: "Livello 4",
        cell: ({ row }) => renderLevelCell(row.original, 4),
      },
      {
        id: "level_5",
        header: "Livello 5",
        cell: ({ row }) => renderLevelCell(row.original, 5),
      },
      {
        accessorKey: "yes_no",
        header: "Tipo",
        cell: ({ row }) => (
          <span className="inline-flex flex-col gap-1 items-start">
            <span className="inline-flex items-center rounded-full bg-slate-50 border px-2.5 py-0.5 text-xs font-semibold text-slate-800">
              {row.original.yes_no ? "Binaria" : "Standard"}
            </span>
            {row.original._isTemp && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Nuova
              </span>
            )}
          </span>
        ),
      },
    ];
  }, [onSelect]);

  const allRubrics = useMemo(() => [
    ...(newRubrics || []).map((r: any, idx: number) => ({ ...r, _id: `temp_${idx}`, _isTemp: true })),
    ...(dbRubrics || []).map((r: any) => ({ ...r, _id: `db_${r.id}`, _isTemp: false })),
  ], [newRubrics, dbRubrics]);

  const table = useReactTable({
    data: allRubrics,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleSaveNewRubric = (rubricData: any) => {
    onCreateNew(rubricData);
    // Reset del form SOLO al salvataggio
    setDraftIsBinary('false');
    setDraftLevels([
      { description: '', rank: 1 },
      { description: '', rank: 2 },
      { description: '', rank: 3 },
      { description: '', rank: 4 },
      { description: '', rank: 5 },
    ]);
    setIsPopoverOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
        <div className="flex-1 flex flex-col overflow-hidden h-full relative">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">
              Seleziona Rubrica
            </h2>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca rubrica..."
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(String(event.target.value))}
                  className="!pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground hidden sm:block">
                  Totale: {allRubrics.length}
                </div>
                
                {allowCreate && (
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nuovo
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] p-8 max-h-[85vh] overflow-y-auto" align="end">
                      <h3 className="font-semibold text-lg mb-4">Nuova Rubrica</h3>
                      <CreateRubricForm 
                        onSave={handleSaveNewRubric} 
                        onCancel={() => setIsPopoverOpen(false)} 
                        isBinary={draftIsBinary}
                        setIsBinary={setDraftIsBinary}
                        levels={draftLevels}
                        setLevels={setDraftLevels}
                      />
                    </PopoverContent>
                  </Popover>
                )}

              </div>
            </div>

            <div className="flex-1 rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-y-auto flex-1">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
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
                          className="hover:bg-slate-50/50 cursor-pointer"
                          onClick={() => onSelect(row.original._id)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="px-4 py-2 align-middle">
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
                          className="h-24 text-center"
                        >
                          Nessuna rubrica trovata per la ricerca.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
