import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const logInfo = (data: string, label = 'info') => {
  const logger = inject(Logger);

  logger.info(data, label);
};
