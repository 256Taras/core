import { inject } from '../../injector/functions/inject.function';
import { ValidationRules } from '../interfaces/validation-rules.interface';
import { Validator } from '../validator.service';

export function validate(rules: Record<string, ValidationRules>, checkOnly = false) {
  const validator = inject(Validator);

  return validator.assert(rules, checkOnly);
}
