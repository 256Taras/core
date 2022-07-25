import chalk from 'chalk';

export const error = (data: string | number, badge: string = 'nucleon') => {
  const date = new Date();

  const timestamp = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  console.error(
    chalk.bgRed(` ${badge.toUpperCase()} `),
    chalk.red(`[${timestamp}]  ${data}`),
  );
};
