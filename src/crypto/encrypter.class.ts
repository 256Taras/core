import { Service } from '../injector/decorators/service.decorator';
import { hash, compare } from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';

@Service()
export class Encrypter {
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-ctr';

  private readonly HASH_ROUNDS = 12;

  private iv = randomBytes(16);

  private key = randomBytes(32);

  public async compareHash(data: string, hash: string): Promise<boolean> {
    const matches = await compare(data, hash);

    return matches;
  }

  public async decrypt(encryptedData: string): Promise<string> {
    const decipher = createDecipheriv(this.ENCRYPTION_ALGORITHM, this.key, this.iv);

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'hex')),
      decipher.final(),
    ]).toString();
  }

  public async encrypt(rawData: string): Promise<string> {
    const cipher = createCipheriv(this.ENCRYPTION_ALGORITHM, this.key, this.iv);

    return Buffer.concat([
      cipher.update(rawData),
      cipher.final(),
    ]).toString();
  }

  public async hash(data: string): Promise<string> {
    const hashedData = await hash(data, this.HASH_ROUNDS);

    return hashedData;
  }

  public uuid(): string {
    return randomUUID();
  }
}
