import { inject } from '../../injector/functions/inject.function';
import { Logger } from '../logger.class';

export const logSub = (data: string) => {
  const logger = inject(Logger);

  logger.sub(data);
};
