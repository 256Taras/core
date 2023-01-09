import chalk from 'chalk';
import { Service } from '../injector/decorators/service.decorator';
import { stripAnsiChars } from '../utils/functions/strip-ansi-chars.function';
import {
  LOGGER_COLOR_GREEN,
  LOGGER_COLOR_RED,
  LOGGER_COLOR_YELLOW,
} from './constants';

@Service()
export class Logger {
  private enabled = true;

  private lastColor = '#ffffff';

  private lastLabel = 'log';

  private readonly locale = 'en-us';

  private readonly logLabelPadding = 8;

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
    const outputLength = stripAnsiChars(data).length;
    const sign = '.';

    return chalk.gray(sign.repeat(process.stdout.columns - outputLength - 12));
  }

  private truncate(data: string): string {
    const maxLength = Math.trunc(process.stdout.columns / 2);

    return stripAnsiChars(data).length > maxLength
      ? data.slice(0, maxLength) + '...'
      : data;
  }

  public $disable(): void {
    this.enabled = false;
  }

  public error(data: string, label = 'error'): void {
    if (!this.enabled) {
      return;
    }

    this.lastLabel = label;
    this.lastColor = LOGGER_COLOR_RED;

    const output = `\n${chalk
      .bgHex(LOGGER_COLOR_RED)
      .black(` ${label.toUpperCase()} `)} ${chalk.bold.hex(LOGGER_COLOR_RED)(
      data,
    )}\n`;

    console.error(output);
  }

  public info(data: string, label = 'info'): void {
    if (!this.enabled) {
      return;
    }

    this.lastLabel = label;
    this.lastColor = LOGGER_COLOR_GREEN;

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

    const formattedLabel = `[${chalk.white(
      label.charAt(0).toUpperCase() + label.slice(1),
    )}]`;

    const timestamp = `${chalk.gray(
      `${formattedLabel}${' '.repeat(this.logLabelPadding - label.length)}`,
    )} ${chalk.gray(day)} ${chalk.gray(time)} `;

    const mainOutput = this.truncate(data);

    const left = `${timestamp} ${chalk.white.bold(mainOutput)}`;
    const right = chalk.gray(additionalData);

    const dots = this.renderDots(
      timestamp + mainOutput + label + ' '.repeat(7 - label.length),
    );

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
    this.lastColor = LOGGER_COLOR_YELLOW;

    const output = `\n${chalk
      .bgHex(LOGGER_COLOR_YELLOW)
      .black(' ' + label.toUpperCase() + ' ')} ${chalk.bold.hex(LOGGER_COLOR_YELLOW)(
      data,
    )}\n`;

    console.warn(output);
  }
}
