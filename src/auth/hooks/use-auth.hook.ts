import { SchemaUser } from '../../database/types/schema-user.type.js';
import { inject } from '../../injector/functions/inject.function.js';
import { Authenticator } from '../authenticator.service.js';

export function useAuth(): [() => boolean, () => SchemaUser | null] {
  const instance = inject(Authenticator);

  return [instance.check, instance.user];
}
