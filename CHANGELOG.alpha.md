# Change log for alpha releases

This log documents significant changes for [@aehrc/smart-forms-renderer's alpha releases](https://www.npmjs.com/package/@aehrc/smart-forms-renderer). This project follows
[Semantic Versioning](http://semver.org/).

This changelog only includes changes from version 1.0.0-alpha.1 onwards. For stable releases, refer to the main [CHANGELOG.md](CHANGELOG.md).

WARNING: Alpha releases are not stable and may contain breaking changes. Changes are also most likely to be undocumented.

## [1.0.0-alpha.20] - 2025-02-19
### Fixed
- Fixed an issue where the default tabbed form breakpoint is set to render at a width lower than "md" rather than higher.

## [1.0.0-alpha.19] - 2025-02-19
_(WARNING: This version will break the renderer, use 1.0.0-alpha.20 instead.)_
### Added
- Added a hook to adjust breakpoints for rendering a tabbed form in RendererStylingStore.

## [1.0.0-alpha.18] - 2025-02-14
### Fixed
- Increased renderer's tolerance when working with valueCoding without codes.

## [1.0.0-alpha.17] - 2025-02-14
### Fixed
- Fixed an issue where unexpected properties in valueCodings from a terminology server e.g. designation would not be filtered from the QuestionnaireResponse and cause validation failure when submitted to a FHIR server.

## [1.0.0-alpha.16] - 2025-02-13
### Fixed
- Updated dependencies to fix incompatible Node and dependency versions.

### Added
- Added preferredTerminologyServer compatibility with valueUri.

### Changed
- Changed how the .env file controls how Vite handles preserveSymLinks to play nice with CommonJS modules. It is worth re-reading LOCAL_DEVELOPMENT.md for local development setup.

## [1.0.0-alpha.15] - 2025-02-13
### Added
- Added hook to hide tab button in RendererStylingStore.

## [1.0.0-alpha.14] - 2025-02-13
### Fixed
- Added checks for "0" values in maxQuantity and minQuantity validation.

## [1.0.0-alpha.13] - 2025-02-12
### Added
- Added terminology caching in FHIRPath's memberOf() to significantly improve performance for async FHIRPath evaluation.

## [1.0.0-alpha.12] - 2025-02-10
### Changed
- Updated [fhirpath.js](https://github.com/hl7/fhirpath.js/) to v3.17.0.

### Added
- Added support for maxQuantity and minQuantity SDC extensions.
- Added a local development guide.

## [1.0.0-alpha.11] - 2024-12-23
### Fixed
- Fixed build issues with v1.0.0-alpha.10.
- Removed unintended (i) icon at the end of a markdown display item.

## [1.0.0-alpha.10] - 2024-12-19
_(WARNING: Breaking changes from v1.0.0-alpha.9)_
### Added
- Updated [fhirpath.js](https://github.com/hl7/fhirpath.js/) to v3.15.2, which uses async functions for FHIRPath evaluation. A large number of functions have been updated to use async/await syntax.
- Updated [sdc-populate](https://www.npmjs.com/package/@aehrc/sdc-populate) to v3.0.0, which is also updated to use async functions for FHIRPath evaluation and updated FetchTerminologyCallback API.

Note: this version doesn't build properly, use v1.0.0-alpha.11 instead.

## [1.0.0-alpha.9] - 2024-11-28
### Added
- Added support to hide optional Quantity comparator field.

### Changed
- Changed Quantity's unitOption behaviour to not show the unit dropdown if there is only one option.

## [1.0.0-alpha.8] - 2024-11-26
### Added
- Exposed more functions in the library API. No logic changes were made.

## [1.0.0-alpha.7] - 2024-11-26
### Added
- Added support for custom validation feedback via custom extensions e.g. https://smartforms.csiro.au/ig/StructureDefinition/minValue-feedback
- Added support for inputs to use flex-grow to fill available space instead of a fixed numeric width.

### Changed
- EnableWhenAsReadOnly now allows specifying an array of itemTypes to be rendered as read-only fields. Unspecified itemTypes will use the default behaviour of hiding the item.

## [1.0.0-alpha.6] - 2024-11-21
### Added
- Added support in RendererStylingStore to adjust required indicator position (start/end), boolean yes/no position, text field width and show/hide clear button for item fields.

### Fixed
- Fixed group item "required" validation.

## [1.0.0-alpha.5] - 2024-11-15
### Added
- Added support in RendererStylingStore for customising item label and item field breakpoints for responsive design.
- Added support for Boolean checkboxes via the 'check-box' itemControl.

## [1.0.0-alpha.4] - 2024-11-07
### No changes
- No changes were made in this release. This version was published to fix a versioning issue.

## [1.0.0-alpha.3] - 2024-10-31
### Added
- Added RendererStylingStore config for enableWhenAsReadOnly. This allows the renderer to display enableWhen items as read-only fields instead of hiding them if enableWhen conditions are not met.
- Added SDC UI itemControl (https://hl7.org/fhir/extensions/ValueSet-questionnaire-item-control.html) overrides in buildForm() to substitute the default look with a React component via `code`. Only works for flyover components ATM.

## [1.0.0-alpha.2] - 2024-10-29
### Fixed
- Modified page rendering behaviour to align with the examples in the SDC specification.
- Added support in RendererStylingStore to disable/enable card view and "next page" button configs for `Page`.

## [1.0.0-alpha.1] - 2024-10-17
### Added
- Added RendererStylingStore to provide customised rendering/behaviour for the renderer via library API.
- Added QuestionnaireItem overrides in buildForm() to substitute a specified QuestionnaireItem with a React component via linkId.
