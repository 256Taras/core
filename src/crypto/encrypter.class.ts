import { compare, hash } from 'bcrypt';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from 'node:crypto';
import { Service } from '../injector/decorators/service.decorator';
import { Integer } from '../utils/types/integer.type';
import { UuidOptions } from './interfaces/uuid-options.interface';
import { EncryptionAlgorithm } from './types/encryption-algorithm.type';

@Service()
export class Encrypter {
  private iv = randomBytes(16);

  private key = randomBytes(32);

  public async compareHash(data: string, hash: string): Promise<boolean> {
    return await compare(data, hash);
  }

  public decrypt(
    encryptedData: string,
    algorithm: EncryptionAlgorithm = 'aes-256-cbc',
  ): string {
    const decipher = createDecipheriv(algorithm, this.key, this.iv);

    const decryptedData =
      algorithm === 'aes-256-ctr'
        ? decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8')
        : Buffer.concat([
            decipher.update(Buffer.from(encryptedData, 'hex')),
            decipher.final(),
          ]).toString();

    return decryptedData;
  }

  public encrypt(
    rawData: string,
    algorithm: EncryptionAlgorithm = 'aes-256-cbc',
  ): string {
    const cipher = createCipheriv(algorithm, this.key, this.iv);

    const encryptedData =
      algorithm === 'aes-256-ctr'
        ? cipher.update(rawData, 'utf8', 'hex') + cipher.final('hex')
        : Buffer.concat([cipher.update(rawData), cipher.final()]).toString('hex');

    return encryptedData;
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
