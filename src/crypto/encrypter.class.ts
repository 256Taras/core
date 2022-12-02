import { compare, hash } from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes, randomUUID, } from 'node:crypto';
import { Service } from '../injector/decorators/service.decorator';
import { Integer } from '../utils/types/integer.type';
import { UuidOptions } from './interfaces/uuid-options.interface';

@Service()
export class Encrypter {
  private readonly algorithm = 'aes-256-ctr';

  private iv = randomBytes(16);

  private key = randomBytes(32);

  public async compareHash(data: string, hash: string): Promise<boolean> {
    return await compare(data, hash);
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

    return encryptedData.toString('hex');
  }

  public async hash(data: string, saltRounds: Integer = 12): Promise<string> {
    return await hash(data, saltRounds);
  }

  public randomBytes(
    length: Integer = 16,
    encoding: BufferEncoding = 'hex',
  ): string {
    return randomBytes(length).toString(encoding);
  }

  public uuid(options?: UuidOptions): string {
    const uuid = randomUUID();

    return options?.clean ? uuid.replaceAll('-', '') : uuid;
  }
}
