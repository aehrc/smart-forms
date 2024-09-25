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

You will need the following software to build the solution and run the tests:

* Node.js 18.x or later versions

To build and install locally, run in the root folder:
```
npm i
```

For streamlining purposes, we encourage contributions to the [@aehrc/smart-forms-renderer](https://www.npmjs.com/package/@aehrc/smart-forms-renderer) package in **packages/smart-forms-renderer**.
The easiest way to test your changes is to use Storybook, which can be run via:
```
npm run storybook
```

## Vite-specific caveats
The `vite.config.ts` file in the `@aehrc/smart-forms-renderer` package contains a `resolve: { preserveSymlinks: true }` config, when used alongside `optimizeDeps` and `build.commonjsOptions` allows Vite to use CommonJS modules in the package properly.

This config is essential for the package to properly build in deployments, but it breaks `tsc --watch` by ignoring changes. 
To work around this, comment out the config during development and uncomment it (or just don't add it to git) before pushing changes.
```
...
// resolve: { preserveSymlinks: true }
...
```

### Coding conventions

This repository uses [Prettier](https://prettier.io/), please use it to
reformat your code before pushing.

## Code of conduct

Before making a contribution, please read the
[code of conduct](CODE_OF_CONDUCT.md).
