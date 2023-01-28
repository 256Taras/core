import { inject } from '../../injector/functions/inject.function.js';
import { ValidationRules } from '../interfaces/validation-rules.interface.js';
import { Validator } from '../validator.service.js';

export function useValidator(): (
  rules: Record<string, ValidationRules>,
  checkOnly: boolean,
) => boolean {
  const instance = inject(Validator);

  return instance.assert;
}
