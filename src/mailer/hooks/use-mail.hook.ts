import { inject } from '../../injector/functions/inject.function';
import { Mailer } from '../mailer.class';
import { MailData } from '../interfaces/mail-data.interface';

export const useMail = (): (options: MailData) => Promise<string> => {
  const instance = inject(Mailer);

  return instance.send;
}
