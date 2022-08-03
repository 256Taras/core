import { execSync } from 'node:child_process';

export const runCommand = (command: string) => {
  try {
    execSync(command, {
      stdio: 'pipe',
    });

    return true;
  } catch (error) {
    return false;
  }
};
