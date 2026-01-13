# Change log

This log documents changes for [@aehrc/sdc-template-extract](https://www.npmjs.com/package/@aehrc/sdc-template-extract). This project follows
[Semantic Versioning](http://semver.org/).

Changelog only includes changes from version 1.0.6 onwards.

## sdc-template-extract [1.0.15] - 2026-01-13
#### Fixed
- Fixed issues relating to the extraction of arrays, including issue [#1777](https://github.com/aehrc/smart-forms/issues/1777).

## sdc-template-extract [1.0.14] - 2025-10-23
#### Fixed
- All templateExtract extensions on a QuestionnaireItem are now evaluated.

## sdc-template-extract [1.0.13] - 2025-10-17
#### Fixed
- Added meta.tag.system to extracted bundle.

## sdc-template-extract [1.0.12] - 2025-10-03
#### Fixed
- Added pre-filtering `cleanDeep` cleaning step to ensure empty object values are not included in the extracted bundle. See https://github.com/aehrc/smart-forms/issues/1621#issuecomment-3354866916 for more details.

## sdc-template-extract [1.0.11] - 2025-10-02
#### Changed
- Very minor change where interface are exported as types to align with TypeScript best practices.

## sdc-template-extract [1.0.10] - 2025-10-02
#### Changed
- Replaced `type` slice with proposed `patchRequestUrl` sub-extension with temporary custom extension `https://smartforms.csiro.au/ig/StructureDefinition/TemplateExtractExtensionPatchRequestUrl` for PATCH request support.
- See https://chat.fhir.org/#narrow/channel/179255-questionnaire/topic/.24extract.20using.20templates/with/542442943 for more details.

## sdc-template-extract [1.0.9] - 2025-09-23
#### Fixed
- Fixed an issue where unmodified items appearing in extract when "add" operation is used.
- Fixed an issue where extracted bundle has additional erroneous value.
- Both issues are from https://github.com/aehrc/smart-forms/issues/1594.

## sdc-template-extract [1.0.8] - 2025-08-29
#### Added
- Fix $extract filtering logic when comparing extracted resource with comparison resource (for modified-only usage). Fixed https://github.com/aehrc/smart-forms/issues/1507.

## sdc-template-extract [1.0.7] - 2025-08-11
#### Added
- Allow handling of non-Error exceptions when evaluating FHIRPath expressions. Reason: fhirpath.js might not type exceptions as Error objects correctly.

## sdc-template-extract [1.0.6] - 2025-07-16
#### Added
- Allow `getFhirPatchResourceDisplay()` to support non-Bundle resources e.g. patient, user, encounter etc from launch context.
