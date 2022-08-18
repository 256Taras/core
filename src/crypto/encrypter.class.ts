import { Service } from '../injector/decorators/service.decorator';
import { Integer } from '../utils/types/integer.type';
import { compare, hash } from 'bcrypt';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from 'node:crypto';

@Service()
export class Encrypter {
  private readonly algorithm = 'aes-256-ctr';

  private iv = randomBytes(16);

  private key = randomBytes(32);

  public async compareHash(data: string, hash: string): Promise<boolean> {
    const matches = await compare(data, hash);

    return matches;
  }

  public async decrypt(encryptedData: string): Promise<string> {
    const decipher = createDecipheriv(this.algorithm, this.key, this.iv);

    const decryptedData = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'hex')),
      decipher.final(),
    ]);

    return decryptedData.toString();
  }

  public async encrypt(rawData: string): Promise<string> {
    const cipher = createCipheriv(this.algorithm, this.key, this.iv);

    const encryptedData = Buffer.concat([cipher.update(rawData), cipher.final()]);

    return encryptedData.toString();
  }

  public async hash(data: string, saltRounds: Integer = 12): Promise<string> {
    const hashedData = await hash(data, saltRounds);

    return hashedData;
  }

  public uuid(): string {
    return randomUUID();
  }
}
