# Change log

This log documents changes for
[@aehrc/questionnaire-test-toolkit](https://www.npmjs.com/package/@aehrc/questionnaire-test-toolkit).

## Unreleased

### Added

- Added optional `user` (`Practitioner`) and `fhirContext` props to
  `BehavioralTestWrapper` for population alongside a supplied patient, including
  practitioner and PractitionerRole launch context. The practitioner and resolved
  launch context are available to renderer expressions, and changing either prop
  reruns population. See [#2193](https://github.com/aehrc/smart-forms/pull/2193).

### Fixed

- Fixed `selectTab` collapsing an already expanded accordion section. Selecting
  an expanded section now leaves it open; buttons without `aria-expanded` retain
  their existing click behavior. See [#2193](https://github.com/aehrc/smart-forms/pull/2193).

## [0.1.0] - 2026-10-13

### Added

- Initial published release, providing `BehavioralTestWrapper` with optional
  patient-based population, questionnaire interaction and inspection helpers,
  and `invokeExtract` for testing extraction through the public package API.

[0.1.0]: https://github.com/aehrc/smart-forms/releases/tag/questionnaire-test-toolkit%400.1.0
