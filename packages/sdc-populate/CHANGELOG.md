# Change log

This log documents changes for [@aehrc/sdc-populate](https://www.npmjs.com/package/@aehrc/sdc-populate). This project follows
[Semantic Versioning](http://semver.org/).

Changelog only includes changes from version 4.0.0 onwards.

## [4.6.2] - 2025-08-07
#### Fixed
- Make error handling in fhirpath evaluations more lenient (remove e instanceof Error check), due to fhirpath.js async evaluation returning a string error message instead of an Error object which results in the error being muted on development builds (surprising it works on production).
- Remove unnecessary (or even wrong) client-side sorting based on effectiveDates and recordedDate in Observation and Conditions respectively.
- Reduce bundle size by removing tests and tets data from published package.

## [4.6.0] - 2025-07-24
#### Fixed
- Add fhirContext handling when creating $populate input parameters.
- Increase tolerance of isLaunchContext() so that it can handle more launch contexts beyond the ones defined in https://hl7.org/fhir/uv/sdc/ValueSet-launchContext.html.
- Add timeoutMs parameter to populateQuestionnaire() input parameters.

## [4.5.0] - 2025-07-14
#### Added
- Add display element to `QR.subject` and `QR.author`.

## [4.4.0] - 2025-07-10
#### Fixed
- Add support for child items consuming itemPopulationContext to access fhirPathContext.

## [4.3.1] - 2025-06-18
#### Fixed
- In non-repeating QuestionnaireItems, strictly only populate one answer (the first answer), even if initialExpression evaluates to multiple answers.

## [4.3.0] - 2025-06-03
#### Fixed
- Fixed an [issue](https://github.com/aehrc/smart-forms/issues/1258) where a repeating group using ItemPopulationContext only looks at the first item in the group to determine the itemPopulationContext used.
- Included author and authored property when creating a QuestionnaireResponse.

## [4.1.0] - 2025-05-07
#### Fixed
- Use the same removeEmptyAnswers() implementation as the renderer, which is more battle tested.

## [4.0.0] - 2025-05-07
#### Fixed
- Interface changes: `FetchResourceCallback`, `FetchTerminologyCallback`, `FetchResourceRequestConfig`, `FetchTerminologyRequestConfig`.
- It is now a requirement for `FetchResourceRequestConfig` to have a sourceServerUrl as the FHIR server URL to fetch resources from.
- It is now a requirement for `FetchTerminologyRequestConfig` to have a terminologyServerUrl as the FHIR Terminology server URL to fetch terminology from.

