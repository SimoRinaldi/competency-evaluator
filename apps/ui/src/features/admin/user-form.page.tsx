import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createUser, getUserById, updateUser, UserRole } from "../users/users.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";

export function UserFormPage() {
  const { id } = useParams(); // Se c'è un ID, siamo in modalità modifica
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // In modalità modifica possiamo lasciarla vuota se non supportata
    role: "USER" as UserRole,
  });

  useEffect(() => {
    if (isEditing) {
      async function loadUser() {
        try {
          const user = await getUserById(id as string);
          setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "", // Di solito la password non viene restituita, la lasciamo vuota
            role: user.role || "USER",
          });
        } catch (e) {
          setError("Impossibile caricare l'utente.");
        } finally {
          setLoading(false);
        }
      }
      loadUser();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (isEditing) {
        // La patch non richiede la password di solito, a meno di implementarla nel backend
        await updateUser(id as string, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      }
      // Se va a buon fine, torna alla dashboard utenti
      navigate("/admin/users");
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/users">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Modifica Utente" : "Crea Nuovo Utente"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditing
              ? "Modifica i dettagli dell'utente selezionato."
              : "Inserisci i dati per creare un nuovo profilo utente."}
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm p-6">
        {loading ? (
          <div className="text-center py-8">Caricamento dati utente...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="es. Mario Rossi"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="es. mario.rossi@email.it"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              {!isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Scegli una password (min 6 caratteri)"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!isEditing}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="role">Ruolo nel sistema</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) =>
                    setFormData({ ...formData, role: val as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User (Standard)</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TEST_DESIGNER">Test Designer</SelectItem>
                    <SelectItem value="EVALUATOR">Evaluator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link to="/admin/users">
                <Button variant="outline" type="button">
                  Annulla
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Salvataggio..."
                  : isEditing
                  ? "Salva Modifiche"
                  : "Crea Utente"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
