# GitHub Action and Workflows for DokuWiki Extension Development

This repository contains a GitHub Action and reusable workflows for DokuWiki Extension Development.

By simply reusing the provided standard workflow, extension developer always have an up-to-date toolchain for their development. This includes:

* correct PHP versions for unit testing against DokuWiki stable and master
* code style checks
* improvements to the toolchain are automatically applied to all extensions using the workflow

## GitHub Action

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

## Workflows

The workflows defined in this repository are designed to be reusable for any DokuWiki extension. They are designed to be used in a repository that contains a single DokuWiki extension.

Simply create a `.github/workflows/dokuwiki.yml` file with the following contents in your extension repository and all standard tooling will be run on every push and on pull requests. It will also run once a month to check for updates to the toolchain and DokuWiki updates.

```
name: DokuWiki Default Tasks
on:
  push:
  pull_request:
  schedule:
    - cron: '0 5 1 * *' # run on the first of every month at 5am UTC

jobs:
  all:
    uses: dokuwiki/github-action/.github/workflows/all.yml@main
```


