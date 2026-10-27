# Change log

This log documents changes for
[@aehrc/questionnaire-test-toolkit](https://www.npmjs.com/package/@aehrc/questionnaire-test-toolkit).

## Unreleased

Except where a PR is linked below, the entries in this section are implemented in
[beda-software/smart-forms#27](https://github.com/beda-software/smart-forms/pull/27); update that
link to the upstream PR number once the pull request is retargeted to `aehrc/smart-forms`.

### Added

- Added optional `user` (`Practitioner`) and `fhirContext` props to
  `BehavioralTestWrapper` for population alongside a supplied patient, including
  practitioner and PractitionerRole launch context. The practitioner and resolved
  launch context are available to renderer expressions, and changing either prop
  reruns population. See [#2193](https://github.com/aehrc/smart-forms/pull/2193).
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
- Added `addRepeatGroup(container, linkIdOrLabel)` and
  `removeRepeatGroup(instanceContainer)` repeat-group helpers. The add helper
  locates the unique repeat collection in scope (never matching nested groups'
  buttons), waits for the instance count to increase, and returns the new
  instance container for the scoped input helpers; the remove helper targets
  the selected instance's own enabled remove button and waits for removal. Both
  fail on disabled buttons such as an empty final row or the remaining empty
  placeholder.
- Initialisation failures now render a visible error (including the failure
  reason) instead of silently leaving an unbuilt or stale form; the Save button
  is not rendered after a failure.

### Fixed

- Fixed `selectTab` collapsing an already expanded accordion section. Selecting
  an expanded section now leaves it open; buttons without `aria-expanded` retain
  their existing click behavior. See [#2193](https://github.com/aehrc/smart-forms/pull/2193).
- Fixed `getBirthDateForAge` converting the intended local calendar date through
  UTC, which could shift the date or year in timezones ahead of UTC. It now
  formats the local calendar date directly. Invalid target dates (e.g.
  29 February in a non-leap year) still roll over per the `Date` constructor;
  suites with a clinical leap-day policy should use explicit DOB fixtures.
- Input helpers (`inputText`, `checkCheckBox`, `inputFile`, `inputDateTime`,
  `checkRadioOption`, `checkCheckboxOption`, `chooseSelectOption`,
  `chooseQuantityOption`, `inputOpenChoiceOtherText`) now fail with the question
  identifier and reason when the target control is disabled, read-only, or
  inside a disabled fieldset. `fireEvent` cannot see these states, so such
  interactions previously "succeeded" silently even though a real user could
  not perform them. Checkbox, radio and select helpers additionally confirm
  that the intended result was applied instead of silently doing nothing.
- Fixed `invokeExtract` accepting a callback from an earlier extraction when a
  Save click's own callback was still pending. The helper now waits for a new
  callback call from the click it dispatched.

## [0.1.0] - 2026-10-13

### Added

- Initial published release, providing `BehavioralTestWrapper` with optional
  patient-based population, questionnaire interaction and inspection helpers,
  and `invokeExtract` for testing extraction through the public package API.

[0.1.0]: https://github.com/aehrc/smart-forms/releases/tag/questionnaire-test-toolkit%400.1.0
