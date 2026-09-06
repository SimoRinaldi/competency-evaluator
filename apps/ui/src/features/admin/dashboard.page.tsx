import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompetencies, checkCompetencyAssociations, deleteCompetency } from "../competencies/competencies.api";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateCompetencyPage } from "../competencies/create-competency.page";
import { EditCompetencyPage } from "../competencies/edit-competency.page";
import { Edit, Trash2, Plus, Search, RefreshCw, BookX, ArrowUpRight, TriangleAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Competency = {
  id: number;
  title: string;
  weight: number;
  threshold: number;
};

const columns: ColumnDef<Competency>[] = [
  {
    accessorKey: "title",
    header: "Titolo",
  },
  {
    accessorKey: "weight",
    header: () => <div className="text-center">Peso</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("weight")}</div>,
  },
  {
    accessorKey: "threshold",
    header: () => <div className="text-center">Soglia</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("threshold")}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Azioni</div>,
    cell: ({ row, table }) => {
      const comp = row.original;
      const refreshData = (table.options.meta as any)?.refreshData;
      return <CompetencyRowActions comp={comp} refreshData={refreshData} />;
    },
  },
];

function CompetencyRowActions({ comp, refreshData }: { comp: Competency, refreshData?: () => void }) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { isAssociated } = await checkCompetencyAssociations(comp.id);
      if (isAssociated) {
        toast.error("Impossibile modificare: la competenza è associata ad uno o più test");
        return;
      }
      setOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Errore durante la verifica della competenza");
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { isAssociated } = await checkCompetencyAssociations(comp.id);
      if (isAssociated) {
        toast.error("Impossibile eliminare: la competenza è associata ad uno o più test");
        return;
      }
      setDeleteOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Errore durante la verifica della competenza");
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteCompetency(comp.id);
      toast.success("Competenza eliminata con successo");
      setDeleteOpen(false);
      if (refreshData) refreshData();
    } catch (e: any) {
      toast.error(e.message || "Errore durante l'eliminazione della competenza");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-500 hover:text-sky-600 cursor-pointer"
          title="Modifica"
          onClick={handleEditClick}
        >
          <span className="sr-only">Modifica</span>
          <Edit className="h-4 w-4" />
        </Button>
        <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
          <EditCompetencyPage 
            competencyId={comp.id.toString()} 
            onSuccess={() => {
              setOpen(false);
              if (refreshData) refreshData();
            }} 
          />
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
        onClick={handleDeleteClick}
        disabled={isDeleting}
      >
        <span className="sr-only">Elimina</span>
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={deleteOpen} onOpenChange={(openVal) => !openVal && setDeleteOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              Conferma Eliminazione
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 space-y-2 mt-2">
              <p>Sei sicuro di voler eliminare questa competenza compresa di tutte le sue sottocompetenze?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                await handleDeleteConfirm();
              }}
              className="flex items-center gap-2"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Elimina competenza
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AdminDashboardPage() {
  const [data, setData] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  async function loadData() {
      setLoading(true);
      try {
        const result = await getCompetencies();
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
    meta: {
      refreshData: () => loadData(),
    }
  });

  if (!loading && data.length === 0) {
    return (
      <PageContainer 
        title="Gestione Competenze" 
        description="Gestisci le competenze del sistema."
      >
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookX />
            </EmptyMedia>
            <EmptyTitle>Nessuna competenza</EmptyTitle>
            <EmptyDescription>
              Non hai ancora creato nessuna competenza nel sistema.
              Inizia creandone una per popolare il database.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nuovo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
                <CreateCompetencyPage onSuccess={() => { setIsCreateOpen(false); loadData(); }} />
              </DialogContent>
            </Dialog>
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Gestione Competenze" 
      description="Gestisci le competenze del sistema."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo..."
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
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nuovo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
              <CreateCompetencyPage onSuccess={() => { setIsCreateOpen(false); loadData(); }} />
            </DialogContent>
          </Dialog>
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
                  Nessuna competenza trovata per la ricerca.
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
