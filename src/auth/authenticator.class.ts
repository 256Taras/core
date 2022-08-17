import { DatabaseClient } from '../database/database-client.class';
import { Exception } from '../handler/exception.class';
import { Service } from '../injector/decorators/service.decorator';
import { Encrypter } from '../crypto/encrypter.class';

@Service()
export class Authenticator {
  constructor(private db: DatabaseClient, private encrypter: Encrypter) {}

  public async login(email: string, password: string): Promise<boolean> {
    if (!('user' in this.db)) {
      throw new Exception('Database schema must contain a "user" table');
    }

    if (!('email' in this.db.user) || !('password' in this.db.user)) {
      throw new Exception('User model in database must contain "email" and "password" columns');
    }

    const user = await this.db.user.findFirst({
      where: {
        email,
      },
    });

    if (user && await this.encrypter.compareHash(password, user.password)) {
      return true;
    }

    return false;
  }
}
