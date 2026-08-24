# @aehrc/gpccmp-form

The GP Chronic Condition Management Plan questionnaire and the behavioural test suite that
exercises it.

```
questionnaire/   the assembled Questionnaire, plus PROVENANCE.md
test/            four behavioural suites and the shared setup file
```

## Running

```sh
npm test              # jsdom
npm run test-headed   # real chromium via VITEST_HEADED
```

The four `packages/*` libraries must be built first — from the repository root:

```sh
npm run build-all-deps-first-run
```

## Why it lives outside `packages/`

`packages/` means "publishable SDC library". A form is content, not a library. The `forms/` prefix
is also sized for a sibling: the Aboriginal and Torres Strait Islander Health Check suite is
expected to follow, and the boundary is meant to be an obvious `git subtree` split rather than a
negotiated one.

Three invariants keep that split mechanical, and each is cheap to hold and expensive to retrofit:

- every `@aehrc` dependency is consumed by semver range, never by relative path;
- the test toolkit's interface stays publishable — no private module paths, no reach into
  application source;
- `questionnaire/PROVENANCE.md` stays current, so the form remains reproducible by someone who has
  never seen this repository.

## The questionnaire is a snapshot

`questionnaire/Questionnaire-GPChronicConditionManagementPlanAssembled.json` is the *output* of a
`$assemble` over modular questionnaires that are not in this repository. Assembling from those
sources at build time would be strictly better and the machinery already exists in
`packages/sdc-assemble`, but it is blocked on obtaining them. Until they arrive this package is
permanently a snapshot consumer.

The artifact is `status: draft` at version `0.1.0`. Every hard-coded `linkId` in `test/` is a
contract with something explicitly not final, so a failing lookup after a refresh is a renamed item
rather than a regression. Do not reformat the file and do not add a second copy beside it — read
`questionnaire/PROVENANCE.md` before touching it.

## Terminology

Three of the questionnaire's `choice` items are backed by external `answerValueSet`s. `test/setup.ts`
mocks `fhirclient` so the suite makes no network calls, and answers `$expand` from the real
expansions vendored in `test/terminology/` — see that directory's `PROVENANCE.md` for the server,
the retrieval date, and how to refresh them.

Anything not in that directory still resolves to `{}`, which renders a `choice` item with no options
and therefore no input element at all. A test that suddenly cannot find a select is usually a
questionnaire that gained a ValueSet the fixtures do not cover.

### The suite runs offline, and enforces it

`fhirclient` is the only HTTP client in the dependency chain — the renderer, `sdc-populate` and
`sdc-template-extract` pull in no `axios`, `undici` or `node-fetch` — so mocking it is enough to
take the suite off the network. Verified by instrumenting `fetch`, `XMLHttpRequest` and
`node:http`/`node:https` across a full run: zero egress.

`test/setup.ts` then makes `fetch` and `XMLHttpRequest.open` throw, so it stays that way. Without
that, a renderer that started calling `fetch` directly would quietly reach the real Ontoserver in
CI — slow, flaky, and green for the wrong reason. If you hit
`Network access from a test`, add the response to `test/terminology/` or mock the caller; do not
relax the guard.

## Two items that only population can reach

`patient-contact-homeaddress` is `readOnly: true` in the questionnaire, so everything under it —
including the `No fixed address` checkbox — renders with `pointer-events: none`. The checkbox
carries an initialExpression reading the `no-fixed-address` extension off the patient's home
address, which is the design: the flag comes from the patient record, not from the user.

So `conditionsEnableWhenBehavior` › *for patients without a home address* renders with a `Patient`
that has that extension rather than clicking anything. Tests that need this state must populate;
clicking is a silent no-op.

Note that its sibling, *for patients with a home address*, still types into that same read-only
group. It passes because the toolkit's `inputText` uses `fireEvent.change`, which ignores
`readOnly`. That is a pre-existing weakness in the test, not in the renderer — it asserts an
interaction a real user cannot perform. Left alone here; worth revisiting when the toolkit's input
helpers are next touched.

## Running the suite in CI

`.github/workflows/vitest_gpccmp.yml` builds the four `packages/*` libraries, typechecks this
package, and runs the suite on every push and pull request. A warm local verification on 2026-08-24
ran all 25 tests in 152.56–195.63 seconds; the four builds, typecheck, and tests took
181.51–230.76 seconds in total, excluding `npm ci`. GitHub Actions reports the authoritative CI
runtime on each run. Treat any failure as a real regression; there is no expected-failure list to
compare against any more.
