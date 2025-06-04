# Change log for alpha releases

This log documents significant changes for [@aehrc/smart-forms-renderer's alpha releases](https://www.npmjs.com/package/@aehrc/smart-forms-renderer). This project follows
[Semantic Versioning](http://semver.org/).

This changelog only includes changes from version 1.0.0-alpha.1 onwards. For stable releases, refer to the main [CHANGELOG.md](CHANGELOG.md).


WARNING: Alpha releases are not stable and may contain breaking changes. Changes are also most likely to be undocumented.


## [1.0.0-alpha.59] - 2025-06-04
### Added
- CSS read-only (different from Questionnaire item.readOnly) text-based input items now have cursor set to [`default`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values).


## [1.0.0-alpha.58] - 2025-06-03
### Fixed
- Fixed number of columns shown and widths when a group table has a hidden item.
- Updated sdc-populate to v4.3.0. Changes as follows:
- Fixed an [issue](https://github.com/aehrc/smart-forms/issues/1258) where a repeating group using ItemPopulationContext only looks at the first item in the group to determine the itemPopulationContext used.
- Include author and authored property when creating a QuestionnaireResponse.

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
