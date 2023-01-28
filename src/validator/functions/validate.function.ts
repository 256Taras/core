import { inject } from '../../injector/functions/inject.function.js';
import { ValidationRules } from '../interfaces/validation-rules.interface.js';
import { Validator } from '../validator.service.js';

export function validate(rules: Record<string, ValidationRules>, checkOnly = false) {
  const validator = inject(Validator);

  return validator.assert(rules, checkOnly);
}
