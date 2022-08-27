import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Integer } from '../../utils/types/integer.type';

export interface ServerOptions {
  config?: {
    envFile?: string;
    language?: string;
    contentSecurityPolicy?: Record<string, string | string[]> | false;
    cors?: {
      allowedHeaders?: string | string[];
      methods?: string | string[];
      origin: string | boolean | RegExp | string[] | RegExp[];
      credentials: boolean;
      maxAge: Integer;
    };
    dev?: {
      openBrowser?: boolean;
    };
  };
  modules: Constructor[];
}
