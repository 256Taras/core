import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Integer } from '../../utils/types/integer.type';

export interface ServerOptions {
  config?: {
    contentSecurityPolicy?: Record<string, string | string[]> | boolean;
    cors?: {
      allowedHeaders?: string | string[];
      methods?: string | string[];
      origin: boolean | string | string[] | RegExp | RegExp[];
      credentials: boolean;
      maxAge: Integer;
    };
    env?: string;
    locale?: string;
    logger?: boolean;
  };
  modules: Constructor[];
}
