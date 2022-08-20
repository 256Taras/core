import { Service } from '../injector/decorators/service.decorator';
import { existsSync, readFileSync } from 'node:fs';

@Service()
export class Translator {
  private language = 'en';

  public get(text: string): string {
    const path = `lang/${this.language}.json`;

    const translations = existsSync(path)
      ? JSON.parse(readFileSync(path, 'utf-8').toString())
      : {};

    return translations[text] ?? text;
  }

  public setLanguage(lang?: string): void {
    this.language = lang ?? 'en';
  }
}
