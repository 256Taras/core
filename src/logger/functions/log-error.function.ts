import { inject } from '../../injector/functions/inject.function.js';
import { Logger } from '../logger.service.js';

export function logError(message: string, label = 'error') {
  const logger = inject(Logger);

  logger.error(message, label);
}
