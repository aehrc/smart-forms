# Change log

This log documents changes for [@aehrc/sdc-assemble](https://www.npmjs.com/package/@aehrc/sdc-assemble). This project follows
[Semantic Versioning](http://semver.org/).

Changelog only includes changes from version 2.0.2 onwards.

## sdc-assemble [2.0.3] - 2026-09-10
#### Fixed
- Fixed nested/recursive modular questionnaires not being fully flattened - a subquestionnaire that was itself modular had its own subQuestionnaire placeholders left unresolved when spliced into its parent.
#### Changed
- Removed the unused `axios` runtime dependency, reducing the install footprint for consumers (e.g. React Native/mobile targets). See issue [#2049](https://github.com/aehrc/smart-forms/issues/2049)

## sdc-assemble [2.0.2] - 2025-08-15
#### Fixed
- Handle axios-based FetchResourceCallback calls correctly, for both happy and sad paths (res.data).
- Fix TypeScript issues in type predicates.
- When resolving subquestionnaire canonical URLs, enforce in the root questionnaire (returns OperationOutcome if not present), otherwise if it's a recursive resolution within subquestionnaires (for sub-subquestionnaires), be more lenient by returning an empty array.
