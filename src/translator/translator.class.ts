import { existsSync } from 'node:fs';
import { Service } from '../injector/decorators/service.decorator';
import { readJson } from '../utils/functions/read-json.function';

@Service()
export class Translator {
  private locale = 'en';

  private translations: Map<string, string> = new Map<string, string>();

  private async loadTranslations(): Promise<void> {
    const path = `lang/${this.locale}.json`;

    if (existsSync(path)) {
      const data = await readJson(path);

      for (const [key, value] of Object.entries<string>(data)) {
        this.translations.set(key, value);
      }
    }
  }

  public async $setup(locale: string): Promise<void> {
    this.locale = locale;

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

  public async setRequestLocale(locale: string): Promise<void> {
    this.locale = locale;

    await this.loadTranslations();
  }
}
