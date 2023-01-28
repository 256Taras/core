import { inject } from '../../injector/functions/inject.function.js';
import { Logger } from '../logger.service.js';

export function logWarning(message: string, label = 'warning') {
  const logger = inject(Logger);

  logger.warn(message, label);
}
