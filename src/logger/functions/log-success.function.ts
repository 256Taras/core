import { inject } from '../../injector/functions/inject.function.js';
import { Logger } from '../logger.service.js';

export function logSuccess(message: string, label = 'success') {
  const logger = inject(Logger);

  logger.success(message, label);
}
