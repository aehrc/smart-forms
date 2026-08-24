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

## Known failures

Five of the twenty-five tests fail, and have since before the suite moved here. This is the
expected state: compare against it test by test before concluding that anything new has broken.

| Test | Cause |
|---|---|
| `calculation` › Substance use calculations › *Smoking new status date* | ValueSet — `…substanceusegrid-smokingstatus-newresultvalue`, `https://healthterminologies.gov.au/fhir/ValueSet/smoking-status-1` |
| `calculation` › Substance use calculations › *Alcohol consumption new status date* | ValueSet — `…substanceusegrid-alcoholstatus-newresultvalue`, `https://healthterminologies.gov.au/fhir/ValueSet/alcohol-intake-status-1` |
| `conditionsEnableWhenBehavior` › Home Address › *for patients with a home address* | ValueSet — `State`, `https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2` |
| `conditionsEnableWhenBehavior` › Clinic Address › *clinic address* | ValueSet — `State`, same |
| `conditionsEnableWhenBehavior` › Home Address › *for patients without a home address* | **Substantive, untriaged** — see below |

The four ValueSet failures share one cause: `test/setup.ts` mocks `fhirclient` to resolve `{}` for
every request, so a `choice` item backed by an external `answerValueSet` renders with no options
and therefore no input element at all. They cannot pass as written. The fix is valid `$expand`
responses; a working example exists in `packages/smart-forms-renderer/.storybook/preview.tsx`, and
it already covers the states-and-territories ValueSet the two `State` assertions need.

The fifth is different. At `test/conditionsEnableWhenBehavior.test.tsx:70`, after checking *No
fixed address*, the test expects `Street address` to have left the DOM; the lookup resolves
instead. The group `patient-contact-homeaddress-details` is gated by an `enableWhenExpression`
(`%HomeAddressNoFixedAddress.empty() or %HomeAddressNoFixedAddress = false`), not a plain
`enableWhen`. Label ambiguity was ruled out: three items carry the text `Street address`, but in
this render state only the home one is in the DOM. Candidate renderer bug.
