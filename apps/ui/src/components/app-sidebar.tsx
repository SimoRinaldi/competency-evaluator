import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { UserProfileDrawer } from './user-profile-drawer';
import {
  Home,
  Layers,
  PencilRuler,
  ClipboardSignature,
  FileEdit,
  LineChart,
  Users,
  LogOut,
  ChevronsUpDown,
  GalleryVerticalEnd,
  TableProperties,
  FileSearch,
  Target,
  ClipboardCheck,
  Hourglass,
  Award,
  UserCircle,
} from 'lucide-react';

const navGroups = [
  {
    title: 'Amministrazione',
    items: [
      { title: 'Gestione competenze', url: '/competencies', roles: ['ADMIN'], icon: Layers },
      { title: 'Gestione rubriche', url: '/rubrics', roles: ['ADMIN'], icon: TableProperties },
      { title: 'Gestione utenti', url: '/users', roles: ['ADMIN'], icon: Users },
      { title: 'Visualizzazione test', url: '/tests-overview', roles: ['ADMIN'], icon: FileSearch },
    ],
  },
  {
    title: 'Progettazione',
    items: [
      {
        title: 'Gestione test',
        url: '/tests-management',
        roles: ['TEST_DESIGNER'],
        icon: PencilRuler,
      },
      {
        title: 'Oggetto di osservazione e indicatori',
        url: '/indicators-management',
        roles: ['TEST_DESIGNER'],
        icon: Target,
      },
    ],
  },
  {
    title: 'Valutazione',
    items: [
      {
        title: 'Test da valutare',
        url: '/evaluations/pending',
        roles: ['EVALUATOR'],
        icon: ClipboardSignature,
      },
      {
        title: 'Test valutati',
        url: '/evaluations/completed',
        roles: ['EVALUATOR'],
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: 'I Miei Test',
    items: [
      { title: 'Test da fare', url: '/my-tests/todo', roles: ['USER'], icon: FileEdit },
      { title: 'Test valutati', url: '/my-tests/completed', roles: ['USER'], icon: Award },
      { title: 'Storico punteggi', url: '/my-tests/history', roles: ['USER'], icon: LineChart },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isMobile, toggleSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  if (!user) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={toggleSidebar}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Valutazione</span>
                  <span className="truncate text-xs">Competenze</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger className="ml-1 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => {
          const groupItems = group.items.filter((item) => item.roles.includes(user.role));
          if (groupItems.length === 0) return null;

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          location.pathname === item.url ||
                          (item.url !== '/' && location.pathname.startsWith(item.url + '/'))
                        }
                        tooltip={item.title}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setProfileOpen(true)}>
                  <UserCircle className="mr-2 size-4" />
                  Modifica Profilo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setLogoutOpen(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100"
                >
                  <LogOut className="mr-2 size-4" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <UserProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler uscire?</AlertDialogTitle>
            <AlertDialogDescription>
              La sessione verrà terminata e dovrai effettuare nuovamente l'accesso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Esci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
