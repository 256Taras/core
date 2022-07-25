import chalk from 'chalk';

export const log = (data: string | number, badge: string = 'nucleon') => {
  const date = new Date();

  const timestamp = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  console.log(chalk.bgGreen(` ${badge.toUpperCase()} `), chalk.green(`[${timestamp}]  ${data}`));
};
