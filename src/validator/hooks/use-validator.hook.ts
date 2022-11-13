import { inject } from '../../injector/functions/inject.function';
import { Validator } from '../validator.class';
import { ValidationAssertions } from '../interfaces/validation-assertions.interface';

export const useValidator = (): [(rules: ValidationAssertions, checkOnly: boolean) => boolean] => {
  const instance = inject(Validator);

  return [instance.assert];
}
