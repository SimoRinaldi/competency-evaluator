import { useEffect, useState } from "react";
import { fetchRubrics, deleteRubric, createRubric } from "../competencies/competencies.api";
import { PageContainer } from "../../components/page-container";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search, RefreshCw, TableProperties, ArrowUpRight, Trash } from "lucide-react";
import { RubricFormPage } from "./rubric-form.page";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreateRubricForm } from "../competencies/components/create-rubric-modal";

export type Rubric = {
  id: number;
  yes_no: boolean;
  levels: { id?: number; description: string; rank: number }[];
};

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

function getLevelForColumn(rubric: Rubric, colIndex: number) {
  if (rubric.yes_no || rubric.levels?.length === 2) {
    if (colIndex === 1) return rubric.levels.find(l => l.rank === 1) || rubric.levels[0];
    if (colIndex === 5) return rubric.levels.find(l => l.rank === 5) || rubric.levels[1];
    return null;
  }
  return rubric.levels?.find(l => l.rank === colIndex);
}

const renderLevelCell = (rubric: Rubric, colIndex: number) => {
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

const columns: ColumnDef<Rubric>[] = [
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
      <span className="inline-flex items-center rounded-full bg-slate-50 border px-2.5 py-0.5 text-xs font-semibold text-slate-800">
        {row.original.yes_no ? "Binaria" : "Standard"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rubric = row.original;
      return (
        <div className="flex justify-end gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Modifica</span>
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
              <RubricFormPage rubricId={rubric.id.toString()} />
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

export function RubricsDashboardPage() {
  const [data, setData] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [draftIsBinary, setDraftIsBinary] = useState('false');
  const [draftLevels, setDraftLevels] = useState([
    { description: '', rank: 1 },
    { description: '', rank: 2 },
    { description: '', rank: 3 },
    { description: '', rank: 4 },
    { description: '', rank: 5 },
  ]);

  const handleSaveNewRubric = async (rubricData: any) => {
    try {
      await createRubric(rubricData.yesNo, rubricData.levels);
      const result = await fetchRubrics();
      setData(result);
      setDraftIsBinary('false');
      setDraftLevels([
        { description: '', rank: 1 },
        { description: '', rank: 2 },
        { description: '', rank: 3 },
        { description: '', rank: 4 },
        { description: '', rank: 5 },
      ]);
      setIsPopoverOpen(false);
    } catch (e) {
      console.error(e);
      alert("Errore durante la creazione della rubrica");
    }
  };

  async function loadData() {
      setLoading(true);
      try {
        const result = await fetchRubrics();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    loadData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (!loading && data.length === 0) {
    return (
      <PageContainer 
        title="Gestione Rubriche" 
        description="Visualizza, crea e modifica le rubriche per le valutazioni."
      >
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TableProperties />
            </EmptyMedia>
            <EmptyTitle>Nessuna rubrica trovata</EmptyTitle>
            <EmptyDescription>
              Non hai ancora creato nessuna rubrica nel sistema.
              Inizia creando un set di rubriche per le valutazioni (Standard o Binarie).
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nuovo
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-8 max-h-[85vh] overflow-y-auto" align="center">
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
          </EmptyContent>
          <Button variant="link" className="text-muted-foreground" size="sm" asChild>
            <a href="#">
              Scopri di più <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Gestione Rubriche" 
      description="Visualizza, crea e modifica le rubriche per le valutazioni."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca rubrica..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="!pl-10 bg-white"
          />
        </div>
        <Button variant="outline" size="icon" onClick={loadData} disabled={loading} className="shrink-0 bg-white" title="Aggiorna tabella">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
        <div className="flex items-center gap-4">
          
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
        </div>
      </div>

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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Caricamento in corso...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-1.5">
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
      <div className="flex items-center justify-between py-4 px-1">
        <div className="text-sm font-medium text-slate-500">
          {data.length} elementi
        </div>
      </div>
    </PageContainer>
  );
}
