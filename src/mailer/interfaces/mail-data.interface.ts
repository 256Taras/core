import { Attachment } from './attachment.interface';

export interface MailData {
  to: string;
  subject: string;
  text?: string;
  template?: {
    path?: string;
    data?: Record<string, unknown>;
  };
  attachments?: Attachment[];
}
