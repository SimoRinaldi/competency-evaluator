import * as React from "react"
import { toast } from "sonner"
import { useAuth } from "../features/auth/auth-context"
import { updateProfile } from "../features/auth/auth.api"
import { Button } from "./ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { Save, Eye, EyeOff, TriangleAlert } from "lucide-react"

export function UserProfileDrawer({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void
}) {
  const { user, refreshUser } = useAuth()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")

  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (user && open) {
      setName(user.name)
      setEmail(user.email)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPassword(false)
    }
  }, [user, open])

  if (!user) return null

  async function handleSave() {
    try {
      if (!name || name.trim() === "") {
        setErrorMessage("Il nome non può essere vuoto.");
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMessage("Inserisci un indirizzo email valido.");
        return;
      }

      if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword) {
          setErrorMessage("Inserisci la vecchia password per poterne impostare una nuova.");
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMessage("Le nuove password non coincidono.");
          return;
        }
        if (newPassword.length < 8) {
          setErrorMessage("La nuova password deve contenere almeno 8 caratteri.");
          return;
        }
        if (!/[A-Z]/.test(newPassword)) {
          setErrorMessage("La nuova password deve contenere almeno una lettera maiuscola.");
          return;
        }
        if (!/[?^!#@]/.test(newPassword)) {
          setErrorMessage("La nuova password deve contenere almeno un simbolo speciale tra ? ^ ! # @");
          return;
        }
        
        await updateProfile(name, email, oldPassword, newPassword);
      } else {
        await updateProfile(name, email);
      }

      await refreshUser();
      onOpenChange(false);
      toast.success("Profilo aggiornato", {
        description: "Le modifiche sono state salvate con successo.",
      })
    } catch (e: any) {
      setErrorMessage(e.message || "Si è verificato un errore durante l'aggiornamento.");
    }
  }

  return (
    <>
      <Drawer
        open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="h-full right-0 mt-0 w-full sm:max-w-sm rounded-none border-l bg-background">
        <DrawerHeader>
          <DrawerTitle>Modifica Profilo</DrawerTitle>
          <DrawerDescription>
            Aggiorna le informazioni del tuo account.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold leading-none">Informazioni di Base</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Aggiorna le informazioni pubbliche del tuo profilo.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il tuo nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Indirizzo Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="La tua email"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold leading-none">Sicurezza dell'Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Imposta una nuova password per accedere. Lascia vuoto se non vuoi modificarla.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Vecchia Password</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Inserisci password attuale"
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nuova Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Inserisci nuova password"
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Conferma nuova password"
                  className="pr-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold leading-none">Permessi e Ruolo</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Il tuo attuale livello di accesso. Contatta l'amministratore per modificarlo.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Ruolo Assegnato</Label>
              <Input
                id="role"
                value={user.role}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-row justify-end gap-2 border-t p-4 mt-auto">
          <DrawerClose asChild>
            <Button variant="outline">Annulla</Button>
          </DrawerClose>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Salva
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <AlertDialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            Errore di Salvataggio
          </AlertDialogTitle>
          <AlertDialogDescription>
            {errorMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setErrorMessage(null)}>Ho capito</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  )
}
