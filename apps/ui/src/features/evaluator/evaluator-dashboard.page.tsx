import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvaluatorProfile, Test } from "./evaluator.api";
import { fetchCurrentUser } from "../auth/auth.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, ArrowRight } from "lucide-react";

export function EvaluatorDashboardPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTests() {
      try {
        const user = await fetchCurrentUser();
        const profile = await getEvaluatorProfile(user.id);
        setTests(profile.tests || []);
      } catch (err: any) {
        setError(err.message || "Impossibile caricare i test.");
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Valutatore</h1>
        <p className="text-muted-foreground mt-2">
          Qui trovi i test che ti sono stati assegnati per la valutazione.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Caricamento in corso...</div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          {error}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground">Nessun test assegnato al momento.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Test #{test.id}</CardTitle>
                </div>
                <CardDescription className="line-clamp-3">
                  {test.assessment_situation}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <Link to={`/evaluator/tests/${test.id}`}>
                  <Button className="w-full" variant="outline">
                    Apri Valutazioni <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
