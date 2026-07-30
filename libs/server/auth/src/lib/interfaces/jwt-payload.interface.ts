import { UserRole } from "@server/users";

export interface JwtPayload {
    sub: number;
    email: string;
    role: UserRole;
    name: string;
}
