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
}
