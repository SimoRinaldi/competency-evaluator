import { useEffect, useState } from "react";
import { getUsers, User } from "../users/users.api";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search, RefreshCw, UserX, ArrowUpRight } from "lucide-react";
import { UserFormPage } from "./user-form.page";

const roleMap: Record<string, string> = {
  ADMIN: "ADMIN",
  EVALUATOR: "VALUTATORE",
  TEST_DESIGNER: "TEST DESIGNER",
  USER: "UTENTE"
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Ruolo",
    cell: ({ row }) => {
      const role = row.original.role;
      return <span>{roleMap[role] || role}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Modifica</span>
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
              <UserFormPage userId={user.id.toString()} />
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

export function UsersDashboardPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  async function loadData() {
      setLoading(true);
      try {
        const result = await getUsers();
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
        title="Gestione Utenti" 
        description="Visualizza, crea e modifica gli utenti di sistema."
      >
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserX />
            </EmptyMedia>
            <EmptyTitle>Nessun utente trovato</EmptyTitle>
            <EmptyDescription>
              Non hai ancora creato nessun utente nel sistema.
              Inizia aggiungendo il primo utente (studente o valutatore).
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nuovo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
                <UserFormPage />
              </DialogContent>
            </Dialog>
            <Button variant="outline">Importa</Button>
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
      title="Gestione Utenti" 
      description="Visualizza, crea e modifica gli utenti di sistema."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email..."
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nuovo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] xl:max-w-[1400px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-2xl gap-0">
              <UserFormPage />
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
                  Nessun utente trovato per la ricerca.
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
