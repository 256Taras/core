import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.service';

export function logSub(message: string) {
  const logger = inject(Logger);

  logger.sub(message);
}
