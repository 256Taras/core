import { Service } from '../injector/decorators/service.decorator';
import chalk from 'chalk';

@Service()
export class Logger {
  public error(data: string, type: string = 'error'): void {
    const date = new Date();

    const locale = 'en-us';

    const day = date.toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
    });

    const time = date.toLocaleString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: '2-digit',
      hour12: true,
    });

    const timestamp = `${chalk.red.bold('$')} ${chalk.gray(day)} ${chalk.gray(time)} `;

    const maxLength = Math.trunc(process.stdout.columns / 2);
    const main = data.length > maxLength ? data.slice(0, maxLength) + '...' : data;
    const outputLength = (day + time + main + type).length + 18;

    const left = `${timestamp} ${chalk.red.bold(main)}`;
    const right = chalk.gray(type.toUpperCase());

    const dots = chalk.gray('.'.repeat(process.stdout.columns - outputLength));

    console.error(left, dots, right);
  }

  public info(data: string): void {
    const output = chalk.bold.green(`\n${data}\n`);

    console.log(output);
  }

  public log(data: string, type: string = 'info'): void {
    const date = new Date();

    const locale = 'en-us';

    const day = date.toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
    });

    const time = date.toLocaleString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: '2-digit',
      hour12: true,
    });

    const timestamp = `${chalk.green.bold('$')} ${chalk.gray(day)} ${chalk.gray(
      time,
    )} `;

    const maxLength = Math.trunc(process.stdout.columns / 2);
    const main = data.length > maxLength ? data.slice(0, maxLength) + '...' : data;
    const outputLength = (day + time + main + type).length + 18;

    const left = `${timestamp} ${chalk.white.bold(main)}`;
    const right = chalk.gray(type.toUpperCase());

    const dots = chalk.gray('.'.repeat(process.stdout.columns - outputLength));

    console.log(left, dots, right);
  }

  public warn(data: string, type: string = 'warning'): void {
    const date = new Date();

    const locale = 'en-us';

    const day = date.toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
    });

    const time = date.toLocaleString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: '2-digit',
      hour12: true,
    });

    const yellowHex = '#f8c377';

    const timestamp = `${chalk.hex(yellowHex).bold('$')} ${chalk.gray(
      day,
    )} ${chalk.gray(time)} `;

    const maxLength = Math.trunc(process.stdout.columns / 2);
    const main = data.length > maxLength ? data.slice(0, maxLength) + '...' : data;
    const outputLength = (day + time + main + type).length + 18;

    const left = `${timestamp} ${chalk.hex(yellowHex).bold(main)}`;
    const right = chalk.gray(type.toUpperCase());

    const dots = chalk.gray('.'.repeat(process.stdout.columns - outputLength));

    console.warn(left, dots, right);
  }
}
