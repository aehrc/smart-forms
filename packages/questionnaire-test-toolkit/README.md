# @aehrc/questionnaire-test-toolkit

Behavioural test toolkit for FHIR Questionnaire forms: DOM interaction helpers plus a harness
that mounts a questionnaire in the renderer, optionally pre-populated from a patient.

Extracted from `apps/smart-forms-app/src/test/` so that a form's test suite can live beside the
form rather than inside the application. Consumed by the Aboriginal and Torres Strait
Islander Health Check suite in this repository.

## Status: prepared for publication, not yet released

The package is built, packaged and workflow-ready, but no version has been released to npm. The
decision to publish is AEHRC/CSIRO's — publishing means a public name, semver commitments, a
changelog and a named owner, which is an organisational commitment rather than a repository
refactor.

Publication exists to make one thing possible: a form's test suite in **another repository**
consuming these helpers. That is not achievable from a `private: true` workspace package, and it is
the whole reason the build below was added.

## The contract

`src/index.ts` **is** the public API. Everything re-exported there may be relied upon by a form's
test suite. Anything else is internal: which file a helper lives in, how it locates elements, and
any function added to a source file without being re-exported from `index.ts`.

Re-exports are named individually rather than `export *`, so adding a helper to a source file is
not the same act as promising it to consumers.

Consume it as `@aehrc/questionnaire-test-toolkit`, never by relative path — that keeps a later move
to a separate repository a path rewrite rather than a rebuild.

## Built, not consumed as source

`main`, `module`, `types` and `exports` point at `dist/`, produced by `tsup` in dual ESM/CJS with
declarations — the same build the other published packages in this repository use.

An earlier revision shipped `src/index.ts` directly, on the grounds that every consumer already
transforms TypeScript. That holds only *inside* this repository: Vitest does not transform
`node_modules` by default, and the app's `transformIgnorePatterns`
(`/node_modules/(?!(@aehrc|@fontsource)/)`) is a Jest config here that does not travel with the
package. An external consumer would have imported raw TypeScript and failed.

**Run `npm run build -w packages/questionnaire-test-toolkit` after a fresh `npm ci`.** The workspace
symlink now resolves to a package whose `dist/` does not exist until it is built.

React, the renderer, TanStack Query and both testing libraries are left external, so a consumer
never gets a second copy of React or of renderer state. `@types/fhir` is a dependency and
`@types/react` a peer because both appear in the emitted declarations (`fhir/r4` for `Patient` and
`Questionnaire`, `react/jsx-runtime` for the wrapper's return type).

## Notes for maintainers

**Seven helpers are not exercised by any suite in this repository.** `inputFile`, `inputTime`,
`inputReference`, `inputUrl`, `chooseQuantityOption`, `inputOpenChoiceOtherText` and
`getAnswerRecursiveByLabel` are unused by the Aboriginal and Torres Strait Islander Health Check suite. They are kept
because this file began as a copy of
`packages/smart-forms-renderer/src/stories/testUtils.ts`, where the storybook stories do use them,
and because the toolkit is meant to be general rather than shaped around its current tenant.
Treat them as untested surface.

**`terminologyServerUrl` is load-bearing — do not remove it.** `BehavioralTestWrapper` passes it to
`buildForm` unless the consumer overrides it through the prop of the same name, and `apps/smart-forms-app/src/test/aboriginalFormExtraction.test.tsx` compares the
requested server URL against this exact value, forwarding matches to the real Ontoserver. Changing
or deleting it breaks that suite. (An earlier revision of this file called it "probably dead" on
the grounds that every suite mocks `fhirclient` to return `{}`. That is untrue of the file above,
which is the one place the constant has an observable effect.)

**The input helpers use `fireEvent`, which cannot see `readOnly`, `disabled` or `pointer-events`.**
A test written with them can therefore assert an interaction a real user cannot perform: a click on
a read-only control is a silent no-op, and `inputText` writes into a read-only field successfully.
Both have been observed in practice. If a test passes but the behaviour looks impossible, check
whether the item or an ancestor is `readOnly` before trusting the green.

**A near-duplicate exists.** `packages/smart-forms-renderer/src/stories/testUtils.ts` is a longer
copy of the same helpers, despite a comment in the original asserting the two are identical.
Merging them is worthwhile and deliberately out of scope here.
