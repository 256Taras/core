import { flash } from '../../session/functions/flash.function';

export const oldInput = (key: string) => {
  return flash<Record<string, string>>('oldInput')?.[key] ?? '';
};
