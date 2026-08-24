# Provenance — Questionnaire-GPChronicConditionManagementPlanAssembled.json

This file is a **snapshot**, not a source. It is the output of a `Questionnaire/$assemble` over
modular questionnaires that are not in this repository. Nothing here can rebuild it; this record
exists so that someone who has never seen this repository knows where it came from and how to
replace it.

## What the artifact says about itself

| Field | Value |
|---|---|
| `url` | `http://www.health.gov.au/assessments/GPChronicConditionManagementPlan` |
| `version` | `0.1.0` (`versionAlgorithm` = `semver`) |
| `status` | **`draft`** |
| `experimental` | `false` |
| `date` | `2026-06-10` |
| `publisher` | AEHRC CSIRO |
| `copyright` | © 2026 Australian Government Department of Health, Disability and Ageing — "published for evaluation and local testing only, pending selection of a final licence" |
| Size | 636 KB, 1 root item |

Related canonicals it depends on live under `https://gpccmp.csiro.au/ig/` (the GP CCMP
implementation guide) and `https://healthterminologies.gov.au/` (NCTS).

`status: draft` is the load-bearing fact. Every hard-coded `linkId` in `../test/` —
`clinicaldetails-observations-maingrid-height-newresultdate` and its kin — is a contract with an
artifact that is explicitly not final.

## How it entered this repository

| | |
|---|---|
| Commit | `f0c48fff` — "Add minimal working behavioral test for gpccmp" |
| Committed | 2026-07-20 |
| By | Vadim Laletin |
| Original path | `apps/smart-forms-app/src/test/gpccmp/data/resources/Questionnaire/` |
| Moved here | Phase 2 of the GP CCMP extraction, via `git mv` (history follows the rename) |

The file arrived in a single commit, already assembled. **Not recorded, and not recoverable from
this repository:** the exact retrieval URL, the retrieval date, the versions of the modular
sub-questionnaires that went into the assembly, and which `$assemble` implementation ran. Anyone
who learns any of these should add them here.

## Refresh procedure

There is no automated refresh. To replace this snapshot:

1. **Obtain the modular sources.** They are not in this repository and may not be CSIRO's to hand
   over. Ask the GP CCMP IG maintainers (`https://gpccmp.csiro.au/ig/`) for the root questionnaire
   plus every `subQuestionnaire` it references, at a stated version.
2. **Assemble.** `packages/sdc-assemble` implements `$assemble`; the repository also runs an
   assemble service (`services/`, `push-assemble-image.sh`). Either can produce the artifact —
   `assembleQuestionnaire` in the app's `src/utils/assemble.ts` shows the call shape.
3. **Replace this file in place,** keeping the filename. The four test files import it by relative
   path, so nothing else needs to change.
4. **Update the table above** — new `version`, new `date`, the sub-questionnaire versions used, and
   the date you retrieved them.
5. **Re-run `npm test` in `forms/gpccmp`** and compare test by test against the expected state in
   [`../README.md`](../README.md) → *Known failures*. Expect `linkId` drift: a failing
   `findByLinkIdOrLabel` after a refresh is a renamed item, not a regression.

Do **not** add a second copy alongside this one. The application already carries the Aboriginal and
Torres Strait Islander Health Check at both `0.1.0` and `0.4.0` — 700 KB and 1.07 MB side by side.
Without a refresh procedure you do not update fixtures, you collect them; that is the specific
outcome this record exists to prevent.

## Target state

Assembling from modular sources at build time is strictly better than storing the output, and the
machinery already exists in `packages/sdc-assemble`. It is blocked only on obtaining the sources.
If they never arrive, this package is permanently a snapshot consumer and this file is the whole of
its provenance.
