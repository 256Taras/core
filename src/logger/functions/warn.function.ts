import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const warn = (data: string, type: string = 'warning') => {
  const logger = inject(Logger);

  logger.warn(data, type);
};
