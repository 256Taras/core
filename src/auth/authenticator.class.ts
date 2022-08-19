import { Encrypter } from '../crypto/encrypter.class';
import { AuthUser, DatabaseClient } from '../database/database-client.class';
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
      throw new Exception('Database schema must contain a "user" table');
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
      this.session.set('_auth:user', user);

      return true;
    }

    return false;
  }

  public logout(): void {
    this.session.set('_auth', false);

    this.session.destroy();
  }

  public user(): AuthUser {
    return this.session.data['_auth:user'];
  }
}
