import { existsSync, readFileSync } from 'node:fs';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Translator {
  private locale = 'en';

  public get(text: string): string {
    const path = `lang/${this.locale}.json`;

    const translations = existsSync(path)
      ? JSON.parse(readFileSync(path, 'utf-8').toString())
      : {};

    return translations[text] ?? text;
  }

  public setLocale(lang?: string): void {
    this.locale = lang ?? 'en';
  }
}
