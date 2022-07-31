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

  const timestamp = `${chalk.green.bold('$')} ${chalk.gray(day)} ${chalk.gray(
    time,
  )} `;

  const left = `${timestamp} ${chalk.hex('#f8c377').bold(data)}`;
  const right = chalk.gray(type.toUpperCase());

  const dots = chalk.gray(
    '.'.repeat(
      process.stdout.columns - timestamp.length - data.length - type.length - 2,
    ),
  );

  console.warn(left, dots, right);
};
