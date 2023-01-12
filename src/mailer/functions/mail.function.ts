import { inject } from '../../injector/functions/inject.function';
import { Mailer } from '../mailer.class';
import { MailData } from '../interfaces/mail-data.interface';

export async function mail(options: MailData): Promise<string> {
  const mailer = inject(Mailer);

  return await mailer.send(options);
}
