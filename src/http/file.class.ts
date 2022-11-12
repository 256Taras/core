import { copyFile } from 'node:fs/promises';

export class File {
  constructor(public name: string, public path: string) {}

  public async store(path: string, name: string): Promise<string> {
    try {
      const fullPath = `${path}/${name ?? this.name}`;

      await copyFile(this.path, fullPath);

      return fullPath;
    } catch (error) {
      throw new Error(`File upload failed: ${(error as Error).message}`);
    }
  }
}
