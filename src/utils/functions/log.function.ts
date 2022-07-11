import chalk from 'chalk';

export const log = (data: string | number) => {
  const date = new Date();

  const timestamp = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  console.log(chalk.green(`[nucleon] [${timestamp}] ${data}`));
};
