import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export function logInfo(message: string, label = 'info') {
  const logger = inject(Logger);

  logger.info(message, label);
}
