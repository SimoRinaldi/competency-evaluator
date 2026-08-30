import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from './auth.api';
import { useAuth } from './auth-context';
import { useFeedback } from '../../providers/feedback-provider';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('USER');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showError, showSuccess } = useFeedback();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(name, email, password, role);
      showSuccess("Registrazione completata", "Ora puoi effettuare l'accesso.");
      navigate('/login');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message, "Errore di Registrazione");
      } else {
        showError('Errore durante la registrazione', "Errore di Registrazione");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Crea un Account</CardTitle>
            <CardDescription>
              Inserisci i tuoi dati per registrarti alla piattaforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                
                <Field>
                  <FieldLabel htmlFor="name">Nome</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Mario Rossi"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mario@esempio.it"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </Field>
                
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">Mostra password</span>
                    </Button>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="role">Ruolo</FieldLabel>
                  <Select
                    value={role}
                    onValueChange={(val) => setRole(val as UserRole)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Seleziona un ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Utente</SelectItem>
                      <SelectItem value="ADMIN">Amministratore</SelectItem>
                      <SelectItem value="TEST_DESIGNER">Test designer</SelectItem>
                      <SelectItem value="EVALUATOR">Valutatore</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                
                <Field className="flex flex-col gap-2 mt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Registrazione in corso...' : 'Registrati'}
                  </Button>
                  <FieldDescription className="text-center">
                    Hai già un account? <Link to="/login" className="underline underline-offset-4 hover:text-primary">Accedi qui</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
