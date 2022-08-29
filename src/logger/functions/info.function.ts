import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const info = (data: string, type = 'info') => {
  const logger = inject(Logger);

  logger.info(data, type);
};
