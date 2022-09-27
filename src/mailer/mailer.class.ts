import { Transporter, createTransport } from 'nodemailer';
import { Service } from '../injector/decorators/service.decorator';
import { env } from '../utils/functions/env.function';
import { MailData } from './interfaces/mail-data.interface';

@Service()
export class Mailer {
  private transporter: Transporter;

  constructor() {
    try {
      this.transporter = createTransport({
        host: env('MAIL_HOST') ?? 'smtp.gmail.com',
        port: env('MAIL_PORT') ?? 587,
        secure: env('MAIL_PORT') === 465 ? true : false,
        auth: {
          user: env('MAIL_ADDRESS'),
          pass: env('MAIL_PASSWORD'),
        },
      });
    } catch (error) {
      throw new Error('Failed to setup mail service');
    }
  }

  public async send(data: MailData): Promise<string> {
    const { to, subject, text, html } = data;

    const info = await this.transporter.sendMail({
      from: env('MAIL_ADDRESS') ?? '',
      to,
      subject,
      text,
      ...(html && { html }),
    });

    return info.messageId;
  }
}
