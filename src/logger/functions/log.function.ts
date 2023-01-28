import { inject } from '../../injector/functions/inject.function.js';
import { Logger } from '../logger.service.js';

export function log(message: string, label = 'log') {
  const logger = inject(Logger);

  logger.log(message, label);
}
