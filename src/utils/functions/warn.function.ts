import chalk from 'chalk';

export const warn = (data: string, type: string = 'warning') => {
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
};
