import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileFromSession(session: UserSession) {
    const email = session.user.email;

    if (!email) {
      throw new NotFoundException('Session does not include an email address');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return existing;
    }

    // If user doesn't exist in our DB but has a session, it means they just signed up via Better Auth
    // and we might need to ensure they are in the DB (though Better Auth usually creates them).
    // However, since we are using the SAME table for Better Auth and Domain User,
    // if they have a valid session, they MUST exist in the DB.
    // So this case (session exists but user doesn't) should theoretically not happen
    // unless there's a sync issue or we are using separate tables (which we are not anymore).

    // But wait, if I'm using Better Auth with Kysely/PG directly, it inserts into the table.
    // Prisma client should be able to find it.
    // So 'existing' should be found.

    throw new NotFoundException(
      'User not found in database despite active session.',
    );
  }

  private deriveNameParts(source: string) {
    const normalized = source.trim();
    const [first, ...rest] = normalized.split(/\s+/);
    const firstName = first || 'User';
    const lastName = rest.length > 0 ? rest.join(' ') : firstName;

    return { firstName, lastName };
  }
}
