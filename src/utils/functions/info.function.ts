import chalk from 'chalk';

export const info = (data: string) => {
  const output = chalk.bold.green(`\n${data}\n`);

  console.log(output);
};
