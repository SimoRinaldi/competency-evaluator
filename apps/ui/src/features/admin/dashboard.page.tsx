import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompetencies } from "../competencies/competencies.api";
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
import { Pencil, Plus, Search, BookX, ArrowUpRight } from "lucide-react";

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
    header: "Peso",
  },
  {
    accessorKey: "threshold",
    header: "Soglia",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const comp = row.original;
      return (
        <div className="flex justify-end">
          <Link to={`/competencies/edit/${comp.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Modifica</span>
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];

export function AdminDashboardPage() {
  const [data, setData] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getCompetencies();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
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
            <Link to="/competencies/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Crea Competenza
              </Button>
            </Link>
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
      title="Gestione Competenze" 
      description="Gestisci le competenze del sistema."
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="!pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-muted-foreground hidden sm:block">
            Totale: {data.length}
          </div>
          <Link to="/competencies/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Crea Competenza
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm p-4 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id} className="py-3">
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
    </PageContainer>
  );
}
