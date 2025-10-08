# Change log for alpha releases

This log documents significant changes for [@aehrc/smart-forms-renderer's alpha releases](https://www.npmjs.com/package/@aehrc/smart-forms-renderer). This project follows
[Semantic Versioning](http://semver.org/).

This changelog only includes changes from version 1.0.0-alpha.1 onwards. For stable releases, refer to the main [CHANGELOG.md](CHANGELOG.md).

WARNING: Alpha releases are not stable and may contain breaking changes. Changes are also most likely to be undocumented.

## [1.0.0-alpha.110.dev1] - 2025-10-07 
_(WARNING: Major breaking changes with library API)_

This library API change will be reflected in the next stable release (1.0.0).

A migration guide is provided at [MIGRATION-v1.0.md](MIGRATION-v1.0.md).

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


## [1.0.0-alpha.109] - 2025-10-07
#### Fixed
- Added debouncing to open-choice autocomplete input fields to reduce the number of QuestionnaireResponse updates.

## [1.0.0-alpha.108] - 2025-10-07
#### Changed
- Reverted changes in 1.0.0-alpha.57 where inline validation messages are shown when the field loses focus.
  Now inline validation messages are shown immediately when the field value changes (default MUI behaviour).

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

## [1.0.0-alpha.107] - 2025-09-24
#### Fixed
- Bumped version because previous version 1.0.0-alpha.106 wasn't published with the fix.

## [1.0.0-alpha.106] - 2025-09-24
#### Fixed
- Fixed an issue where the asterisk colour is hardcoded as "red" instead of referencing the main error colour of the theme palette.

## [1.0.0-alpha.105] - 2025-09-24
#### Fixed
- Reduce false positives for "alert(" and similar variants when sanitising input fields (from 1.0.0-alpha.98).

## [1.0.0-alpha.104] - 2025-09-24
#### Added
- Added support for injecting `aria-label` at item labels, display items, and tab buttons via a custom extension 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextAriaLabelExpression'. See https://github.com/aehrc/smart-forms/issues/1578 for more details.

## sdc-template-extract [1.0.9] - 2025-09-23
#### Fixed
- Fixed an issue where unmodified items appearing in extract when "add" operation is used.
- Fixed an issue where extracted bundle has additional erroneous value.
- Both issues are from https://github.com/aehrc/smart-forms/issues/1594.

## [1.0.0-alpha.103] - 2025-09-22
#### Fixed
- Fixed an issue where the Time item is failing pre-population.

## [1.0.0-alpha.102] - 2025-09-22
#### Fixed
- Resolved an dependency import issue with @aehrc/testing-toolkit where it was not published on NPM. It it used for Storybook-based testing, and now it is now included in the renderer package instead of a separate package.

## [1.0.0-alpha.101] - 2025-09-16
#### Added
- Added support for SDC extension http://hl7.org/fhir/uv/sdc/StructureDefinition-sdc-questionnaire-width.html (both % and px) in gtable and grid groups itemControls.

## [1.0.0-alpha.100] - 2025-09-15
#### Fixed
- Fixed an issue where "Clear" buttons in open-choice components do not clear openLevel input fields.

## [1.0.0-alpha.99] - 2025-09-15
#### Fixed
- Fixed an issue where the date input in DateTime items are failing pre-population.

## [1.0.0-alpha.98] - 2025-09-15
#### Added
- Added input sanitisation in renderer input fields. See https://github.com/aehrc/smart-forms/issues/1533 for more details.

## [1.0.0-alpha.97] - 2025-09-04
#### Changed
- Changed item-level repopulate button custom extension to the below. See https://chat.fhir.org/#narrow/channel/179255-questionnaire/topic/Granular.20Repopulate.20button/with/533937578 for more details.
```json
{
  "url": "https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable",
  "valueCode": "manual"
}
```

## [1.0.0-alpha.96] - 2025-09-04
#### Added
- Added support for an item-level repopulate button via a custom extension 'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-showRepopulateButton'. This button can only be used on string, text, integer and decimal fields, and cannot be used in repeating items or groups.

## sdc-template-extract [1.0.8] - 2025-08-29
#### Added
- Fix $extract filtering logic when comparing extracted resource with comparison resource (for modified-only usage). Fixed https://github.com/aehrc/smart-forms/issues/1507.

## [1.0.0-alpha.95] - 2025-08-20
#### Fixed
- Various TypeScript-related bug fixes.
- In the autocomplete component, when the input is less than 2 characters, an info icon will be displayed at the right end.

## [1.0.0-alpha.94] - 2025-08-20
#### Fixed
- Add enableColorScheme at ScopedCssBaseline for native light/dark alignment with parent app i.e. native scrollbars, native focus rings, etc.
  Note that this doesn't provide you with dark mode. for that, you need to wrap `<BaseRenderer>` with your own light/dark-mode enabled `<ThemeProvider>`. See https://mui.com/material-ui/customization/theming/ for more details.

## [1.0.0-alpha.93] - 2025-08-19
#### Changed
- Remove MUI GlobalStyles (which overrides the parent app) with ScopedCssBaseline in RendererThemeProvider. This sets a baseline for the renderer's MUI styles without affecting the parent app's styles.

## [1.0.0-alpha.92] - 2025-08-15
#### Changed
- Changed "questionnaire-item-text-hidden" custom extension to use the "https://smartforms.csiro.au/ig/StructureDefinition/<extension_name>" convention. Affected extensions:

| Old Extension URL                                                                 | New Extension URL                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| https://smartforms.csiro.au/docs/custom-extension/questionnaire-item-text-hidden             | https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden (or https://smartforms.csiro.au/docs/custom-extension/QuestionnaireItemTextHidden) |

- Added backwards compatibility for custom extensions defined in Smart Forms.
  Both URLs "https://smartforms.csiro.au/ig/StructureDefinition/<extension_name>" and "https://smartforms.csiro.au/docs/custom-extension/<extension_name>" will work for the custom extensions listed below.

| Extension URLs                                                              |
|-----------------------------------------------------------------------------|
| https://smartforms.csiro.au/docs/custom-extension/minValue-feedback         |
| https://smartforms.csiro.au/docs/custom-extension/maxValue-feedback         |
| https://smartforms.csiro.au/docs/custom-extension/required-feedback         |
| https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback |
| https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback |
| https://smartforms.csiro.au/docs/custom-extension/QuestionnaireItemTextHidden |
| https://smartforms.csiro.au/docs/custom-extension/GroupHideAddItemButton |

## sdc-assemble [2.0.2] - 2025-08-15
#### Fixed
- Handle axios-based FetchResourceCallback calls correctly, for both happy and sad paths (res.data).
- Fix TypeScript issues in type predicates.
- When resolving subquestionnaire canonical URLs, enforce in the root questionnaire (returns OperationOutcome if not present), otherwise if it's a recursive resolution within subquestionnaires (for sub-subquestionnaires), be more lenient by returning an empty array.

## [1.0.0-alpha.91] - 2025-08-11
#### Changed
- Remove Iconify dependency and replaced them with MUI icons. This affects the next/previous tab and page buttons.

## sdc-template-extract [1.0.7] - 2025-08-11
#### Added
- Allow handling of non-Error exceptions when evaluating FHIRPath expressions. Reason: fhirpath.js might not type exceptions as Error objects correctly.

## [1.0.0-alpha.90] - 2025-08-07
#### Added
- Updated sdc-populate to v4.6.2. Changes as follows:
- Make error handling in fhirpath evaluations more lenient (remove e instanceof Error check), due to fhirpath.js async evaluation returning a string error message instead of an Error object which results in the error being muted on development builds (surprising it works on production).
- Remove unnecessary (or even wrong) client-side sorting based on effectiveDates and recordedDate in Observation and Conditions respectively.
- Reduce bundle size by removing tests and tets data from published package.

## [1.0.0-alpha.89] - 2025-08-04
#### Added
- Add support for custom `https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton` extension to hide the "Add Item" button in a repeating group or group table item.
  This extension is used when you want to prevent users from adding items to a group, but still want to allow them to edit existing items.

## [1.0.0-alpha.88] - 2025-08-01
#### Fixed
- Resolves an issue where the `useValidationFeedback` hook was incorrectly falling back to a generic error message in a required item and when `requiredItemsIsHighlighted` is false.

## [1.0.0-alpha.87] - 2025-07-31
#### Fixed
- Fixed number of columns shown and widths when a grid group has a hidden item.

## [1.0.0-alpha.86] - 2025-07-30
#### Fixed
- Standardise generic `StandardTextField` to accommodate multiline inputs - so that all fields have the same height. This fixes an issue where adding multiline support (in alpha.82) in text-based fields increases their height.
- Added multiline support to dropdown fields too.

## [1.0.0-alpha.85] - 2025-07-30
#### Changed
- Reverted visual expression update animations to the previous behaviour (Last change was in 1.0.0-alpha.81).

#### Fixed
- Add check for falsy input values in calculatedExpression hook updates to prevent unintended visual calculatedExpression updates when nothing has actually changed.

## [1.0.0-alpha.84] - 2025-07-30
_(WARNING: Possible breaking changes with QuestionnaireStore.itemTypes)_
#### Changed
- Refactor QuestionnaireStore itemTypes to itemMap. Changed from <linkId, qItem.type> to <linkId, Omit<QuestionnaireItem, 'item'>.

#### Fixed
- Refactor `useValidationFeedback` to rely entirely on the QR store’s invalidItems, resolving timing mismatches between inline feedback and global validation state.
- For DateTimeItem and QuantityItem, fix an issue where feedback was always shown — now only shows feedback when `showFeedback=true` (triggered by unfocusing the field).
- When processing target constraints, add a step to filter out invalidItems whose qItem is hidden via questionnaire-hidden or enableWhen.

## [1.0.0-alpha.83] - 2025-07-24
#### Added
- Updated sdc-populate to v4.6.0. Changes as follows:
- Add fhirContext handling when creating $populate input parameters.
- Increase tolerance of isLaunchContext() so that it can handle more launch contexts beyond the ones defined in https://hl7.org/fhir/uv/sdc/ValueSet-launchContext.html.
- Add timeoutMs parameter to populateQuestionnaire() input parameters.

## [1.0.0-alpha.82] - 2025-07-23
#### Added
- Add multiline support to non-numeric text field-based components. This allows text to auto-wrap when it exceeds the width of the text field.

## [1.0.0-alpha.81] - 2025-07-17
#### Added
- Added support for calculatedExpressions to `date` and `dateTime` items.

#### Fixed
- Show date and dateTime error messages when parent group is a gtable/grid.

#### Changed
- Due to space constraints for textfield-based items in gtables/grids, expression update animations for textfield-based items are now changed to a faint green glow. Animations are unchanged for radio and checkbox items.

## [1.0.0-alpha.80] - 2025-07-15
_(WARNING: Possible breaking changes with Questionnaire definitions)_
#### Changed
- Changed all instances of custom extensions to use the "https://smartforms.csiro.au/docs/custom-extension/*" convention. Affected extensions:

| Old Extension URL                                                                 | New Extension URL                                                                  |
|-----------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| https://smartforms.csiro.au/ig/StructureDefinition/minValue-feedback             | https://smartforms.csiro.au/docs/custom-extension/minValue-feedback               |
| https://smartforms.csiro.au/ig/StructureDefinition/maxValue-feedback             | https://smartforms.csiro.au/docs/custom-extension/maxValue-feedback               |
| https://smartforms.csiro.au/ig/StructureDefinition/required-feedback             | https://smartforms.csiro.au/docs/custom-extension/required-feedback               |
| https://smartforms.csiro.au/ig/StructureDefinition/minQuantityValue-feedback     | https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback       |
| https://smartforms.csiro.au/ig/StructureDefinition/maxQuantityValue-feedback     | https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback       |


#### Added
- Added support for new custom extension `https://smartforms.csiro.au/docs/custom-extension/questionnaire-item-text-hidden` to prevent rendering of item.text in the renderer. This extension is used when you want to specify item.text for metadata purposes but do not want it displayed in the rendered form.

## sdc-template-extract [1.0.6] - 2025-07-16
#### Added
- Allow `getFhirPatchResourceDisplay()` to support non-Bundle resources e.g. patient, user, encounter etc from launch context.

## [1.0.0-alpha.79] - 2025-07-15
_(WARNING: Possible breaking changes)_
#### Removed
- Removed all usages of `showMinimalView`.

## [1.0.0-alpha.78] - 2025-07-15
#### Added
- Added support for renderer-styling usage in Grid tables.

## [1.0.0-alpha.77] - 2025-07-14
#### Added
- Updated sdc-populate to v4.5.0. Changes as follows:
- Add display element to `QR.subject` and `QR.author`.

## [1.0.0-alpha.76] - 2025-07-13
#### Added
- Added parseFhirDateTimeToDisplayDateTime() as a library function that parses a FHIR dateTime to a human-readable format.

## [1.0.0-alpha.75] - 2025-07-10
#### Added
- Updated sdc-populate to v4.4.0. Changes as follows:
- Add support for child items consuming itemPopulationContext to access fhirPathContext.

## [1.0.0-alpha.74] - 2025-07-09
#### Changed
- Changed how re-population works:
- Grid items are now re-populated one by one like regular items instead of being repopulated as a whole. 
- `ItemToRepopulate` interface now contains `sectionItemText` (replaces `heading`), `parentItemText` and `isInGrid`. Items in a grid usually have their item.text as column headings e.g. Value, Date recorded which does not provide much context. In this case, `parentItemText` can be used to provide more context for the item being re-populated.
- A new library function `isItemInGrid()` is added to check if an item is in a grid (if any of its ancestors is a grid item).

## [1.0.0-alpha.73] - 2025-07-08
#### Fixed
- Fix an issue where invalidItems not updated immediately when target constraint is unmet.
- Fix an issue where in the Playground, existing RendererStylingStore state is wiped (and reverts to the default values) when a button that calls `setRendererStylingStore()` is clicked.


## [1.0.0-alpha.72] - 2025-07-01
#### Fixed
- Added getItemTerminologyServerToUse() as a cleaner way to an item to decide which terminology server to use.
- UseQuantityCalculatedExpression() hook now takes into account preferredTerminologyServer when looking up ucum-units.

## [1.0.0-alpha.71] - 2025-06-30
#### Added
- Added observation-based extraction helper functions canBeObservationExtracted() and buildBundleFromObservationArray() as library functions.


## [1.0.0-alpha.70] - 2025-06-26
#### Added
- Added support for answerOptionToggleExpression in answerValueSet dropdowns.

#### Fixed
- Fixed an issue where cursor is not set to "default" when hovering over HTML-readonly checkbox labels
- Fixed an issue where `readOnlyVisualStyle` is set to "readonly", radio and checkbox inputs are not truly disabled when they are disabled via answerOptionsToggleExpressions.

## [1.0.0-alpha.69] - 2025-06-18
#### Fixed
- Move dayjs.extend() localisation and parse format functions to BaseRenderer.tsx so they are immediately invoked.

#### Updated sdc-populate to v4.3.1. Changes as follows:
- In non-repeating QuestionnaireItems, strictly only populate one answer (the first answer), even if initialExpression evaluates to multiple answers.

## [1.0.0-alpha.68] - 2025-06-16
#### Fixed
- Fixed an issue where Observation-based extraction is mapping QR.author to Obs.author (should be Obs.performer).
- Fixed an issue where empty strings in text-based fields are passing validation.

## [1.0.0-alpha.67] - 2025-06-16
#### Fixed
- Fixed an issue where items with dynamicValueSets with expansion coding of 0 will trigger a fallback expansion against their qItem.answerValueSet.

## [1.0.0-alpha.66] - 2025-06-10
#### Fixed
- Fixed an issue where decimal, dateTime, slider, radio button items are not taking up full space in a grid table.

## [1.0.0-alpha.65] - 2025-06-10
#### Fixed
- Added ARIA attributes to various components.
- Updated various components to have a more descriptive ARIA label.
- Various fixes to typography to meet accessibility requirements - font size, font color changes
- Augment XHTML renderings (from Questionnaire definition) by adding `alt` attribute to <img> tags.
- Updated MUI component code segments that will be deprecated soon i.e. updated to slotProps.

### Changed
- Removed `simplebar-react` dependency and all associated custom scrollbar components (`Scrollbar.tsx` and `Scrollbar.styles.ts`). Updated `DashboardNav` to use native scroll behavior instead.
- Downgraded `react-router-dom` from version `7.2.0` to `6.11.2` because `useBlocker` is broken in the later versions.

### Known accessibility issues that will never be fixed:
- [Label text is located before its associated checkbox or radio button element](https://unpkg.com/accessibility-checker-engine@4.0.5/help/en-US/input_label_after.html#%7B%22message%22%3A%22Label%20text%20is%20located%20before%20its%20associated%20checkbox%20or%20radio%20button%20element%22%2C%22msgArgs%22%3A%5B%22%7B0%7D%22%2C%22%7B1%7D%22%2C%22%7B3%7D%22%2C%22%7B4%7D%22%5D%2C%22value%22%3A%5B%22VIOLATION%22%2C%22FAIL%22%5D%2C%22reasonId%22%3A%22Fail_2%22%7D)

### Changed
- Changed how additionalVariables in buildForm() (and it's variants) work. Instead of <name, extension obj> which doesn't provide much value,
  it now works more like a fhirPathContext <name, value> where `value` is the evaluated value from fhirpath.evaluate(). additionalVariables likely will come from a pre-population module (like sdc-populate) which then can be injected into the renderer's fhirPathContext.

## [1.0.0-alpha.64] - 2025-06-05
### Fixed
- Fixed an issue where cqfExpressions are not evaluated when the QuestionnaireResponse is first initialised.

### Changed
- Changed how additionalVariables in buildForm() (and it's variants) work. Instead of <name, extension obj> which doesn't provide much value, 
  it now works more like a fhirPathContext <name, value> where `value` is the evaluated value from fhirpath.evaluate(). additionalVariables likely will come from a pre-population module (like sdc-populate) which then can be injected into the renderer's fhirPathContext.

## [1.0.0-alpha.63] - 2025-06-05
### Fixed
- Fixed an issue where group table cells content is not centre-aligned.

## [1.0.0-alpha.62] - 2025-06-05
### Added
- Added "X" clear buttons to text-based input fields, update renderer to alpha.62.

### Fixed
- Fixed an issue where items in a group table cell doesn't use all available space.
- Centred group table headers.

## [1.0.0-alpha.61] - 2025-06-05
### Fixed
- Fixed colour differences between readOnly and editable text-based input fields.
- Fixed an issue where group table and grid child items can be edited even when the parent group is readOnly.
- Removed add, remove, drag, check interactions for readOnly group tables.
- Prevent rendering of "Clear" button for radio and checkbox items when they are readOnly.
- Centred cell content in group table and grid table.

### Changed
- Changed all usages of MUI LoadingButton to Button - see https://mui.com/material-ui/migration/upgrade-to-v6/#button-with-loading-state.

## [1.0.0-alpha.60] - 2025-06-04
### Fixed
- Fixed an issue where "sparsity" of grid group cells doesn't work as expected.

## [1.0.0-alpha.59] - 2025-06-04
### Added
- CSS read-only (different from Questionnaire item.readOnly) text-based input items now have cursor set to [`default`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values).

## [1.0.0-alpha.58] - 2025-06-03
### Fixed
- Fixed number of columns shown and widths when a group table has a hidden item.
- Updated sdc-populate to v4.3.0. Changes as follows:
- Fixed an [issue](https://github.com/aehrc/smart-forms/issues/1258) where a repeating group using ItemPopulationContext only looks at the first item in the group to determine the itemPopulationContext used.
- Included author and authored property when creating a QuestionnaireResponse.

## [1.0.0-alpha.57] - 2025-05-27
### Changed
- Changed inline validation messages to be shown when the field loses focus. See [issue](https://github.com/aehrc/smart-forms/issues/1219).

## [1.0.0-alpha.56] - 2025-05-26
### Added
- Exposed getSectionHeading() as a library function

### Changed
- Use fast-equals deepEqual() instead of lodash.isEqual() for better performance.

## [1.0.0-alpha.55] - 2025-05-07
### Added
- Updated @aehrc/sdc-populate to 4.1.0. It now uses the same removeEmptyAnswers() implementation as the renderer, which is more battle tested.

## [1.0.0-alpha.54] - 2025-05-07
### Fixed
- Dynamic _answerValueSet options now updates consistently.
- Whenever dynamic _answerValueSet options change, the item fields is now cleared consistently.

## [1.0.0-alpha.53] - 2025-05-02
### Added
- Support for dynamic _answerValueSet in choice and open-choice items. Allows a dynamic answerValueSet URL that dynamic updates the answer options.

## [1.0.0-alpha.51 and 1.0.0-alpha.52] - 2025-05-02
### Changed
- Use individual MUI icon imports in ChoiceAutocompleteField.tsx and ChoiceAutocompleteField.tsx.

## [1.0.0-alpha.50] - 2025-04-29
### Added
- Added support for answerOptionToggleExpressions.
- Added partial support for the facing sync icons when expressions are updated in choice/open-choice checkboxes and radio buttons e.g. dynamicValueSets, answerOptionToggleExpressions.

### Changed
- Refactored a bunch of choice/open-choice checkboxes and radio buttons to make them cleaner and reduce code duplication.

## [1.0.0-alpha.49] - 2025-04-29
### Fixed
- Fixed an issue where the initial QuestionnaireResponse has empty `item` arrays in `group` items. This was causing client-side and server-side validation errors.

## [1.0.0-alpha.48] - 2025-04-29
### Added
- Added partial accessibility support for checkboxes and radio buttons, notably:
- Read-only elements with role="radiogroup" be given aria-readonly="true"
- Checkboxes has role="checkbox" and if they are read-only elements, aria-readonly="true" as well.
- Prevent the cursor from changing to "pointer" when read-only checkboxes and radio buttons are hovered, ripple effects on interaction are also removed.
- Item labels now have `id` of `'label-' + qItem.linkId`.
- Checkbox FormGroups and RadioGroups have `aria-labelledby` set to the item label id.

## [1.0.0-alpha.47] - 2025-04-14
Note: this version doesn't build properly, use v1.0.0-alpha.48 instead.

## [1.0.0-alpha.46] - 2025-04-11
### Fixed
- Fixed an issue where open-choice dropdown items do not properly capture the value of the selected option. See commit [fc0e1a1](https://github.com/aehrc/smart-forms/commit/fc0e1a13a40d4a1f75b539c51668b9c7f0becbba#diff-db6a1b159d5bc1503013db341ace31a9369a24e9c8ef2098d59f19422d809aa6).

## [1.0.0-alpha.44 and 1.0.0-alpha.45] - 2025-04-10
### Fixed
- Use `<div>` or `<span>`  tags to all MUI Typography instances, so they won't be renderer as <p> tags. Some apps might apply CSS styles to <p> tags that will affect their rendering.

## [1.0.0-alpha.43] - 2025-04-10
### Fixed
- Fixed an issue where quantity unit and comparator dropdown fields are bugging out in read-only mode.

## [1.0.0-alpha.42] - 2025-04-10
_(WARNING: Possible major breaking changes with MUI, MUI theming, Tanstack React Query, SDC-Populate, SDC-Assemble)_
### Changed (See https://github.com/aehrc/smart-forms/pull/1182#issuecomment-2795771013)
- Upgraded to Material-UI v7. Follow the [migration guide](https://mui.com/material-ui/migration/upgrade-to-v7/) to update your MUI to v7. [Grid](https://mui.com/material-ui/react-grid/) is especially one to pay attention to.
- Upgraded to React Query v5. Follow the [migration guide](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5) to update your React Query to v5.
- All peer dependencies have become dependencies except for `react` and `react-dom`. See https://github.com/aehrc/smart-forms/issues/1179. This is because Angular and Vue apps consuming this library do not usually have React-specific libraries like MUI or React Query.
- Only supports React 18 and React 19 officially. It might work on React 17, but you might need to do `npm i --legacy-peer-deps` or `npm i --force`.
- SDC-Populate and SDC-Assemble interface changes: `FetchResourceCallback`, `FetchTerminologyCallback`, `FetchResourceRequestConfig`, `FetchTerminologyRequestConfig`.
- It is now a requirement for `FetchResourceRequestConfig` to have a sourceServerUrl as the FHIR server URL to fetch resources from.
- It is now a requirement for `FetchTerminologyRequestConfig` to have a terminologyServerUrl as the FHIR Terminology server URL to fetch terminology from.

### Fixed
- Revert non-readOnly text-based fields to old border colour (MUI default grey-ish).

## [1.0.0-alpha.41] - 2025-04-08
### Changed
- Capped peer React version at ^18.0.0. Reason being there are multiple dependencies that are not compatible with React 19.x.x.
- When reading XHTML class styles, skip stylesheets from other origins

## [1.0.0-alpha.40] - 2025-04-08
### Added
- Added support for HTML readonly `attribute` as an alternative to `disabled` for readOnly items. See https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly#attribute_interactions for more information.
- You can toggle between these two visual styles/behaviours via the `readOnlyVisualStyle` config in `RendererStylingStore`.

## [1.0.0-alpha.39] - 2025-04-04
### Changed
- Completely refactored removeEmptyAnswers() implementation to work with repeat groups.

### Fixed
- Add support for repeat groups in initialisation of calculatedExpressions.

## [1.0.0-alpha.38] - 2025-04-02
### Added
- Add support for class-based styles for XHTML item._text. See https://github.com/aehrc/smart-forms/issues/1120#issuecomment-2771327317 for more information.

## [1.0.0-alpha.37] - 2025-04-02
### Fixed
- Fixed an issue where display instructions persists even when the item has an error message.

## [1.0.0-alpha.36] - 2025-04-02
### Fixed
- Fixed an issue where SDC itemControl `collapsible` doesn't work with Group Table.

## [1.0.0-alpha.35] - 2025-04-01
### Added
- Implement Parameterised/Dynamic ValueSets
- Proposal: https://build.fhir.org/ig/FHIR/fhir-tools-ig/parameterized-valuesets.html
- chat.fhir.org channel: https://chat.fhir.org/#narrow/channel/179202-terminology/topic/Parameterised.20ValueSets/with/509420458

## [1.0.0-alpha.34] - 2025-03-27
### Added
- Implement partial support for header and footer itemControls - header and footer will render properly but will not be sticky.

### Changed
- Allow two methods for defining SDC itemControl `page`:
  1. Standards-based as defined in SDC: https://hl7.org/fhir/extensions/CodeSystem-questionnaire-item-control.html#questionnaire-item-control-page
  2. Backwards-compatible way - using it as a "page-container"

## [1.0.0-alpha.33] - 2025-03-27
### Fixed
- Allow `extension` property in valueCodings i.e. `ordinalValue` extension usage. 

## [1.0.0-alpha.32] - 2025-03-27
### Fixed
- Fixed an issue where SDC itemControl `collapsible`'s `default-open` value doesn't work as expected.

## [1.0.0-alpha.31] - 2025-03-26
### Added
- Add support for when a form tab and next/previous tab buttons is clicked, it focuses on the heading of the tab's content.

## [1.0.0-alpha.30] - 2025-03-26
### Added
- Read styles from XHTML item._text and apply it to children items.

## [1.0.0-alpha.29] - 2025-03-11
### Fixed
- Fixed infinite updating of string-based calculatedExpressions when the input is empty and the new value is Falsy (null, undefined, "", etc)

### Changed
- Display items now do not classify as HTML labels.

## [1.0.0-alpha.28] - 2025-03-11
### Fixed
- Only allow valueCodings to have system, code and display properties. This is to prevent unexpected properties in the QuestionnaireResponse causing validation errors.

## [1.0.0-alpha.27] - 2025-03-05
### Fixed
- Restore flex-grow: 1 in ItemLabel and GroupHeading to work with XHTML and markdown renderings with 100% width


## [1.0.0-alpha.26] - 2025-03-05
_(WARNING: Major breaking changes with MUI, theming and rendererStylingStore)_
### Added
- Allow overriding of Typography "groupHeading" to dictate stylings of group headings
- Allow overriding of Typography "label" to dictate stylings of item labels (replacing `itemLabelFontWeight` in RendererStylingStore)
- Add (a much-needed) JSDoc for RendererStylingStore.
- Group headings now have a proper sequence for heading semantics based on level of nesting i.e h1, h2, h3, h4, h5, h6

### Changed
- Upgraded to Material-UI v6. Follow the [migration guide](https://mui.com/material-ui/migration/upgrade-to-v6/) to update your MUI to v6.
- Changed `tabListFixedWidth` to a more flexible `tabListWidthOrResponsive`.
- Changed `itemLabelGridBreakpoints` and `itemFieldGridBreakpoints` to a more flexible `itemResponsive`.
- `itemLabelGridBreakpoints` is now `itemResponsive.labelBreakpoints`. `itemFieldGridBreakpoints` is now `itemResponsive.fieldBreakpoints`
- Allow customisation of gaps between item labels and fields via `itemResponsive.columnGapPixels` and `itemResponsive.rowGapPixels`.
- Refactor `ItemLabel` and `GroupHeading`. `ItemLabelWrapper` is now called `ItemLabel`.
- Refactor `typographyOptions` in renderer theme to have increased font sizes.
- Remove custom backgrounds, shadows and colours from theme.
- Minor font size adjustments throughout components.
- Changed flyover icon and text.
- Removed `itemLabelFontWeight` from RendererStylingStore. Use MUI Typography `label` to customise item label styling.

### Fixed
- Fixed sequencing of `groupCardElevation`.


## [1.0.0-alpha.25] - 2025-02-28
_(WARNING: Breaking changes for id-based e2e testing)_
### Added
- Associated labels in ItemLabelText explicitly (via htmlFor + id) to all item types except time.

### Changed
- All input ids are now prepended with item.type i.e. item.type + "-" + item.linkId

## [1.0.0-alpha.24] - 2025-02-26
### Added
- Add support for required-based validation and the useValidationFeedback hook to all item types except date and dateTime.
- Add feedbackFromParent property in QItemOverrideComponentProps and SingleItem to manually pass feedback into a single item.

## [1.0.0-alpha.23] - 2025-02-26
### Added
- Implemented highlightRequiredItems function in QuestionnaireResponseStore to manually highlight required items in the UI.
- Add useValidationFeedback support to boolean and radio buttons.
- Add support for "required-feedback" extension (custom extension) to customise displayed feedback for required items.

### Fixed
- Remove false positive FHIRPath warnings due to unresolvable x-fhir-query variables.

## [1.0.0-alpha.22] - 2025-02-21
### Added
- Added support for the targetConstraint extension for target constraint-based validation and item feedback.

### Fixed
- Fixed an issue where higher fixed width values for the tab list may cause the tab content to wrap below the tab list.

## [1.0.0-alpha.21] - 2025-02-20
### Added
- Added a hook to set a fixed width for the tab list within a tabbed form in RendererStylingStore.

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
