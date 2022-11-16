import { inject } from '../../injector/functions/inject.function';
import { Validator } from '../validator.class';
import { ValidationRules } from '../interfaces/validation-rules.interface';

export const useValidator = (): [(rules: Record<string, ValidationRules>, checkOnly: boolean) => boolean] => {
  const instance = inject(Validator);

  return [instance.assert];
}
