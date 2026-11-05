# Change log

This log documents changes for
[@aehrc/questionnaire-test-toolkit](https://www.npmjs.com/package/@aehrc/questionnaire-test-toolkit).

## Unreleased

Except where a PR is linked below, the entries in this section are implemented in
[#2194](https://github.com/aehrc/smart-forms/pull/2194).

### Added

- Added optional `user` (`Practitioner`) and `fhirContext` props to
  `BehavioralTestWrapper` for population alongside a supplied patient, including
  practitioner and PractitionerRole launch context. The practitioner and resolved
  launch context are available to renderer expressions, and changing either prop
  reruns population. Like `requestDefinitions`, either prop without a patient
  throws. See [#2193](https://github.com/aehrc/smart-forms/pull/2193).
- Added optional `questionnaireResponse` to `BehavioralTestWrapper` to load a
  saved response and resume or amend a form. When supplied together with a
  patient, the saved answers take precedence over newly generated population
  answers while population still runs to resolve launch context. The saved
  response is cloned before use, so caller-owned fixtures are never mutated.
- Added optional `comparisonSourceResponse` to `BehavioralTestWrapper`. When
  supplied, the Save button performs modified-only extraction against it instead
  of extracting everything; changing it updates the next extraction without
  rebuilding the form or losing unsaved edits.
- Added optional `fetchResourceCallback` to `BehavioralTestWrapper`, mutually
  exclusive with `requestDefinitions` and requiring a patient. The callback
  receives the same query URL and request configuration population uses, making
  it the seam for suite-owned strict fixtures and request spies. A rejected
  request fails the harness visibly even when the population module would only
  report a warning; changing the callback rebuilds the form like any other
  population input.
- Initialisation failures now render a visible error (including the failure
  reason) instead of silently leaving an unbuilt or stale form; the Save button
  is not rendered after a failure.

### Fixed

- Fixed rejected population callbacks with empty error messages allowing
  initialisation to continue. These failures now render an error without Save.
- Fixed `selectTab` collapsing an already expanded accordion section. Selecting
  an expanded section now leaves it open; buttons without `aria-expanded` retain
  their existing click behavior. See [#2193](https://github.com/aehrc/smart-forms/pull/2193).
- Fixed `getBirthDateForAge` converting the intended local calendar date through
  UTC, which could shift the date or year in timezones ahead of UTC. It now
  formats the local calendar date directly. Invalid target dates (e.g.
  29 February in a non-leap year) still roll over per the `Date` constructor;
  suites with a clinical leap-day policy should use explicit DOB fixtures.
- Fixed `invokeExtract` accepting a callback from an earlier extraction when a
  Save click's own callback was still pending. The helper now waits for a new
  callback call from the click it dispatched.

## [0.1.0] - 2026-10-13

### Added

- Initial published release, providing `BehavioralTestWrapper` with optional
  patient-based population, questionnaire interaction and inspection helpers,
  and `invokeExtract` for testing extraction through the public package API.

[0.1.0]: https://github.com/aehrc/smart-forms/releases/tag/questionnaire-test-toolkit%400.1.0
