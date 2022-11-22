import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const logError = (data: string, label = 'error') => {
  const logger = inject(Logger);

  logger.error(data, label);
};
