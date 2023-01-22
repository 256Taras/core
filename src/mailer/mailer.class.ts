import { readFile } from 'node:fs/promises';
import { Transporter, createTransport } from 'nodemailer';
import { Configurator } from '../configurator/configurator.class';
import { Service } from '../injector/decorators/service.decorator';
import { TemplateCompiler } from '../templates/template-compiler.class';
import { callerFile } from '../utils/functions/caller-file.function';
import { env } from '../utils/functions/env.function';
import { resolveViewFile } from '../utils/functions/resolve-view-file.function';
import { MailData } from './interfaces/mail-data.interface';

@Service()
export class Mailer {
  private transporter: Transporter;

  constructor(
    private configurator: Configurator,
    private templateCompiler: TemplateCompiler,
  ) {
    const { address, host, password, port } = this.configurator.entries?.mail ?? {};

    try {
      this.transporter = createTransport({
        auth: {
          user: address ?? env('MAIL_ADDRESS'),
          pass: password ?? env('MAIL_PASSWORD'),
        },
        host: host ?? env('MAIL_HOST') ?? 'smtp.gmail.com',
        port: port ?? env('MAIL_PORT') ?? 587,
        secure: (port ?? env('MAIL_PORT')) === 465 ? true : false,
      });
    } catch {
      throw new Error('Mail service setup failed', {
        cause: new Error('Check your server mail configuration and credentials'),
      });
    }
  }

  public async send(options: MailData): Promise<string> {
    const { to, subject, text, attachments } = options;

    let templatePath = options.template?.path;

    let html = '';

    if (templatePath) {
      const caller = callerFile();

      templatePath = resolveViewFile(caller, templatePath!);

      const fileContent = await readFile(templatePath!, 'utf8');

      html = await this.templateCompiler.compile(fileContent, options.template?.data ?? {});
    }

    const info = await this.transporter.sendMail({
      from: env('MAIL_ADDRESS') ?? '',
      to,
      subject,
      ...(text && { text }),
      ...(templatePath && { html }),
      attachments,
    });

    return info.messageId;
  }
}
