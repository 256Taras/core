import { copyFile } from 'node:fs/promises';

export class File {
  constructor(public name: string, public path: string) {}

  public async store(path: string, name: string): Promise<void> {
    try {
      await copyFile(this.path, `${path}/${name ?? this.name}`);
    } catch (error) {
      throw new Error(`File upload failed: ${(error as Error).message}`);
    }
  }
}
