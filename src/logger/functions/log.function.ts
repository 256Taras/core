import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const log = (data: string, type = 'log') => {
  const logger = inject(Logger);

  logger.log(data, type);
};
