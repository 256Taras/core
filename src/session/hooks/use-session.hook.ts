import { inject } from '../../injector/functions/inject.function';
import { Session } from '../session.service';

export function useSession(): [
  <T>(key: string) => T | null,
  (name: string, value: unknown) => void,
] {
  const instance = inject(Session);

  return [instance.get, instance.set];
}
