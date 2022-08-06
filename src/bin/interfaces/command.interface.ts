export interface Command {
  handle(...params: string[]): void;
}
