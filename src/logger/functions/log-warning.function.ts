import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export function logWarning(message: string, label = 'warning') {
  const logger = inject(Logger);

  logger.warn(message, label);
}
