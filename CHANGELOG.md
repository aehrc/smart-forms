# Change log

This log documents changes for the [@aehrc/smart-forms-renderer](https://www.npmjs.com/package/@aehrc/smart-forms-renderer). This project follows
[Semantic Versioning](http://semver.org/).

For changelogs of other libraries, please refer to their respective repositories under the /packages folder:
- SDC-Populate: [/packages/sdc-populate/CHANGELOG.md](/packages/sdc-populate/CHANGELOG.md)
- SDC-Assemble: [/packages/sdc-assemble/CHANGELOG.md](/packages/sdc-assemble/CHANGELOG.md)
- SDC-Template-Extract: [/packages/sdc-template-extract/CHANGELOG.md](/packages/sdc-template-extract/CHANGELOG.md)

Changelog only includes changes from version 0.36.0 onwards.

## [1.2.9] - 2025-10-28
### Fixed
- Add aria-hidden="true" to text-field based questions' clear button (x).

## [1.2.8] - 2025-10-28
### Fixed
- Required field asterisks accessibility enhancements also applies to group headings and tab buttons.

## [1.2.7] - 2025-10-28
### Fixed
- Required field asterisks are now properly announced as "Mandatory field" by screen readers. Refer to issue [#1741](https://github.com/aehrc/smart-forms/issues/1741)

## [1.2.6] - 2025-10-28
### Fixed
- Remove `openOnFocus` prop from autocomplete fields to allow screen readers to read out label, placeholder text and control's role. Refer to issue [#1733](https://github.com/aehrc/smart-forms/issues/1733)

## [1.2.5] - 2025-10-28
### Fixed
- Use `deepEqual` for checkbox answer matching instead of JSON.stringify equality to correctly compare valueCoding objects. Refer to issue [#1738](https://github.com/aehrc/smart-forms/issues/1738)

## [1.2.4] - 2025-10-28
### Fixed
- Measurement units (e.g. cm, kg) are now associated with their input fields, ensuring screen readers correctly announce the unit when the field receives focus. Refer to issue [#1641](https://github.com/aehrc/smart-forms/issues/1641)

## [1.2.3] - 2025-10-27
### Fixed
- Fixed bug with the rendering of the calculation animation on the first calculated expression update. Issue described [here](https://github.com/aehrc/smart-forms/issues/1682)

## [1.2.2] - 2025-10-27
### Fixed
- Fixed bugs with the rendering and updating of nested items, within an item that is a repeat item. The issue is described [here](https://chat.fhir.org/#narrow/channel/179255-questionnaire/topic/Initial.20value.20for.20nested.20questions.20with.20repeating.20parent.2E/with/535935557)

## [1.2.1] - 2025-10-27
### Fixed
- Fixed valueSet promise resolution in buildForm stage to exclude answerValueSet urls from autocomplete items. This is because these urls are meant to be used alongside a `filter` parameter.
- Fixed renderer calcExp not working on open-choice and choice fields. Issue is described [here](https://github.com/aehrc/smart-forms/issues/1722)
- Fixed renderer open-choice not retaining the selected option in calcExp. Issue is described [here](https://github.com/aehrc/smart-forms/issues/1721)
- Changed renderer aria-label as per request described  [here](https://github.com/aehrc/smart-forms/issues/1657)
  
## [1.2.0] - 2025-10-23
### Added
- Added support for optional heading focus when switching tabs via `disableHeadingFocusOnTabSwitch` field in `RendererConfigStore`.

## [1.1.0] - 2025-10-23
### Added
- Added calcExpUpdated prop to overrideComponent interface.

### Fixed
- Fixed accurate option highlighting in `choice` autocomplete items.

## [1.0.0] - 2025-10-13
_(WARNING: Major breaking changes with library API)_

For smooth migration, a migration guide is provided at [MIGRATION-v1.0.md](MIGRATION-v1.0.md).

### Changed

#### `buildForm`, `QuestionnaireStore` and `QuestionnaireResponseStore` changes:
- `buildForm()` and `useBuildForm()` now accept a `BuildFormParams` object instead of multiple parameters.
- The `additionalVariables` parameter is replaced with `additionalContext`. Its usage remains the same - it is used to inject additional fhirPathContext variables.
- A new library function `repopulateForm()` is added to repopulate the form with a new QuestionnaireResponse and/or additionalContext while preserving the current Questionnaire state. Its parameters are defined in the interface `RepopulateFormParams`.


#### `QuestionnaireStore` and `QuestionnaireResponseStore` changes:
- If you were previously calling `QuestionnaireStore.setPopulatedContext` to inject populatedContext into the renderer, you no longer need to do so. `buildForm()`, `useBuildForm()` and `repopulateForm()` will take care of it for you via the `additionalContext` parameter.
- For pre-population/re-population, you do not need to call `QuestionnaireStore.updatePopulatedProperties` and `QuestionnaireResponseStore.setUpdatableResponseAsPopulated` anymore.  Both of these functions are now removed. `buildForm()`, `useBuildForm()` and `repopulateForm()` will take care of it for you.
  ```
  - // Remove these lines
  - const updatedResponse = await updatePopulatedProperties(populatedResponse, populatedContext);
  - setUpdatableResponseAsPopulated(updatedResponse);
  -
  - if (populatedContext) {
  -   setPopulatedContext(populatedContext, true);
  - }
  
  + // Re-run buildForm (or repopulateForm) with the new populatedResponse
  + await buildForm({
  +   questionnaire: sourceQuestionnaire,
  +   questionnaireResponse: populatedResponse,
  +   terminologyServerUrl: defaultTerminologyServerUrl,
  +   additionalContext: populatedContext
  + });
  ```

- `QuestionnaireStore.populatedContext` and `QuestionnaireStore.setPopulatedContext` are replaced with `QuestionnaireStore.additionalContext` and `QuestionnaireStore.setAdditionalContext` respectively. You most likely won't need to call `setAdditionalContext` manually.
- It is still recommended to create your own wrapper function that calls `destroyForm()` to clean up states when the form is unmounted before calling `buildForm()` again.
  ```
  async function resetAndBuildForm(params: BuildFormParams) {
    // Destroy previous questionnaire state before building a new one
    destroyForm();
  
    // Build new questionnaire state
    await buildForm(params);
  }
  ```

#### RendererStylingStore changes
- `RendererStylingStore` and interface `RendererStyling` are replaced with `RendererConfigStore` and `RendererConfig` respectively. This is purely a naming change.
- `rendererConfigOptions` can now be passed into the renderer via `buildForm()` and `useBuildForm()`. You no longer need to call `setRendererConfigStore` manually.

#### Misc hook/function changes
- `useStringCalculatedExpression` and `useCodingCalculatedExpression` hooks are removed. CalculatedExpressions are now triggered via an internal task queue. If you are using these hooks in a component override, you can remove the hook safely.
- `objectIsCoding` library function is removed.

### Fixed
- Take questionnaire-unit into account when updating QR via Quantity item calculatedExpressions.

## [0.45.1] - 2025-02-25
### Fixed
- Fixed an issue where radio buttons and checkboxes are unreadable on mobile viewports.

## [0.45.0] - 2025-02-18
### Added
- Added preferredTerminologyServer compatibility with valueUri.

### Fixed
- Increased renderer's tolerance when working with valueCoding without codes.

## [0.44.4] - 2025-02-17
### Fixed
- Update dependencies to fix incompatible Node and dependency versions.

## [0.44.3] - 2024-11-07
### NPM-related
- Bump version to set NPM tag to latest.

## [0.44.2] - 2024-10-18
### Fixed
- Fixed an issue where inputs in checkbox open-choice's open label field does not update the QuestionnaireResponse.

## [0.44.1] - 2024-10-14
### Fixed
- Fixed unexpected behaviour of open-choice's open label field clearing the answers of previously selected options.
- Fixed an issue where enableWhen logic was not working properly with repeating items.

## [0.44.0] - 2024-10-09
### Added
- Added support for the [preferredTerminologyServer](https://hl7.org/fhir/uv/sdc/STU3/StructureDefinition-sdc-questionnaire-preferredTerminologyServer.html) SDC extension.

## [0.43.1] - 2024-10-04
### Changed
- Completely removed persisting "iframe-resizer" dependencies as a follow-up to v0.43.0.

## [0.43.0] - 2024-10-04
### Changed
- Removed external dependency on "iframe-resizer" while retaining dynamically sized Storybook iframes in the documentation.

## [0.42.0] - 2024-09-27
### Changed
- Replaced all instances of cloneDeep() with the native structuredClone() function.
- Changed Storybook iframes in the documentation to be dynamically sized based on the content.

## [0.41.0] - 2024-09-25
### Changed
- Significantly improved performance by reducing the number of re-renders.
- Adjusted renderer's background color to be #fafafa.
- Removed left and right paddings from the renderer - it now takes up the full width of its container.

### Fixed
- Fixed inconsistencies when syncing the renderer's internal state with externally-generated QuestionnaireResponses.
- Fixed inconsistencies with internal IDs for tracking repeating items and groups.
- Fixed an issue where the renderer's theme was overriding the parent app's styles.
- Fixed issues with lodash dependencies in package.json.

### Added
- Added a library function removeInternalIdsFromResponse() to remove internal IDs for tracking repeating items.


## [0.40.1] - 2024-09-18
### Fixed
- Fix date validation error message for two matches.
- Fix generation of internal IDs for repeat items and groups to be consistent and sync-able with externally-generated QuestionnaireResponses.
- Added a simple, minimal fix to dynamically adjust field positions based on viewport

## [0.40.0] - 2024-09-06
### Added
- Added support for Observation-based extraction as a library function and as a feature in the Playground.

## [0.39.0] - 2024-09-06
### Changed
- Refactored `repeat` items so that it tracks item instances using the QuestionnaireResponse, instead of using React's `useState`.

### Fixed
- Fixed an issue where `string` and `text` items were automatically removing inputted trailing whitespaces.

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
