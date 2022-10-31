import { Transporter, createTransport } from 'nodemailer';
import { readFile } from 'node:fs/promises';
import { Service } from '../injector/decorators/service.decorator';
import { env } from '../utils/functions/env.function';
import { MailData } from './interfaces/mail-data.interface';
import { ViewCompiler } from '../views/view-compiler.class';
import { callerFile } from '../utils/functions/caller-file.function';

@Service()
export class Mailer {
  private transporter: Transporter;

  constructor(private viewCompiler: ViewCompiler) {
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
      throw new Error('Failed to set up mail service');
    }
  }

  public async send(data: MailData): Promise<string> {
    const { to, subject, text, viewData } = data;

    let html = '';
    let { view } = data;

    if (view) {
      const caller = callerFile();

      if (view.startsWith('./')) {
        view = `${caller}/../${view.slice(2)}`;
      }

      const fileContent = await readFile(view, 'utf-8');

      html = await this.viewCompiler.compile(fileContent, viewData);
    }

    const info = await this.transporter.sendMail({
      from: env('MAIL_ADDRESS') ?? '',
      to,
      subject,
      ...(text && { text }),
      ...(view && { html }),
    });

    return info.messageId;
  }
}
