export abstract class Gate {
  public allows(action: string, data: unknown): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this[action]?.(data) ?? false;
  }
}
