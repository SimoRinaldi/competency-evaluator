import { UserRole } from "@server/users";

export interface AuthenticatedUser {
    id: number;
    email: string;
    role: UserRole;
    name: string;
}

