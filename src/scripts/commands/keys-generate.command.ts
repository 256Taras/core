import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { Command } from '../decorators/command.decorator.js';

@Command({
  signature: 'keys:generate',
})
export class KeysGenerateCommand {
  public async handle(): Promise<void> {
    const envFile = `${process.cwd()}/.env`;

    const envContent = await readFile(envFile, 'utf8');

    await writeFile(
      envFile,
      envContent.replace(
        /ENCRYPT_KEY=.*$/m,
        `ENCRYPT_KEY=${randomBytes(16).toString('hex')}`,
      ).replace(
        /JWT_KEY=.*$/m,
        `JWT_KEY=${randomBytes(32).toString('hex')}`,
      ),
    );

    logInfo('Generated new random encryption and JWT keys');
  }
}
