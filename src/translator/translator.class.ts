import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Translator {
  private locale = 'en';

  private translations: Map<string, string> = new Map<string, string>();

  private async loadTranslations(): Promise<void> {
    const path = `lang/${this.locale}.json`;

    if (existsSync(path)) {
      const data = (await readFile(path, 'utf8')).toString();

      for (const [key, value] of Object.entries<string>(JSON.parse(data))) {
        this.translations.set(key, value);
      }
    }
  }

  public async $setup(): Promise<void> {
    await this.loadTranslations();
  }

  public all(): Record<string, string> {
    return Object.fromEntries(this.translations);
  }

  public get(text: string, amount = 1): string {
    return (
      (amount > 1
        ? this.translations.get(text)?.[1]
        : this.translations.get(text)) ?? text
    );
  }

  public async setLocale(locale: string): Promise<void> {
    this.locale = locale;

    await this.loadTranslations();
  }
}
