import { inject } from '../../injector/functions/inject.function';
import { ValidationRules } from '../interfaces/validation-rules.interface';
import { Validator } from '../validator.class';

export const useValidator = (): ((
  rules: Record<string, ValidationRules>,
  checkOnly: boolean,
) => boolean) => {
  const instance = inject(Validator);

  return instance.assert;
};
