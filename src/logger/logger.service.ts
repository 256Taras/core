import chalk from 'chalk';
import { Configurator } from '../configurator/configurator.service.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { stripAnsiChars } from '../utils/functions/strip-ansi-chars.function.js';
import {
  LOGGER_COLOR_GREEN,
  LOGGER_COLOR_RED,
  LOGGER_COLOR_YELLOW,
} from './constants.js';
import { clearLine } from './functions/clear-line.function.js';

@Service()
export class Logger {
  private enabled = this.configurator.entries.logger?.enabled ?? true;

  private lastColor = '#ffffff';

  private lastLabel: string | null = null;

  private lastMessage: string | null = null;

  private readonly locale = 'en-us';

  private readonly logLabelPadding = 8;

  private logStackingEnabled = this.configurator.entries.logger?.stacking ?? true;

  private readonly paddingSign = ' ';

  private repeatedMessagesCount = 0;

  constructor(private configurator: Configurator) {}

  private getTime(): string {
    const date = new Date();

    return date.toLocaleString(this.locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

  private getTimeDay(): string {
    const date = new Date();

    return date.toLocaleString(this.locale, {
      month: 'short',
      day: 'numeric',
    });
  }

  private handleRepeatedMessage(message: string, label: string): void {
    if (!this.logStackingEnabled) {
      return;
    }

    if (message === this.lastMessage && label === this.lastLabel) {
      this.repeatedMessagesCount += 1;

      clearLine();
    } else {
      this.repeatedMessagesCount = 0;
    }
  }

  private renderDots(message: string): string {
    const outputLength = stripAnsiChars(message).length;
    const sign = '.';

    return chalk.gray(sign.repeat(process.stdout.columns - outputLength - 12));
  }

  private truncate(message: string): string {
    const maxLength = Math.trunc(process.stdout.columns / 2);

    return stripAnsiChars(message).length > maxLength
      ? `${message.slice(0, maxLength)}...`
      : message;
  }

  private write(
    message: string,
    label: string | null,
    isSub = false,
    color = '#ffffff',
  ): void {
    if (!this.enabled) {
      return;
    }

    let output = '';

    if (isSub) {
      this.lastMessage = null;

      const indent = this.paddingSign.repeat((this.lastLabel ?? '').length + 2);

      output = `${indent} ${chalk.bold.hex(this.lastColor)(message)}\n`;

      clearLine();
    } else {
      this.handleRepeatedMessage(message, label!);

      output = `\n${chalk
        .bgHex(color)
        .black(` ${label!.toUpperCase()} `)} ${chalk.bold.hex(color)(
        `${message}${
          this.logStackingEnabled &&
          message === this.lastMessage &&
          label === this.lastLabel
            ? chalk.gray(` [x${this.repeatedMessagesCount + 1}]`)
            : ''
        }`,
      )}\n`;
    }

    switch (this.lastLabel) {
      case 'error':
        console.error(output);

        break;

      case 'warning':
        console.warn(output);

        break;

      case 'log':
      case 'info':
      default:
        console.log(output);

        break;
    }

    if (!isSub) {
      this.lastLabel = label;
      this.lastColor = color;
      this.lastMessage = message;
    }
  }

  public $disable(): void {
    this.enabled = false;
  }

  public $disableStacking(): void {
    this.logStackingEnabled = false;
  }

  public error(message: string, label = 'error'): void {
    this.write(message, label, false, LOGGER_COLOR_RED);
  }

  public info(message: string, label = 'info'): void {
    this.write(message, label, false, LOGGER_COLOR_GREEN);
  }

  public log(message: string, label = 'log', additionalMessage = ''): void {
    if (!this.enabled) {
      return;
    }

    this.handleRepeatedMessage(message, label);

    if (label.length > 8) {
      label = `${label.slice(0, 4)}...`;
    }

    const day = this.getTimeDay();
    const time = this.getTime();

    const formattedLabel = `[${chalk.white(
      `${label.charAt(0).toUpperCase()}${label.slice(1)}`,
    )}]`;

    const timestamp = `${chalk.gray(
      `${formattedLabel}${this.paddingSign.repeat(
        this.logLabelPadding - label.length,
      )}`,
    )} ${chalk.gray(day)} ${chalk.gray(time)} `;

    const output = this.truncate(
      `${message}${
        this.logStackingEnabled &&
        message === this.lastMessage &&
        label === this.lastLabel
          ? chalk.gray(` [x${this.repeatedMessagesCount + 1}]`)
          : ''
      }`,
    );

    const left = `${timestamp} ${chalk.white.bold(output)}`;
    const right = chalk.gray(additionalMessage);

    const dots = this.renderDots(
      `${timestamp}${output}${label}${this.paddingSign.repeat(7 - label.length)}`,
    );

    console.log(left, dots, right);

    this.lastLabel = label;
    this.lastMessage = message;
  }

  public sub(message: string): void {
    this.write(message, this.lastLabel, true);
  }

  public warn(message: string, label = 'warning'): void {
    this.write(message, label, false, LOGGER_COLOR_YELLOW);
  }
}
