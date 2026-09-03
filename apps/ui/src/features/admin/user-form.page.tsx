import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createUser, getUserById, updateUser, UserRole } from '../users/users.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function UserFormPage({ userId, onSuccess }: { userId?: string; onSuccess?: () => void }) {
  const { id: paramId } = useParams();
  const id = userId || paramId;
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as UserRole,
  });

  useEffect(() => {
    if (isEditing) {
      async function loadUser() {
        try {
          const user = await getUserById(id as string);
          setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: user.role || 'USER',
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
    setError('');

    try {
      if (isEditing) {
        await updateUser(id as string, {
          name: formData.name,
          email: formData.email,
        });
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* COLONNA SINISTRA: SIDEBAR STEPS */}
      <div className="w-full md:w-72 shrink-0 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col md:block">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-8 hidden md:block">
          {isEditing ? 'Modifica Utente' : 'Nuovo Utente'}
        </h2>

        <ul className="flex flex-row md:flex-col gap-2 md:gap-6 relative overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {/* STEP 1 */}
          <li className="relative shrink-0">
            <button className="flex items-center md:items-start gap-2 md:gap-4 text-left group">
              <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all bg-primary text-primary-foreground shadow-md scale-110">
                1
              </div>
              <div className="pt-1.5 hidden md:block">
                <div className="font-semibold transition-colors text-slate-900">Dati Utente</div>
                <div className="text-xs text-slate-400 mt-0.5">Informazioni generali</div>
              </div>
            </button>
          </li>
        </ul>
      </div>

      {/* COLONNA DESTRA: AREA PRINCIPALE */}
      <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
        <DialogHeader className="p-4 md:p-8 md:pb-4 border-b border-slate-100 md:border-b-0">
          <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">
            Dati Utente
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 pt-4 md:pt-0">
          {loading ? (
            <div className="text-center py-8">Caricamento dati utente...</div>
          ) : (
            <form id="user-form" onSubmit={handleSubmit} className="space-y-6 max-w-xl">
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!isEditing}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="role">Ruolo</Label>
                  <Select
                    value={formData.role || undefined}
                    disabled={isEditing}
                    onValueChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleziona un ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">UTENTE</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="TEST_DESIGNER">TEST DESIGNER</SelectItem>
                      <SelectItem value="EVALUATOR">VALUTATORE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvataggio...' : isEditing ? 'Salva Modifiche' : 'Crea Utente'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
