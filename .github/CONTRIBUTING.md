<div align="center">
  <img src="../.github/logo-full.png" width="220">

  <h1>Northle Contributing Guide</h1>

  <p align="center">A short instruction guide for contributing to Northle.js framework repositories.</p>

  <h4>
    <a href="../README.md">Documentation</a>
    <span> · </span>
    <a href="CONTRIBUTING.md">Contributing</a>
  </h4>
</div>

<!-- omit in toc -->
### 📓 Table of Contents

- [Creating Pull Requests](#creating-pull-requests)
- [Development setup](#development-setup)
  - [Core package](#core-package)
  - [App template](#app-template)

## Creating Pull Requests

Contributing in this repository is based on GitHub's [Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests). Before creating a pull request, please read through the following rules:

- Always provide a short description to your pull request. You can also open an [Issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues) before working on it.
- Commit messages must follow a specific convention - they must have imperative form and first letter must be uppercased, for example: `git commit -m "Add feature x"`.

## Development setup

### Core package

First, clone the `@northle/core` package repository and install its dependencies:

```shell
git clone https://github.com/northle/core.git
cd core

# If you do not have yarn installed
$ npm install -g yarn

yarn install
yarn build
yarn link
```

Then, change the import paths in the `src/database` directory files: `PrismaClient` and `User` should be imported from `../../../app-template/node_modules/@prisma/client` in development mode. Don't forget to change it back before creating a Pull Request!

### App template

Next, clone app template repository (in the parent folder of the `core` repository):

```shell
git clone https://github.com/northle/app-template.git
cd app-template

cp .env.example .env

yarn install
yarn link @northle/core
yarn key:generate
```

::: info
Remember that after every dependency addition / removal you need to run `yarn link` again.
:::

Then, set the `DEVELOPER_MODE` variable in `.env` file to `true`.

To compile TypeScript code, run `yarn build:watch` command.

After all these steps, run `yarn start` in the `app-template` directory. Your app will be available on `http://localhost:7000` by default. You can change the port in `.env` file.
