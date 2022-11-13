import { inject } from '../../injector/functions/inject.function';
import { Authenticator } from '../authenticator.class';
import { SchemaUser } from '../../database/types/schema-user.type';

export const useAuth = (): [() => boolean, () => SchemaUser | null] => {
  const instance = inject(Authenticator);

  return [instance.check, instance.user];
}
