import { inject } from '../../injector/functions/inject.function';
import { MailData } from '../interfaces/mail-data.interface';
import { Mailer } from '../mailer.service';

export async function mail(options: MailData): Promise<string> {
  const mailer = inject(Mailer);

  return await mailer.send(options);
}
