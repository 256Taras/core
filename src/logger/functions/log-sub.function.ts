import { inject } from '../../injector/functions/inject.function.js';
import { Logger } from '../logger.service.js';

export function logSub(message: string) {
  const logger = inject(Logger);

  logger.sub(message);
}
