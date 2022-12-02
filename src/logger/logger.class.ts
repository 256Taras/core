import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Logger {
  private enabled = true;

  private lastColor = '#ffffff';

  private lastLabel = 'log';

  private readonly locale = 'en-us';

  public readonly colorOrange = '#ffa57c';

  public readonly colorGreen = '#0dbc79';

  public readonly colorRed = '#f87777';

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

    return chalk.gray(sign.repeat(process.stdout.columns - outputLength - 12));
  }

  private truncate(data: string): string {
    const maxLength = Math.trunc(process.stdout.columns / 2);

    return stripAnsi(data).length > maxLength ? data.slice(0, maxLength) + '...' : data;
  }

  public $disable(): void {
    this.enabled = false;
  }

  public error(data: string, label = 'error'): void {
    if (!this.enabled) {
      return;
    }

    this.lastLabel = label;
    this.lastColor = this.colorRed;

    const output = `\n${chalk
      .bgHex(this.colorRed)
      .black(` ${label.toUpperCase()} `)} ${chalk.bold.hex(this.colorRed)(data)}\n`;

    console.error(output);
  }

  public info(data: string, label = 'info'): void {
    if (!this.enabled) {
      return;
    }

    this.lastLabel = label;
    this.lastColor = this.colorGreen;

    const output = `\n${chalk.bgGreen.black(
      ' ' + label.toUpperCase() + ' ',
    )} ${chalk.bold.green(data)}\n`;

    console.log(output);
  }

  public log(data: string, label = 'log', additionalData = ''): void {
    if (!this.enabled) {
      return;
    }

    const day = this.getDay();
    const time = this.getTime();

    const timestamp = `${chalk.gray(
      `[${chalk.white(label.charAt(0).toUpperCase() + label.slice(1))}]${' '.repeat(
        7 - label.length,
      )}`,
    )} ${chalk.gray(day)} ${chalk.gray(time)} `;

    const mainOutput = this.truncate(data);

    const left = `${timestamp} ${chalk.white.bold(mainOutput)}`;
    const right = chalk.gray(additionalData);

    const dots = this.renderDots(timestamp + mainOutput + label);

    console.log(left, dots, right);
  }

  public sub(data: string): void {
    if (!this.enabled) {
      return;
    }

    const indent = ' '.repeat(this.lastLabel.length + 2);

    const output = `${indent} ${chalk.bold.hex(this.lastColor)(data)}\n`;

    console.log(output);
  }

  public warn(data: string, label = 'warning'): void {
    if (!this.enabled) {
      return;
    }

    this.lastLabel = label;
    this.lastColor = this.colorYellow;

    const output = `\n${chalk
      .bgHex(this.colorYellow)
      .black(' ' + label.toUpperCase() + ' ')} ${chalk.bold.hex(this.colorYellow)(
      data,
    )}\n`;

    console.warn(output);
  }
}
