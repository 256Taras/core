import chalk from 'chalk';
import { Service } from '../injector/decorators/service.decorator';
import { stripAnsiChars } from '../utils/functions/strip-ansi-chars.function';
import {
  LOGGER_COLOR_GREEN,
  LOGGER_COLOR_RED,
  LOGGER_COLOR_YELLOW,
} from './constants';
import { clearLine } from './functions/clear-line.function';

@Service()
export class Logger {
  private enabled = true;

  private lastColor = '#ffffff';

  private lastLabel = 'log';

  private lastMessage: string | null = null;

  private readonly locale = 'en-us';

  private readonly logLabelPadding = 8;

  private repeatedMessageCount = 0;

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

  private renderDots(message: string): string {
    const outputLength = stripAnsiChars(message).length;
    const sign = '.';

    return chalk.gray(sign.repeat(process.stdout.columns - outputLength - 12));
  }

  private truncate(message: string): string {
    const maxLength = Math.trunc(process.stdout.columns / 2);

    return stripAnsiChars(message).length > maxLength
      ? message.slice(0, maxLength) + '...'
      : message;
  }

  public $disable(): void {
    this.enabled = false;
  }

  public error(message: string, label = 'error'): void {
    if (!this.enabled) {
      return;
    }

    if (message === this.lastMessage && label === this.lastLabel) {
      this.repeatedMessageCount += 1;

      clearLine(3);
    } else {
      this.repeatedMessageCount = 0;
    }

    const output = `\n${chalk
      .bgHex(LOGGER_COLOR_RED)
      .black(` ${label.toUpperCase()} `)} ${chalk.bold.hex(LOGGER_COLOR_RED)(
      `${message}${
        message === this.lastMessage && label === this.lastLabel
          ? ` [x${this.repeatedMessageCount + 1}]`
          : ''
      }`,
    )}\n`;

    console.error(output);

    this.lastLabel = label;
    this.lastColor = LOGGER_COLOR_RED;
    this.lastMessage = message;
  }

  public info(message: string, label = 'info'): void {
    if (!this.enabled) {
      return;
    }

    if (message === this.lastMessage && label === this.lastLabel) {
      this.repeatedMessageCount += 1;

      clearLine(3);
    } else {
      this.repeatedMessageCount = 0;
    }

    const output = `\n${chalk.bgGreen.black(
      ` ${label.toUpperCase()} `,
    )} ${chalk.bold.green(
      `${message}${
        message === this.lastMessage && label === this.lastLabel
          ? ` [x${this.repeatedMessageCount + 1}]`
          : ''
      }`,
    )}\n`;

    console.log(output);

    this.lastLabel = label;
    this.lastColor = LOGGER_COLOR_GREEN;
    this.lastMessage = message;
  }

  public log(message: string, label = 'log', additionalmessage = ''): void {
    if (!this.enabled) {
      return;
    }

    if (message === this.lastMessage && label === this.lastLabel) {
      this.repeatedMessageCount += 1;

      clearLine();
    } else {
      this.repeatedMessageCount = 0;
    }

    const day = this.getDay();
    const time = this.getTime();

    const formattedLabel = `[${chalk.white(
      `${label.charAt(0).toUpperCase()}${label.slice(1)}`,
    )}]`;

    const timestamp = `${chalk.gray(
      `${formattedLabel}${' '.repeat(this.logLabelPadding - label.length)}`,
    )} ${chalk.gray(day)} ${chalk.gray(time)} `;

    const mainOutput = this.truncate(
      `${message}${
        message === this.lastMessage && label === this.lastLabel
          ? ` [x${this.repeatedMessageCount + 1}]`
          : ''
      }`,
    );

    const left = `${timestamp} ${chalk.white.bold(mainOutput)}`;
    const right = chalk.gray(additionalmessage);

    const dots = this.renderDots(
      timestamp + mainOutput + label + ' '.repeat(7 - label.length),
    );

    console.log(left, dots, right);

    this.lastMessage = message;
  }

  public sub(message: string): void {
    if (!this.enabled) {
      return;
    }

    this.lastMessage = null;

    const indent = ' '.repeat(this.lastLabel.length + 2);

    const output = `${indent} ${chalk.bold.hex(this.lastColor)(message)}\n`;

    clearLine();

    console.log(output);
  }

  public warn(message: string, label = 'warning'): void {
    if (!this.enabled) {
      return;
    }

    if (message === this.lastMessage && label === this.lastLabel) {
      this.repeatedMessageCount += 1;

      clearLine(2);
    } else {
      this.repeatedMessageCount = 0;
    }

    const output = `\n${chalk
      .bgHex(LOGGER_COLOR_YELLOW)
      .black(` ${label.toUpperCase()} `)} ${chalk.bold.hex(LOGGER_COLOR_YELLOW)(
      `${message}${
        message === this.lastMessage && label === this.lastLabel
          ? ` [x${this.repeatedMessageCount + 1}]`
          : ''
      }`,
    )}\n`;

    console.warn(output);

    this.lastLabel = label;
    this.lastColor = LOGGER_COLOR_YELLOW;
    this.lastMessage = message;
  }
}
