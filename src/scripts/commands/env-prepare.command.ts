import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { Command } from '../decorators/command.decorator.js';

@Command({
  signature: 'env:prepare',
  parameters: {
    prod: {
      type: 'boolean',
      short: 'p',
      default: false,
    },
  },
})
export class EnvPrepareCommand {
  public async handle(flags: Record<string, boolean>): Promise<void> {
    const envFile = `${process.cwd()}/.env`;

    if (!existsSync(envFile)) {
      await copyFile(`${envFile}.example`, envFile);
    }

    const envContent = (await readFile(envFile, 'utf8'))
      .replace(/ENCRYPT_KEY=.*$/m, `ENCRYPT_KEY=${randomBytes(16).toString('hex')}`)
      .replace(/JWT_KEY=.*$/m, `JWT_KEY=${randomBytes(32).toString('hex')}`);

    await writeFile(
      envFile,
      flags.prod
        ? envContent.replace(/DEVELOPMENT=.*$/, 'DEVELOPMENT=false')
        : envContent,
    );

    logInfo('Generated new random encryption and JWT keys');
  }
}
