import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { logInfo } from '../../logger/functions/log-info.function';
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
        /ENCRYPT_KEY=.*$/m,
        `ENCRYPT_KEY=${randomBytes(16).toString('hex')}`,
      ),
    );

    logInfo('Generated new encryption key');
  }
}
