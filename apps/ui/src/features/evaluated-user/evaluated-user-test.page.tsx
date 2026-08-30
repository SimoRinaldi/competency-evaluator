import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchCurrentUser } from "../auth/auth.api";
import { getTestDetails, submitTestExecution } from "./evaluated-user.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, Trash2, Send } from "lucide-react";

export function EvaluatedUserTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  // Stato per i file fittizi che l'utente "carica"
  const [outputs, setOutputs] = useState([
    { name: "", description: "", url: "", version: "1.0" }
  ]);

  useEffect(() => {
    async function loadTest() {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        
        const testData = await getTestDetails(id as string);
        setTest(testData);
      } catch (err: any) {
        setError(err.message || "Errore nel caricamento del test.");
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [id]);

  const handleAddOutput = () => {
    setOutputs([...outputs, { name: "", description: "", url: "", version: "1.0" }]);
  };

  const handleRemoveOutput = (index: number) => {
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const handleChangeOutput = (index: number, field: string, value: string) => {
    const newOutputs = [...outputs];
    newOutputs[index] = { ...newOutputs[index], [field]: value };
    setOutputs(newOutputs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !test) return;
    
    // Validazione base
    const hasEmptyFields = outputs.some(o => !o.name.trim() || !o.url.trim());
    if (hasEmptyFields) {
      setError("Compila tutti i campi obbligatori (Nome e URL) per ogni file.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await submitTestExecution(test.id, user.id, outputs);
      navigate("/evaluated-user");
    } catch (err: any) {
      setError(err.message || "Errore durante l'invio dell'esecuzione.");
      setSaving(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link to="/evaluated-user">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Svolgimento Test #{id}</h1>
          <p className="text-muted-foreground mt-2">
            Leggi attentamente la consegna e carica i tuoi elaborati.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Caricamento del test...</div>
      ) : error && !saving ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle>Situation Assessment (Consegna)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-wrap text-lg">
                {test?.assessment_situation}
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">I Tuoi File (Output)</h2>
              <Button type="button" variant="outline" onClick={handleAddOutput}>
                <Plus className="mr-2 h-4 w-4" /> Aggiungi File
              </Button>
            </div>

            {error && saving === false && (
              <div className="text-sm text-destructive font-medium">{error}</div>
            )}

            {outputs.map((out, index) => (
              <Card key={index} className="relative overflow-visible">
                {outputs.length > 1 && (
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon" 
                    className="absolute -top-3 -right-3 rounded-full h-8 w-8"
                    onClick={() => handleRemoveOutput(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome del file <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="Es. consegna_finale.pdf" 
                        value={out.name}
                        onChange={(e) => handleChangeOutput(index, "name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Versione</Label>
                      <Input 
                        placeholder="Es. 1.0" 
                        value={out.version}
                        onChange={(e) => handleChangeOutput(index, "version", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>URL (Link di caricamento simulato) <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="https://mio-storage.com/file..." 
                        value={out.url}
                        onChange={(e) => handleChangeOutput(index, "url", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Descrizione (opzionale)</Label>
                      <Input 
                        placeholder="Breve descrizione del contenuto" 
                        value={out.description}
                        onChange={(e) => handleChangeOutput(index, "description", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? "Invio in corso..." : (
                  <>
                    <Send className="mr-2 h-5 w-5" /> Invia Valutazione
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
