import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export function log(data: string, label = 'log') {
  const logger = inject(Logger);

  logger.log(data, label);
}
