import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Logger {
  private readonly locale = 'en-us';

  private readonly mark = '$';

  public readonly colorYellow = '#f8c377';

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
    const outputLength = stripAnsi(data).length;
    const sign = '.';
    const dots = chalk.gray(sign.repeat(process.stdout.columns - outputLength - 12));

    return dots;
  }

  private truncate(data: string): string {
    const maxLength = Math.trunc(process.stdout.columns / 2);

    const truncated =
      stripAnsi(data).length > maxLength ? data.slice(0, maxLength) + '...' : data;

    return truncated;
  }

  public error(data: string, type = 'error'): void {
    const output = `\n${chalk.bgRed.black(' ' + type.toUpperCase() + ' ')} ${chalk.bold.red(data)}\n`;

    console.error(output);
  }

  public info(data: string, type = 'info'): void {
    const output = `\n${chalk.bgGreen.black(' ' + type.toUpperCase() + ' ')} ${chalk.bold.green(data)}\n`;

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

    const dots = this.renderDots(timestamp + mainOutput + type);

    console.log(left, dots, right);
  }

  public warn(data: string, type = 'warning'): void {
    const output = `\n${chalk.bgHex(this.colorYellow).black(' ' + type.toUpperCase() + ' ')} ${chalk.bold.hex(this.colorYellow)(data)}\n`;

    console.warn(output);
  }
}
