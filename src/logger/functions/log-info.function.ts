import { inject } from '../../injector/functions/inject.function.js';
import { Logger } from '../logger.service.js';

export function logInfo(message: string, label = 'info') {
  const logger = inject(Logger);

  logger.info(message, label);
}
