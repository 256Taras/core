import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const warn = (data: string) => {
  const logger = inject(Logger);

  logger.warn(data);
};
