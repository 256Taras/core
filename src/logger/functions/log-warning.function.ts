import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const logWarning = (data: string, label = 'warning') => {
  const logger = inject(Logger);

  logger.warn(data, label);
};
