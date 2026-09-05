import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserRole } from './dto/user-role.enum';
import * as bcrypt from 'bcrypt';

/**
 * Seed service: all'avvio crea un utente ADMIN di default,
 * se il database non contiene ancora nessun utente.
 *
 * Credenziali di default:
 *   Email:    admin@coeva.local
 *   Password: Password!
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly usersRepository: UsersRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedAdminUser();
  }

  private async seedAdminUser(): Promise<void> {
    const existing_users = await this.usersRepository.findAll();

    if (existing_users.length > 0) return;

    const admin_email = process.env.SEED_ADMIN_EMAIL ?? 'admin@coeva.local';
    const admin_password = process.env.SEED_ADMIN_PASSWORD ?? 'Password!';
    const admin_name = process.env.SEED_ADMIN_NAME ?? 'Admin';

    const passwordHash = await bcrypt.hash(admin_password, 10);

    await this.usersRepository.createOne(
      {
        name: admin_name,
        email: admin_email,
        password: admin_password,
        role: UserRole.ADMIN,
      },
      passwordHash,
    );

    console.warn(`[Seed] Utente admin creato: ${admin_email}`);
  }
}
