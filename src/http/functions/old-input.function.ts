import { flash } from '../../session/functions/flash.function';

export function oldInput(key: string) {
  return flash<Record<string, string>>('oldInput')?.[key] ?? '';
}
