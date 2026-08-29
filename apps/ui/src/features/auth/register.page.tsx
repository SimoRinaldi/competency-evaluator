import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, UserRole } from './auth.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Crea un Account</CardTitle>
          <CardDescription>
            Inserisci i tuoi dati per registrarti alla piattaforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <div className="text-sm font-medium text-destructive">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Mario Rossi"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@esempio.it"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Ruolo</Label>
              <Select 
                value={role} 
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleziona un ruolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Utente</SelectItem>
                  <SelectItem value="ADMIN">Amministratore</SelectItem>
                  <SelectItem value="TEST_DESIGNER">Test designer</SelectItem>
                  <SelectItem value="EVALUATOR">Valutatore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Registrazione in corso...' : 'Registrati'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Hai già un account?{' '}
            <Link to="/login" className="underline">
              Accedi qui
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
