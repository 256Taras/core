import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { info } from '../../logger/functions/info.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'key:generate',
})
export class KeyGenerateCommand {
  public async handle(): Promise<void> {
    const envFile = `${process.cwd()}/.env`;

    const envContent = await readFile(envFile, 'utf8');

    await writeFile(
      envFile,
      envContent.replace(
        'ENCRYPT_KEY=',
        `ENCRYPT_KEY=${randomBytes(16).toString('hex')}`,
      ),
    );

    info('Generated new encryption key');
  }
}
