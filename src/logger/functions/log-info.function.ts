import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.service';

export function logInfo(message: string, label = 'info') {
  const logger = inject(Logger);

  logger.info(message, label);
}
