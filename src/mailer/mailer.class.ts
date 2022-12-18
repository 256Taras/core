import { readFile } from 'node:fs/promises';
import { Transporter, createTransport } from 'nodemailer';
import { Configurator } from '../configurator/configurator.class';
import { Service } from '../injector/decorators/service.decorator';
import { callerFile } from '../utils/functions/caller-file.function';
import { env } from '../utils/functions/env.function';
import { resolveViewFile } from '../utils/functions/resolve-view-file.function';
import { ViewCompiler } from '../views/view-compiler.class';
import { MailData } from './interfaces/mail-data.interface';

@Service()
export class Mailer {
  private transporter: Transporter;

  constructor(
    private configurator: Configurator,
    private viewCompiler: ViewCompiler,
  ) {
    const { address, host, password, port } = this.configurator.entries.mail ?? {};

    try {
      this.transporter = createTransport({
        host: host ?? env('MAIL_HOST') ?? 'smtp.gmail.com',
        port: port ?? env('MAIL_PORT') ?? 587,
        secure: (port ?? env('MAIL_PORT')) === 465 ? true : false,
        auth: {
          user: address ?? env('MAIL_ADDRESS'),
          pass: password ?? env('MAIL_PASSWORD'),
        },
      });
    } catch (error) {
      throw new Error('Failed to set up mail service');
    }
  }

  public async send(options: MailData): Promise<string> {
    const { to, subject, text, data } = options;

    let html = '';
    let { view } = options;

    if (view) {
      const caller = callerFile();

      view = resolveViewFile(caller, view);

      const fileContent = await readFile(view, 'utf-8');

      html = await this.viewCompiler.compile(fileContent, data);
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
