# @aehrc/questionnaire-test-toolkit

Behavioural test toolkit for FHIR Questionnaire forms: DOM interaction helpers plus a harness
that mounts a questionnaire in the renderer, optionally pre-populated from a patient.

Extracted from `apps/smart-forms-app/src/test/` so that a form's test suite can live beside the
form rather than inside the application. Consumed by the Aboriginal and Torres Strait
Islander Health Check suite in this repository.

## The contract

`src/index.ts` **is** the public API. Everything re-exported there may be relied upon by a form's
test suite. Anything else is internal: which file a helper lives in, how it locates elements, and
any function added to a source file without being re-exported from `index.ts`.

Re-exports are named individually rather than `export *`, so adding a helper to a source file is
not the same act as promising it to consumers.

Consume it as `@aehrc/questionnaire-test-toolkit`, never by relative path — that keeps a later move
to a separate repository a path rewrite rather than a rebuild.

See the [Changelog](./CHANGELOG.md) for consumer-visible changes.

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

## Wrapper props and population

`BehavioralTestWrapper` populates the questionnaire before mounting it. `patient` is required for
any population: supplying `requestDefinitions` without a patient throws synchronously. The
optional `user` (a `Practitioner`) and `fhirContext` (launch context resources, resolved through
`requestDefinitions` like any other fetch) join the patient in population and in the renderer's
launch context, so expressions and initial values that read `%user`, `%context` or related
variables work in tests. All three props are dependencies of the population effect: changing any
of them repopulates the form.

`selectTab` is idempotent for accordion-style tabs: selecting a tab whose button already reports
`aria-expanded="true"` leaves it open instead of collapsing it. Tabs without an
`aria-expanded` attribute keep the ordinary click behaviour.

## Saved responses and comparison extraction

`questionnaireResponse` loads a saved response, e.g. to resume an in-progress form or amend a
completed one. Without a patient the form renders the saved answers as-is. With a patient,
population still runs to resolve patient/user/FHIR launch context, but the saved answers take
precedence over newly generated ones; calculated expressions resolve from the populated context
as they do in production. Generated answers are never merged into the saved response. Changing
`questionnaireResponse` rebuilds the form from the new response.

`comparisonSourceResponse` switches the Save button from full extraction to modified-only
extraction against that baseline. It is independent of the loaded response — production prepares
its comparison through fresh population, and the test supplies that baseline explicitly.
Changing only `comparisonSourceResponse` updates the next extraction without rebuilding the form
or losing unsaved edits.

Both responses are cloned before use, so caller-owned fixtures are never mutated by the wrapper,
population, or extraction.

## Initialisation failures

A failed initialisation renders a visible error (a `[data-testid="toolkit-init-error"]` element
with the failure reason) and no Save button. This includes a failed population step, even when a
saved response was supplied. Rejected population callbacks fail even if their error message is empty.

## Dates and clocks

`getBirthDateForAge(ageInYears)` returns the intended local calendar date for the process
timezone. Suites should run with a fixed `TZ` (e.g. `TZ=Australia/Sydney`) and, for
date-sensitive assertions, control the clock. Use Date-only clock control so the renderer's
debounced store updates and Testing Library timers continue to run. Clinical age policies
(especially leap-day handling) should use explicit DOB fixtures rather than
`getBirthDateForAge`.

## Strict population fixtures and request spies

`fetchResourceCallback` is the seam for suite-owned population fixtures: the callback receives
the exact query URL population issues (e.g.
`QuestionnaireResponse?questionnaire=...&status=completed&_count=1&_sort=-authored&patient=...`
or `Observation?code=8867-4&...`). Serve known queries with server-shaped searchset Bundles
(an explicit empty Bundle for an expected empty search) and reject unexpected queries — the
wrapper turns a rejected request into a visible initialisation failure even when the population
module only warns. `requestDefinitions` remains the default adapter and the two are mutually
exclusive; a patient is required for either. Keep callback references stable across re-renders
unless you want a rebuild.

## Repeat group helpers

`addRepeatGroup` and `removeRepeatGroup` target the renderer's stacked repeat instances (groups
with `repeats: true` and no `gtable`/`check-box` item control). The add helper returns the new
instance container, which can be passed directly to the scoped input helpers:
`inputText(await addRepeatGroup(container, 'Medications'), 'Medication name', 'Ibuprofen')`.
For a `gtable` repeat, use the table rows directly. Nested repeat groups' buttons are never
matched by accident. A hidden Add button fails without modifying sibling or enclosing collections.
If the same nested group appears in multiple outer instances, pass the relevant outer instance
container; an ambiguous collection match is rejected before clicking.

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

**The input helpers reject impossible interactions.** `inputText`, `checkCheckBox`, `inputFile`,
`inputDateTime`, `checkRadioOption`, `checkCheckboxOption`, `chooseSelectOption`,
`chooseQuantityOption` and `inputOpenChoiceOtherText` fail with the question identifier and
reason when the target control is disabled, read-only, or inside a disabled fieldset. `fireEvent`
cannot see these states, so a test written against a read-only control now fails loudly instead
of silently performing an interaction a real user cannot. If a test passes but the behaviour
looks impossible, check whether the item or an ancestor is `readOnly` before trusting the green.

**A near-duplicate exists.** `packages/smart-forms-renderer/src/stories/testUtils.ts` is a longer
copy of the same helpers, despite a comment in the original asserting the two are identical.
Merging them is worthwhile and deliberately out of scope here.
