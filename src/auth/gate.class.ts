export abstract class Gate {
  public allows(action: string, data: unknown): boolean {
    return (this as unknown as Record<string, Function>)[action]?.(data) ?? false;
  }
}
