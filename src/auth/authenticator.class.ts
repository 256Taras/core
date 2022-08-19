import { Encrypter } from '../crypto/encrypter.class';
import { DatabaseClient, SchemaUser } from '../database/database-client.class';
import { Exception } from '../handler/exception.class';
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
    return this.session.data._auth;
  }

  public async login(email: string, password: string): Promise<boolean> {
    if (!('user' in this.db)) {
      throw new Exception('Database schema must contain a User model');
    }

    if (!('email' in this.db.user) || !('password' in this.db.user)) {
      throw new Exception(
        `User model in database must contain 'email' and 'password' columns`,
      );
    }

    const user = await this.db.user.findFirst({
      where: {
        email,
      },
    });

    if (user && (await this.encrypter.compareHash(password, user.password))) {
      this.session.set('_auth', true);
      this.session.set('_authUser', user);

      return true;
    }

    return false;
  }

  public logout(): void {
    this.session.set('_auth', false);

    this.session.destroy();
  }

  public user(): SchemaUser {
    return this.session.data._authUser;
  }
}
