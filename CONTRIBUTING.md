# How to contribute

Thanks for your interest in contributing to Smart Forms.

You can find out a bit more about Smart Forms by reading the [README](README.md)
file within this repository.

## Reporting issues

Issues can be used to:

* Report a defect
* Request a new feature or enhancement
* Ask a question

New issues will be automatically populated with a template that highlights the
information that needs to be submitted with an issue that describes a defect. If
the issue is not related to a defect, please just delete the template and
replace it with a detailed description of the problem you are trying to solve.

## Creating a pull request

Please communicate with us (preferably through creation of an issue) before
embarking on any significant work within a pull request. This will prevent
situations where people are working at cross-purposes.

Your branch should be named `issue/[GitHub issue #]`.

If possible, it is recommended to merge the `main` branch into your branch first before creating a pull request.

## Development dependencies

You will need the following software to build the solution:

* Node.js 16.x or 18.x

To build and install locally, run in the root folder:
```
npm i
```

For streamlining purposes, we encourage contributions to the [@aehrc/smart-forms-renderer](https://www.npmjs.com/package/@aehrc/smart-forms-renderer) package in **packages/smart-forms-renderer**.
The easiest way to test your changes is to use Storybook, which can be run via:
```
npm run storybook
```


### Coding conventions

This repository uses [Prettier](https://prettier.io/), please use it to
reformat your code before pushing.

## Code of conduct

Before making a contribution, please read the
[code of conduct](CODE_OF_CONDUCT.md).
