import { createWriteStream, existsSync } from 'node:fs';
import { createErrorTip } from '../handler/functions/create-error-tip.function.js';

export class File {
  private readonly buffer: Buffer;

  constructor(
    public readonly originalName: string,
    content: Buffer,
    public readonly mimeType: string,
  ) {
    this.buffer = content;
  }

  public get extension(): string {
    return this.originalName.split('.').pop() ?? '';
  }

  public async store(path: string, name: string): Promise<string> {
    try {
      const fullPath = `${path}/${name ?? this.originalName}`;

      if (existsSync(fullPath)) {
        throw new Error(
          `File ${fullPath} already exists`,
          createErrorTip(
            'Try to generate unique name for your file or change the file path',
          ),
        );
      }

      createWriteStream(fullPath).write(this.buffer);

      return fullPath;
    } catch (error) {
      throw new Error(
        `File upload failed. ${(error as Error).message}`,
        createErrorTip(
          'Check your file maximum size configuration or add validation to your file upload form',
        ),
      );
    }
  }
}
