# GitHub Workflows for DokuWiki Extension Development

This repository contains a GitHub Action and reusable workflows for DokuWiki Extension Development.

By simply reusing the provided standard workflow, extension developers always have an up-to-date toolchain for their development. This includes:

* correct PHP versions for unit testing against DokuWiki stable and master
* code style checks
* automatic code fixes for style, PHP compatibility and deprecated code
* improvements to the toolchain are automatically applied to all extensions using the workflow

## Setup

The workflows defined in this repository are designed to be reusable for any DokuWiki extension. They are designed to be used in a repository that contains a single DokuWiki extension.

When creating a new extension using the [DokuWiki Plugin Wizard](https://pluginwiz.dokuwiki.org), the workflow will be automatically added to your repository.

Using the `addTest` command of the [dev plugin](https://www.dokuwiki.org/plugin:dev) will also add the workflow to your repository.

For manually adding the workflow to your repository, simply create a `.github/workflows/dokuwiki.yml` file with the following contents and all standard tooling will be run on every push and on pull requests. It will also run once a month to check for updates to the toolchain and DokuWiki updates.

```
name: DokuWiki Default Tasks
on:
  push:
  pull_request:
  schedule:
    - cron: '0 5 1 * *' # run on the first of every month at 5am UTC

permissions: write-all

jobs:
  all:
    uses: dokuwiki/github-action/.github/workflows/all.yml@main
```

## Permissions

The workflow example given above will set very relaxed write permissions. This ensures that future updates to the workflows provided in this repository will automatically run on your extension.

The permissons that are actually used in each individual job are defined in the reusable workflows. GitHub will drop privileges to the minimum required for each job.

If you're uncomfortable with giving blanket write permissions, you can also manually define minimal permissions instead, but may have to update your workflow manually in the future.

**Important:** to be able to create Pull Requests, an additional setting has to be enabled in the Web UI of your repository. You'll find it under `Settings` -> `Actions` -> `General` -> `Allow GitHub Actions to create and approve pull requests`. For organizations, this setting can be enabled globally for the whole organization. 

## Devel Details

### test.yml

This workflow executes all unit tests that have been marked with the `@group plugin_example` annotation. The PHP and DokuWiki versions to be used are supplied as JSON via input variables.

The workflow will run on every push and on pull requests.

### cs.yml

This workflow checks the code style of the extension using PHP code sniffer. It uses the coding style defined in DokuWiki master.

It will run on every push and on pull requests.

### autofix.yml

This workflow runs rector and phpcbf to automatically fix coding style issues, PHP compatibility and deprecation issues. The result is committed to a new branch and a pull request is created (See Permissions above for details on how to enable this).

It will run on every push on branches `master`, `main` and `devel`.

### GitHub Action

The action defined in this repository will run the following steps:

1. Determine if your extension is a plugin or template
2. Move your extension to the correct location in a DokuWiki installation (i.e. `lib/plugins` or `lib/tpl`)
3. Clone the DokuWiki core repository
4. Install any dependencies for your extension as defined in a `requirements.txt` file

The action requires the following inputs:

- `branch`: The branch of the DokuWiki core repository to use. Defaults to `master`.

The action will set the following outputs:

- `type`: The type of extension (i.e. `plugin` or `template`)
- `base`: The base name of the extension (i.e. `example`)
- `dir`: The directory name of the extension (i.e. `lib/plugins/example`)

The action is used in the reusable workflows defined in this repository.

The action can be run locally using node 16 and the following command:

```
INPUT_BRANCH=master node ~/path/to/github-action/index.js
```
