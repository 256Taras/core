import { SchemaUser } from '../../database/types/schema-user.type';
import { inject } from '../../injector/functions/inject.function';
import { Authenticator } from '../authenticator.class';

export function useAuth(): [() => boolean, () => SchemaUser | null] {
  const instance = inject(Authenticator);

  return [instance.check, instance.user];
}
