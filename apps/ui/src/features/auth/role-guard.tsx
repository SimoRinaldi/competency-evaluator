import { ReactNode } from 'react';
import { useAuth } from './auth-context';
import { UserRole } from './auth.api';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente di utilità per nascondere porzioni di UI (es. bottoni, sezioni)
 * se l'utente non possiede i ruoli necessari.
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
