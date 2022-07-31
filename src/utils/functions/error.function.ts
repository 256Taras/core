import chalk from 'chalk';

export const error = (data: string, type: string = 'error') => {
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

  const timestamp = `${chalk.red.bold('$')} ${chalk.gray(day)} ${chalk.gray(
    time,
  )} `;

  const left = `${timestamp} ${chalk.red.bold(data)}`;
  const right = chalk.gray(type.toUpperCase());

  const dots = chalk.gray(
    '.'.repeat(
      process.stdout.columns - timestamp.length - data.length - type.length - 2,
    ),
  );

  console.error(left, dots, right);
};
