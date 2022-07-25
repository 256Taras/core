import chalk from 'chalk';

export const warn = (data: string | number, badge: string = 'nucleon') => {
  const date = new Date();

  const timestamp = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  console.warn(chalk.bgYellow(` ${badge.toUpperCase()} `), chalk.yellow(`[${timestamp}]  ${data}`));
};
