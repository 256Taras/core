import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export function log(message: string, label = 'log') {
  const logger = inject(Logger);

  logger.log(message, label);
}
