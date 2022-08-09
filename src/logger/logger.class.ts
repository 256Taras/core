import { Service } from '../injector/decorators/service.decorator';
import chalk from 'chalk';

@Service()
export class Logger {
  private readonly colorYellow = '#f8c377';

  private readonly mark = '$';

  private getDay(): string {
    const date = new Date();

    return date.toLocaleString('en-us', {
      month: 'short',
      day: 'numeric',
    });
  }

  private getTime(): string {
    const date = new Date();

    return date.toLocaleString('en-us', {
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
    const truncated = data.length > maxLength ? data.slice(0, maxLength) + '...' : data;

    return truncated;
  }

  public error(data: string, type: string = 'error'): void {
    const day = this.getDay();
    const time = this.getTime();

    const timestamp = `${chalk.red.bold(this.mark)} ${chalk.gray(day)} ${chalk.gray(time)} `;

    const main = this.truncate(data);

    const left = `${timestamp} ${chalk.red.bold(main)}`;
    const right = chalk.gray(type.toUpperCase());

    const dots = this.renderDots(day + time + main + type);

    console.error(left, dots, right);
  }

  public info(data: string): void {
    const output = chalk.bold.green(`\n${data}\n`);

    console.log(output);
  }

  public log(data: string, type: string = 'info'): void {
    const day = this.getDay();
    const time = this.getTime();

    const timestamp = `${chalk.green.bold(this.mark)} ${chalk.gray(day)} ${chalk.gray(
      time,
    )} `;

    const main = this.truncate(data);

    const left = `${timestamp} ${chalk.white.bold(main)}`;
    const right = chalk.gray(type.toUpperCase());

    const dots = this.renderDots(day + time + main + type);

    console.log(left, dots, right);
  }

  public warn(data: string, type: string = 'warning'): void {
    const day = this.getDay();
    const time = this.getTime();

    const timestamp = `${chalk.hex(this.colorYellow).bold(this.mark)} ${chalk.gray(
      day,
    )} ${chalk.gray(time)} `;

    const main = this.truncate(data);

    const left = `${timestamp} ${chalk.hex(this.colorYellow).bold(main)}`;
    const right = chalk.gray(type.toUpperCase());

    const dots = this.renderDots(day + time + main + type);

    console.warn(left, dots, right);
  }
}
