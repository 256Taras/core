export interface Command {
  signature?: string;
  parameters?: string[];
  handle(...params: string[]): void;
}
