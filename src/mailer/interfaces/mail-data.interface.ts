export interface MailData {
  to: string;
  subject: string;
  text?: string;
  view?: string;
  viewData?: Record<string, unknown>;
}
