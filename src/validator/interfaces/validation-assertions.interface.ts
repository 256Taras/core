import { ValidationRules } from './validation-rules.interface';

export interface ValidationAssertions {
  [field: string]: ValidationRules;
}
