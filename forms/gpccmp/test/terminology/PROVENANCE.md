# Vendored ValueSet expansions

The renderer resolves every external `answerValueSet` through a terminology server. These tests must
not make network calls, so `../setup.ts` mocks `fhirclient` and answers `$expand` requests from the
files in this directory.

Each file is the response of a real `$expand`, so the codes and display strings are the ones a user
would see. Nothing here is hand-written — a `choice` item whose options were invented would let a
test pass against terminology that does not exist.

## How they were retrieved

| File | ValueSet | Version |
|---|---|---|
| `smoking-status-1.json` | `https://healthterminologies.gov.au/fhir/ValueSet/smoking-status-1` | 1.0.0 |
| `alcohol-intake-status-1.json` | `https://healthterminologies.gov.au/fhir/ValueSet/alcohol-intake-status-1` | 1.0.0 |
| `australian-states-territories-2.json` | `https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2` | 2.0.2 |

- Server: `https://r4.ontoserver.csiro.au/fhir` — the same server the suite names in
  `@aehrc/questionnaire-test-toolkit`'s `terminologyServerUrl`.
- Retrieved: 2026-08-24.
- Request: `GET {server}/ValueSet/$expand?url={valueset url}`, `Accept: application/fhir+json`.

To refresh one:

```sh
curl -s -H 'Accept: application/fhir+json' \
  'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://healthterminologies.gov.au/fhir/ValueSet/smoking-status-1' \
  | jq 'del(.expansion.identifier, .expansion.timestamp)' > smoking-status-1.json
```

## The one edit made to each response

`expansion.identifier` and `expansion.timestamp` are stripped. Both change on every request, so
keeping them would make the fixture look modified whenever it was refreshed. Everything else,
including the `copyright` element, is as the server returned it — the ADHA and SNOMED CT terms
require that statement to travel with every copy.

## What this does not do

The mock answers `$expand` for these three ValueSets and returns `{}` for anything else, which is
what the mock did for everything before these files existed. Adding a `choice` item backed by a
fourth external ValueSet will render it with no options; add its expansion here.

The expansions are a snapshot. SNOMED CT is versioned — `smoking-status-1` expanded against the
`20260731` Australian edition — so a refresh can legitimately change displays and break a test that
selects by display text. That is the fixture doing its job.
