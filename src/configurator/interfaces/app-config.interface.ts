import { TemplateDirectiveDefinition } from '../../templates/interfaces/template-directive-definition.interface.js';
import { Integer } from '../../utils/types/integer.type.js';
import { ValidationRuleDefinition } from '../../validator/interfaces/validation-rule-definition.interface.js';

export interface AppConfig {
  contentSecurityPolicy?: Record<string, string | string[]> | boolean;
  cors?: {
    allowedHeaders?: string | string[];
    credentials: boolean;
    maxAge: Integer;
    methods?: string | string[];
    origin: boolean | string | string[] | RegExp | RegExp[];
  };
  crypto?: {
    key?: string;
  };
  development?: boolean;
  env?: string;
  host?: string;
  locale?: string;
  logger?: boolean;
  mail?: {
    address?: string;
    host?: string;
    password?: string;
    port?: Integer;
  };
  port?: Integer;
  session?: {
    lifetime?: Integer;
    path?: string;
  };
  templates?: {
    directives?: TemplateDirectiveDefinition[];
  };
  upload?: {
    fieldLimit?: Integer;
    fileLimit?: Integer;
  };
  validation?: {
    rules?: ValidationRuleDefinition[];
  };
  websocket?: {
    port?: Integer;
  };
}
