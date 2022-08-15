import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const error = (data: string, type = 'error') => {
  const logger = inject(Logger);

  logger.error(data, type);
};
