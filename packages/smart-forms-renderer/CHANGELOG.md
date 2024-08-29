# Change log

This log documents significant changes for the [@aehrc/smart-forms-renderer](https://www.npmjs.com/package/@aehrc/smart-forms-renderer). This project follows
[Semantic Versioning](http://semver.org/).

Changelog only includes changes from version 0.36.0 onwards.

## [0.38.4] - 2024-08-29
### Fixed
- Fixed support for item.initial and item.answerOption.initialSelected for repeating groups.

## [0.38.3] - 2024-08-23
### Added
- Added support for non-repeating group table (`gtable`) items.

## [0.38.2] - 2024-08-21
### Added
- Added support for `Quantity` items. See documentation and Storybook for more details.

## [0.37.2] - 2024-08-19
### Fixed
- Fixed a @aehrc/sdc-populate library dependency issue.

## [0.37.1] - 2024-08-05
### Added
- Added support for `page` UI Control code from https://hl7.org/fhir/extensions/ValueSet-questionnaire-item-control.html.

## [0.36.1] - 2024-07-23
### Added
- Add support for `Coding` type in calculatedExpressions for choice and open-choice items.

## [0.36.0] - 2024-07-22
### Added
- Add Save-Extract-Write functionality (StructureMap-based) in the "Save as Final" button in the Smart Forms app.
