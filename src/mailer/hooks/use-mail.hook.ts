import { inject } from '../../injector/functions/inject.function';
import { MailData } from '../interfaces/mail-data.interface';
import { Mailer } from '../mailer.class';

export function useMail(): (options: MailData) => Promise<string> {
  const instance = inject(Mailer);

  return instance.send;
}
