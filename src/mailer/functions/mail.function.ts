import { inject } from '../../injector/functions/inject.function.js';
import { MailData } from '../interfaces/mail-data.interface.js';
import { Mailer } from '../mailer.service.js';

export async function mail(options: MailData): Promise<string> {
  const mailer = inject(Mailer);

  return await mailer.send(options);
}
