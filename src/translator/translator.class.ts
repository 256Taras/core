import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Translator {
  private locale = 'en';

  private translations: Map<string, string>;

  public async $setup(): Promise<void> {
    const path = `lang/${this.locale}.json`;

    const data = (await readFile(path, 'utf8')).toString();

    if (existsSync(path)) {
      this.translations = new Map<string, string>(Object.entries(JSON.parse(data)));
    }
  }

  public get(text: string): string {
    return this.translations.get(text) ?? text;
  }

  public setLocale(lang?: string): void {
    this.locale = lang ?? 'en';
  }
}
