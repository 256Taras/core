import { readFile } from 'node:fs/promises';
import { Service } from '../injector/decorators/service.decorator';
import { AppConfig } from './interfaces/app-config.interface';

@Service()
export class Configurator {
  private options: AppConfig;

  public $setup(options: AppConfig): void {
    this.options = options;
  }

  public all(): AppConfig {
    return this.entries;
  }

  public get entries(): AppConfig {
    return this.options;
  }

  public get<T = string>(option: string): T {
    return this.options[option as keyof AppConfig] as unknown as T;
  }

  public async loadEnvironment(file = '.env'): Promise<void> {
    const envContent = await readFile(file, 'utf8');

    if (envContent) {
      let multilineValueOpen = false;
      let multilineValue = '';

      envContent
        .replaceAll('\r\n', '\n')
        .split('\n')
        .map((line) => {
          if (
            !multilineValueOpen &&
            line.trim() !== '' &&
            !line.match(/^(((export)?(\s+)?[a-zA-Z_]+[a-zA-Z0-9_]*=(.*?)?)|")$/)
          ) {
            throw new Error('.env file syntax is not valid');
          }

          if (line.trim() === '') {
            return;
          }

          const [key] = line.split('=');

          let [, value] = line.split('=');

          value = value.replace(/export *?/, '').replace(/#.*?$/, '');

          [...value.matchAll(/\$\{([a-zA-Z_]+[a-zA-Z0-9_]*)\}/g)].map((match) => {
            value.replace(match[0], process.env[match[1]]?.toString() ?? '');
          });

          if (line.includes('=') && !key) {
            return;
          }

          if (value.startsWith('"') && !value.endsWith('"')) {
            multilineValueOpen = true;

            multilineValue += value;
          } else if (line.trim() === '"') {
            multilineValueOpen = false;

            value = multilineValue;
            multilineValue = '';
          }

          try {
            process.env[key] = JSON.parse(value.trim() ?? null);
          } catch {
            process.env[key] = value;
          }
        });
    }
  }
}
