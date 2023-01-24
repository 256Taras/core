import { existsSync } from 'node:fs';
import { Service } from '../injector/decorators/service.decorator';
import { readJson } from '../utils/functions/read-json.function';
import { Integer } from '../utils/types/integer.type';

@Service()
export class Translator {
  private locale = 'en';

  private translations = new Map<string, string | string[]>();

  private async loadTranslations(): Promise<void> {
    const path = `lang/${this.locale}.json`;

    if (existsSync(path)) {
      const data = await readJson(path);

      for (const [key, value] of Object.entries<string | string[]>(data)) {
        this.translations.set(key, value);
      }
    }
  }

  public async $setup(locale: string): Promise<void> {
    this.locale = locale;

    await this.loadTranslations();
  }

  public all(): Record<string, string | string[]> {
    return Object.fromEntries(this.translations);
  }

  public get(text: string, quantity: Integer = 1): string {
    if (quantity > 1) {
      const key =
        [...this.translations.keys()].find((key) => {
          return key.startsWith(`${text}|`);
        }) ?? text;

      if (!Array.isArray(this.translations.get(key))) {
        throw new Error(`Pluralized translation for '${text}' is not an array`);
      }

      return this.translations.get(text)?.[1] ?? text;
    }

    return (this.translations.get(text) as string) ?? text;
  }

  public async setRequestLocale(locale: string): Promise<void> {
    if (this.locale === locale) {
      return;
    }

    this.locale = locale;

    await this.loadTranslations();
  }
}
