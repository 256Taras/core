import { inject } from '../../injector/functions/inject.function.js';
import { MailData } from '../interfaces/mail-data.interface.js';
import { Mailer } from '../mailer.service.js';

export function useMail(): (options: MailData) => Promise<string> {
  const instance = inject(Mailer);

  return instance.send;
}
