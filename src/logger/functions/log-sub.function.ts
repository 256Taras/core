import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export function logSub(data: string) {
  const logger = inject(Logger);

  logger.sub(data);
}
