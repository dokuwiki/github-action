# Github Action and Workflows for DokuWiki Extension Development

Note: this is currently a work in progress. Next steps are:

* [ ] Move to dokuwiki organization
* [ ] Add support for phpcs
* [ ] Have a single workflow that runs all the other workflows
* [ ] Improve the matrix (different php versions for different branches)
* [ ] Figure out if we can make the matrix overridable
* [ ] Implement and test it in a couple of extensions


This repository contains a Github Action and Workflows for DokuWiki Extension Development.

The idea is to have a central place to define which PHP versions should be tested against and easily provide new tooling for extension developer without them having to update all their plugins and templates for workflow changes.

## Github Action

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

Simply create a `.github/workflows/dokuwiki.yml` file with the following contents in your extension repository and all standard tooling will be run on every push and on pull requests.

```
name: DokuWiki Default Jobs
on: [push, pull_request]

jobs:
    Unit Tests:
        uses: splitbrain/dokuwiki-gh-action/.github/workflows/test.yml@main
```


