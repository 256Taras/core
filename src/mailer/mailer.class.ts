import { Transporter, createTestAccount, createTransport } from 'nodemailer';
import { Service } from '../injector/decorators/service.decorator';
import { env } from '../utils/functions/env.function';
import { MailData } from './interfaces/mail-data.interface';

@Service()
export class Mailer {
  private transporter: Transporter;

  public async send(data: MailData): Promise<string> {
    const { to, subject, text, html } = data;

    const info = await this.transporter.sendMail({
      from: env('MAIL_USER') ?? '',
      to,
      subject,
      text,
      ...(html && { html }),
    });

    return info.messageId;
  }

  public async setup(): Promise<void> {
    const { user, pass } = await createTestAccount();

    this.transporter = createTransport({
      host: env('MAIL_HOST') ?? 'smtp.gmail.com',
      port: env('MAIL_PORT') ?? 587,
      secure: env('MAIL_PORT') === 465 ? true : false,
      auth: {
        user: env('MAIL_USER') ?? user,
        pass: env('MAIL_PASSWORD') ?? pass,
      },
    });
  }
}
