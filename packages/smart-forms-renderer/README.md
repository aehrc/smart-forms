# Smart Forms Renderer

A React-based library that contains the Questionnaire renderer used in the Smart Forms app. 
It acts as a reference implementation for the [SDC Form Filler](https://hl7.org/fhir/uv/sdc/CapabilityStatement-sdc-form-filler.html).

<h4><a href="https://smartforms.csiro.au/docs/dev">Check out the documentation 📚</a></h4>

<h4><a href="https://smartforms.csiro.au/docs">Check out Questionnaire examples in Storybook 📚</a></h4>

## Entry points

| Import | Contains |
| ------ | -------- |
| `@aehrc/smart-forms-renderer` | The full renderer, including the Material UI component tree. |
| `@aehrc/smart-forms-renderer/engine` | The form engine only: the stores, `buildForm`, response traversal, repopulation and observation-based extraction. No UI package loads at runtime, so it suits a host that renders the form itself. |

`/engine` is a strict subset of the root barrel, so nothing is public by virtue of
appearing there alone. Both are bundler targets: the package ships ES modules with
extensionless specifiers and does not set `"type": "module"`, so it is not loadable by
Node directly.

Deep imports of internal `lib/...` paths still resolve, but they are a compatibility
surface rather than API. Prefer the root barrel or `/engine`.

View the changelog [here](https://github.com/aehrc/smart-forms/blob/main/CHANGELOG.md).

We recently updated to v1.0.0 which includes some breaking changes. Please refer to the [migration guide](https://github.com/aehrc/smart-forms/blob/main/MIGRATION-v1.0.md) for more information.

---

Copyright © 2025, Commonwealth Scientific and Industrial Research Organisation (CSIRO) ABN 41 687 119 230. All rights reserved.
