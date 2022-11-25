import { existsSync, readFileSync } from 'node:fs';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Translator {
  private locale = 'en';

  private translations: Record<string, string> = {};

  public async $setup(): Promise<void> {
    const path = `lang/${this.locale}.json`;

    this.translations = existsSync(path)
      ? JSON.parse(readFileSync(path, 'utf-8').toString())
      : {};
  }

  public get(text: string): string {
    return this.translations[text] ?? text;
  }

  public setLocale(lang?: string): void {
    this.locale = lang ?? 'en';
  }
}
