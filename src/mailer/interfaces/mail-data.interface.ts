export interface MailData {
  to: string;
  subject: string;
  text?: string;
  view?: string;
  data?: Record<string, unknown>;
}
