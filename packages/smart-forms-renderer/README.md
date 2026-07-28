# Smart Forms Renderer

A React-based library that contains the Questionnaire renderer used in the Smart Forms app. 
It acts as a reference implementation for the [SDC Form Filler](https://hl7.org/fhir/uv/sdc/CapabilityStatement-sdc-form-filler.html).

<h4><a href="https://smartforms.csiro.au/docs/dev">Check out the documentation 📚</a></h4>

<h4><a href="https://smartforms.csiro.au/docs">Check out Questionnaire examples in Storybook 📚</a></h4>

View the changelog [here](https://github.com/aehrc/smart-forms/blob/main/CHANGELOG.md).

We recently updated to v1.0.0 which includes some breaking changes. Please refer to the [migration guide](https://github.com/aehrc/smart-forms/blob/main/MIGRATION-v1.0.md) for more information.

## Typography

The renderer theme asks for the [Inter](https://rsms.me/inter/) typeface, falling back to the platform's default sans-serif font. The library does not load any webfont itself, so if you want the intended typography, provide Inter in your own application. The simplest way is to self-host it:

```bash
npm install @fontsource/inter
```

```ts
// In your application entrypoint
import '@fontsource/inter';
```

Linking a hosted stylesheet or declaring your own `@font-face` works equally well. If Inter is not available the renderer still lays out correctly, it just uses your platform's default sans-serif font.

---

Copyright © 2025, Commonwealth Scientific and Industrial Research Organisation (CSIRO) ABN 41 687 119 230. All rights reserved.
