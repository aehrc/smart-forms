# Change log

This log documents changes for
[@aehrc/questionnaire-test-toolkit](https://www.npmjs.com/package/@aehrc/questionnaire-test-toolkit).

## Unreleased

### Changed

**Upgrade note:** These changes can make existing test suites fail:

- Input helpers now reject disabled or read-only controls, including controls
  inside a disabled fieldset. Update tests to enable the control before editing
  it, or assert that it cannot be edited. Checkbox, radio and select helpers also
  verify that the interaction succeeded.
- `checkCheckBox` and `checkCheckboxOption` now ensure a checkbox is checked
  instead of toggling it. Tests that used them to uncheck a box must click the
  checkbox directly instead.

Except where another PR is linked, these changes and the entries below are from
[#2194](https://github.com/aehrc/smart-forms/pull/2194).

### Added

- Added optional `user` (`Practitioner`) and `fhirContext` props to
  `BehavioralTestWrapper` for practitioner and PractitionerRole launch context
  in population and renderer expressions. Both require a patient. See
  [#2193](https://github.com/aehrc/smart-forms/pull/2193) and
  [population details](./README.md#wrapper-props-and-population).
- Added `questionnaireResponse` to resume saved forms or amend completed forms.
  Saved answers take precedence over population results, while population still
  resolves launch context. See [saved responses](./README.md#saved-responses-and-comparison-extraction).
- Added `comparisonSourceResponse` to extract only changes against a supplied
  baseline response. Updating the baseline preserves unsaved edits. See
  [comparison extraction](./README.md#saved-responses-and-comparison-extraction).
- Added `fetchResourceCallback` to serve population requests from test fixtures.
  Requires a patient and cannot be combined with `requestDefinitions`; rejected
  requests fail initialisation. See [fixture setup](./README.md#strict-population-fixtures-and-request-spies).
- Added `addRepeatInstance` and `removeRepeatInstance` for repeating groups,
  table rows and repeated questions. See [repeat helpers](./README.md#repeat-helpers)
  for scoping and usage.

### Fixed

- Initialisation failures now show an error and hide Save instead of leaving an
  unbuilt or stale form. This includes rejected population callbacks with empty
  error messages. See [initialisation failures](./README.md#initialisation-failures).
- Fixed `selectTab` collapsing an already expanded accordion section. Selecting
  an expanded section now leaves it open. See
  [#2193](https://github.com/aehrc/smart-forms/pull/2193).
- Fixed `selectTab` returning before tab focus settled, which could close an
  autocomplete opened immediately afterward. See [tab selection](./README.md#tab-selection).
- Fixed `getBirthDateForAge` returning the wrong date or year in timezones ahead
  of UTC. It now preserves the local calendar date. See
  [date and leap-day guidance](./README.md#dates-and-clocks).
- Fixed `invokeExtract` accepting a result from an earlier extraction. It now
  waits for the result of its own Save click.

## [0.1.0] - 2026-10-13

### Added

- Initial published release, providing `BehavioralTestWrapper` with optional
  patient-based population, questionnaire interaction and inspection helpers,
  and `invokeExtract` for testing extraction through the public package API.

[0.1.0]: https://github.com/aehrc/smart-forms/releases/tag/questionnaire-test-toolkit%400.1.0
