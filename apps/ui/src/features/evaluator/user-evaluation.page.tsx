import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Save } from "lucide-react";

export function UserEvaluationPage() {
  const { id, executionId } = useParams();

  // MOCK: in un'implementazione reale, qui faremo fetch per recuperare 
  // le esecuzioni, i file caricati dall'utente e gli indicatori da valutare.
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/evaluator/tests/${id}`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valutazione Utente</h1>
          <p className="text-muted-foreground mt-2">
            Scarica i file dell'utente e compila la rubrica di valutazione.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Caricamento in corso...</div>
      ) : (
        <div className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>File dell'Utente</CardTitle>
              <CardDescription>
                Scarica i documenti caricati dall'utente per questa prova.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Qui inseriremo l'elenco dei TestOutput / File caricati */}
              <div className="flex items-center justify-between p-3 border rounded-md">
                <span className="text-sm font-medium">consegna_finale.pdf</span>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Scarica
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rubrica di Valutazione</CardTitle>
              <CardDescription>
                Assegna un livello di padronanza per ciascun indicatore previsto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Qui in futuro integreremo il caricamento delle sottocompetenze e dei livelli */}
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                L'interfaccia di compilazione dei livelli sarà implementata qui, con il salvataggio dei RubricLevelAssignment.
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Link to={`/evaluator/tests/${id}`}>
              <Button variant="outline">Annulla</Button>
            </Link>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Salva Valutazione
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
