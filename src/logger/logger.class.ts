import { Service } from '../injector/decorators/service.decorator';
import chalk from 'chalk';

@Service()
export class Logger {
  private readonly colorYellow = '#f8c377';

  private readonly locale = 'en-us';

  private readonly mark = '$';

  private getDay(): string {
    const date = new Date();

    return date.toLocaleString(this.locale, {
      month: 'short',
      day: 'numeric',
    });
  }

  private getTime(): string {
    const date = new Date();

    return date.toLocaleString(this.locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: '2-digit',
      hour12: true,
    });
  }

  private renderDots(data: string): string {
    const outputLength = data.length + 18;
    const dots = chalk.gray('.'.repeat(process.stdout.columns - outputLength));

    return dots;
  }

  private truncate(data: string): string {
    const maxLength = Math.trunc(process.stdout.columns / 2);

    const truncated =
      data.length > maxLength ? data.slice(0, maxLength) + '...' : data;

    return truncated;
  }

  public error(data: string, type = 'error'): void {
    const day = this.getDay();
    const time = this.getTime();

    const timestamp = `${chalk.red.bold(this.mark)} ${chalk.gray(day)} ${chalk.gray(
      time,
    )} `;

    const mainOutput = this.truncate(data);

    const left = `${timestamp} ${chalk.red.bold(mainOutput)}`;
    const right = chalk.gray(type.toUpperCase());

    const dots = this.renderDots(day + time + mainOutput + type);

    console.error(left, dots, right);
  }

  public info(data: string): void {
    const output = chalk.bold.green(`\n${data}\n`);

    console.log(output);
  }

  public log(data: string, type = 'info'): void {
    const day = this.getDay();
    const time = this.getTime();

    const timestamp = `${chalk.green.bold(this.mark)} ${chalk.gray(
      day,
    )} ${chalk.gray(time)} `;

    const mainOutput = this.truncate(data);

    const left = `${timestamp} ${chalk.white.bold(mainOutput)}`;
    const right = chalk.gray(type.toUpperCase());

    const dots = this.renderDots(day + time + mainOutput + type);

    console.log(left, dots, right);
  }

  public warn(data: string): void {
    const output = chalk.bold.hex(this.colorYellow)(`\n${data}\n`);

    console.warn(output);
  }
}
