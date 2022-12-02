import { Encrypter } from '../crypto/encrypter.class';
import { DatabaseClient } from '../database/database-client.class';
import { SchemaUser } from '../database/types/schema-user.type';
import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';

@Service()
export class Authenticator {
  constructor(
    private db: DatabaseClient,
    private encrypter: Encrypter,
    private session: Session,
  ) {}

  public check(): boolean {
    return this.session.get('_auth') ?? false;
  }

  public async login(email: string, password: string): Promise<boolean> {
    if (!('user' in this.db)) {
      throw new Error('Database schema must contain a User model');
    }

    if (!('email' in this.db.user) || !('password' in this.db.user)) {
      throw new Error(
        `User model in database must contain 'email' and 'password' columns`,
      );
    }

    const user = await this.db.user.findFirst({
      where: {
        email,
      },
    });

    const passwordValid = await this.encrypter.compareHash(
      password,
      user?.password ?? '',
    );

    if (user && passwordValid) {
      this.session.set('_auth', true);
      this.session.set('_authUser', user);

      return true;
    }

    return false;
  }

  public async logout(): Promise<void> {
    this.session.set('_auth', false);

    await this.session.destroy();
  }

  public user(): SchemaUser | null {
    return this.session.get('_authUser');
  }
}
