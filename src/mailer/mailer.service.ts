import { readFile } from 'node:fs/promises';
import { Transporter, createTransport } from 'nodemailer';
import { Configurator } from '../configurator/configurator.service.js';
import { env } from '../configurator/functions/env.function.js';
import { createErrorTip } from '../handler/functions/create-error-tip.function.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';
import { TemplateCompiler } from '../templates/template-compiler.service.js';
import { callerFile } from '../utils/functions/caller-file.function.js';
import { resolveViewFile } from '../utils/functions/resolve-view-file.function.js';
import { MailData } from './interfaces/mail-data.interface.js';

@Service()
export class Mailer {
  private readonly configurator = inject(Configurator);

  private readonly templateCompiler = inject(TemplateCompiler);

  private readonly transporter: Transporter;

  constructor() {
    const { address, host, password, port } = this.configurator.entries.mail ?? {};

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
      throw new Error(
        'Mail service setup failed',
        createErrorTip('Check your server mail configuration and credentials'),
      );
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

      html = await this.templateCompiler.compile(
        fileContent,
        options.template?.data ?? {},
      );
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
