# @aehrc/questionnaire-test-toolkit

Behavioural test toolkit for FHIR Questionnaire forms: DOM interaction helpers plus a harness
that mounts a questionnaire in the renderer, optionally pre-populated from a patient.

Extracted from `apps/smart-forms-app/src/test/` so that a form's test suite can live beside the
form rather than inside the application. Consumed by both the Aboriginal and Torres Strait
Islander Health Check suite and the GP CCMP suite.

## Status: private

Not published to npm. This is a deliberate decision, not an oversight — publishing means a public
name, semver commitments, a changelog and a named owner, which is an organisational commitment
rather than a repository refactor.

The interface is nonetheless designed as though it will be published, so that the decision stays
cheap to reverse: no imports of private module paths, no reach into application source, and a
contract stated explicitly in `src/index.ts`.

## The contract

`src/index.ts` **is** the public API. Everything re-exported there may be relied upon by a form's
test suite. Anything else is internal: which file a helper lives in, how it locates elements, and
any function added to a source file without being re-exported from `index.ts`.

Re-exports are named individually rather than `export *`, so adding a helper to a source file is
not the same act as promising it to consumers.

Consume it as `@aehrc/questionnaire-test-toolkit`, never by relative path — that keeps a later move
to a separate repository a path rewrite rather than a rebuild.

## Consumed as TypeScript source

`main` and `exports` point at `src/index.ts`. There is no build step: the package is test-only, and
every consumer already runs its tests through a TypeScript transform (Vitest via esbuild, Jest via
`ts-jest`). A `tsup` build and a release workflow can be added later without changing the
interface.

Jest consumers need `@aehrc` to stay transformable — the app's `transformIgnorePatterns`
(`/node_modules/(?!(@aehrc|@fontsource)/)`) already provides this, which is part of why the package
carries the `@aehrc` scope while private.

## Notes for maintainers

**Seven helpers are not exercised by any suite in this repository.** `inputFile`, `inputTime`,
`inputReference`, `inputUrl`, `chooseQuantityOption`, `inputOpenChoiceOtherText` and
`getAnswerRecursiveByLabel` are unused by both the Aboriginal and GP CCMP suites. They are kept
because this file began as a copy of
`packages/smart-forms-renderer/src/stories/testUtils.ts`, where the storybook stories do use them,
and because the toolkit is meant to be general rather than shaped around its current two tenants.
Treat them as untested surface.

**`terminologyServerUrl` is probably dead.** `BehavioralTestWrapper` passes it to `buildForm`, but
every suite mocks `fhirclient` to return `{}` for all requests, so no terminology call reaches the
network and the value has no observable effect. It is exported unchanged for now because removing
it would be a behaviour change; verify before relying on it.

**A near-duplicate exists.** `packages/smart-forms-renderer/src/stories/testUtils.ts` is a longer
copy of the same helpers, despite a comment in the original asserting the two are identical.
Merging them is worthwhile and deliberately out of scope here.
