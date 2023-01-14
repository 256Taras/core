import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export function logError(message: string, label = 'error') {
  const logger = inject(Logger);

  logger.error(message, label);
}
