import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Integer } from '../../utils/types/integer.type';

export interface ServerOptions {
  config?: {
    contentSecurityPolicy?: Record<string, string | string[]> | boolean;
    envFile?: string;
    locale?: string;
    logger?: boolean;
    cors?: {
      allowedHeaders?: string | string[];
      methods?: string | string[];
      origin: string | boolean | RegExp | string[] | RegExp[];
      credentials: boolean;
      maxAge: Integer;
    };
  };
  modules: Constructor[];
}
