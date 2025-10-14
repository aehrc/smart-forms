# @aehrc/smart-forms-renderer

## Namespaces

| Namespace | Description |
| ------ | ------ |
| [testUtils](@aehrc/namespaces/testUtils/index.md) | - |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [BuildFormParams](interfaces/BuildFormParams.md) | Parameters for `buildForm()`. |
| [CalculatedExpression](interfaces/CalculatedExpression.md) | CalculatedExpression interface |
| [ItemToRepopulate](interfaces/ItemToRepopulate.md) | Represents an item within a questionnaire that can be re-populated with updated data from the patient record. |
| [LaunchContext](interfaces/LaunchContext.md) | LaunchContext interface |
| [QItemOverrideComponentProps](interfaces/QItemOverrideComponentProps.md) | - |
| [QuestionnaireResponseStoreType](interfaces/QuestionnaireResponseStoreType.md) | QuestionnaireResponseStore properties and methods Properties can be accessed for fine-grain details. Methods are usually used internally, but it is possible to use them externally to hook into the renderer for more fine-grain control. |
| [QuestionnaireStoreType](interfaces/QuestionnaireStoreType.md) | QuestionnaireStore properties and methods Properties can be accessed for fine-grain details. Methods are usually used internally, using them from an external source is not recommended. |
| [RendererConfig](interfaces/RendererConfig.md) | RendererConfig interface Provides fine-grained control over the styling and behaviour of the renderer. |
| [RendererConfigStoreType](interfaces/RendererConfigStoreType.md) | RendererConfigStore properties and methods |
| [RepopulateFormParams](interfaces/RepopulateFormParams.md) | Parameters for `repopulateForm()`. |
| [SdcUiOverrideComponentProps](interfaces/SdcUiOverrideComponentProps.md) | - |
| [SmartConfigStoreType](interfaces/SmartConfigStoreType.md) | SmartConfigStore properties and methods Properties can be accessed for fine-grain details. Methods are usually used internally, using them from an external source is not recommended. |
| [SmartFormsRendererProps](interfaces/SmartFormsRendererProps.md) | SmartFormsRenderer properties |
| [TerminologyServerStoreType](interfaces/TerminologyServerStoreType.md) | TerminologyServerStore properties and methods Properties can be accessed for fine-grain details. Methods are usually used internally, using them from an external source is not recommended. |
| [UseResponsiveProps](interfaces/UseResponsiveProps.md) | Props for the useResponsive() hook - used to determine if the screen size matches a given breakpoint query. |
| [Variables](interfaces/Variables.md) | Variables interface |
| [VariableXFhirQuery](interfaces/VariableXFhirQuery.md) | VariableXFhirQuery interface |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [Tab](type-aliases/Tab.md) | Tab interface |
| [Tabs](type-aliases/Tabs.md) | Key-value pair of tabs `Record<linkId, Tab>` |

## Variables

| Variable | Description |
| ------ | ------ |
| [BooleanField](variables/BooleanField.md) | - |
| [FullWidthFormComponentBox](variables/FullWidthFormComponentBox.md) | - |
| [ItemLabel](variables/ItemLabel.md) | - |
| [questionnaireResponseStore](variables/questionnaireResponseStore.md) | QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaireResponse. This is the vanilla version of the store which can be used in non-React environments. |
| [questionnaireStore](variables/questionnaireStore.md) | Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire. This is the vanilla version of the store which can be used in non-React environments. |
| [rendererConfigStore](variables/rendererConfigStore.md) | - |
| [rendererThemeOptions](variables/rendererThemeOptions.md) | - |
| [smartConfigStore](variables/smartConfigStore.md) | Smart Config state management store. This is only used for answerExpressions. It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities. Will be deprecated in version 1.0.0. |
| [terminologyServerStore](variables/terminologyServerStore.md) | Terminology server state management store. This is used for resolving valueSets externally. Defaults to use https://tx.ontoserver.csiro.au/fhir. This is the vanilla version of the store which can be used in non-React environments. |
| [useQuestionnaireResponseStore](variables/useQuestionnaireResponseStore.md) | QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaire. This is the React version of the store which can be used as React hooks in React functional components. |
| [useQuestionnaireStore](variables/useQuestionnaireStore.md) | Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire. This is the React version of the store which can be used as React hooks in React functional components. |
| [useRendererConfigStore](variables/useRendererConfigStore.md) | - |
| [useSmartConfigStore](variables/useSmartConfigStore.md) | Smart Config state management store. This is only used for answerExpressions. It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities. Will be deprecated in version 1.0.0. |
| [useTerminologyServerStore](variables/useTerminologyServerStore.md) | Terminology server state management store. This is used for resolving valueSets externally. Defaults to use https://tx.ontoserver.csiro.au/fhir. This is the React version of the store which can be used as React hooks in React functional components. |

## Functions

| Function | Description |
| ------ | ------ |
| [accordionOverride](functions/accordionOverride.md) | - |
| [autocompleteOverride](functions/autocompleteOverride.md) | - |
| [BaseRenderer](functions/BaseRenderer.md) | Main component of the form-rendering engine. Renders the Questionnaire and QuestionnaireResponse defined in the state management stores QuestionnaireStore and QuestionnaireResponseStore respectively. Use buildForm() in your wrapping component or in an event handler to initialise the form. |
| [buildBundleFromObservationArray](functions/buildBundleFromObservationArray.md) | - |
| [buildForm](functions/buildForm.md) | Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse. If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse. |
| [buttonOverride](functions/buttonOverride.md) | - |
| [canBeObservationExtracted](functions/canBeObservationExtracted.md) | Checks whether a Questionnaire or any of its items contains a valid `sdc-questionnaire-observationExtract` extension (and if it's at the item level, a valid item.code too). Array.prototype.some() is short-circuiting, so it will return true as soon as it finds a valid extension. |
| [cardOverride](functions/cardOverride.md) | - |
| [ChoiceRadioSingle](functions/ChoiceRadioSingle.md) | - |
| [createEmptyQrGroup](functions/createEmptyQrGroup.md) | Create an empty group qrItem from a given group qItem |
| [createEmptyQrItem](functions/createEmptyQrItem.md) | Create an empty qrItem from a given qItem, optionally with an answer key |
| [DecimalField](functions/DecimalField.md) | - |
| [destroyForm](functions/destroyForm.md) | Destroy the form to clean up the questionnaire and questionnaireResponse stores. |
| [extractObservationBased](functions/extractObservationBased.md) | Extract an array of Observations from a QuestionnaireResponse and its source Questionnaire. |
| [generateItemsToRepopulate](functions/generateItemsToRepopulate.md) | Compare latest data from the server with the current QuestionnaireResponse and decide items to re-populate |
| [getDecimalPrecision](functions/getDecimalPrecision.md) | Check if the decimal value has a quantity precision for the decimal value |
| [getQrItemsIndex](functions/getQrItemsIndex.md) | Generate an array of QuestionnaireResponseItems corresponding to its QuestionnaireItem indexes an array. QuestionnaireItems without a corresponding QuestionnaireResponseItem is set as undefined. i.e. QItems = [QItem0, QItem1, QItem2]. Only QItem0 and QItem2 have QrItems Generated array: [QrItem0, undefined, QrItem2] Note: There's a bug where if the qItems are child items from a repeat group, the function fails at the isRepeatGroup line. Ensure that repeat groups are handled prior to calling this function. |
| [getQuestionnaireItem](functions/getQuestionnaireItem.md) | - |
| [getResponse](functions/getResponse.md) | Get the filled QuestionnaireResponse at its current state. If no changes have been made to the form, the initial QuestionnaireResponse is returned. |
| [getSectionHeading](functions/getSectionHeading.md) | Returns the section heading text for a given linkId in a questionnaire, used to label tab sections. |
| [GridGroup](functions/GridGroup.md) | Main component to render a Group Grid (grid) Questionnaire item. |
| [GroupItem](functions/GroupItem.md) | - |
| [GroupTable](functions/GroupTable.md) | Main component to render a Group Table (gtable) Questionnaire item. |
| [initialiseQuestionnaireResponse](functions/initialiseQuestionnaireResponse.md) | Initialise a questionnaireResponse from a given questionnaire optionally takes in an existing questionnaireResponse to be initialised |
| [inputOverride](functions/inputOverride.md) | - |
| [isHiddenByEnableWhen](functions/isHiddenByEnableWhen.md) | - |
| [isRepeatItemAndNotCheckbox](functions/isRepeatItemAndNotCheckbox.md) | Check if qItem is a repeat item AND if it isn't a checkbox item Note: repeat checkbox items are rendered as multi-select checkbox instead of being rendered as a traditional repeat item |
| [isSpecificItemControl](functions/isSpecificItemControl.md) | Check if the extension has an itemControl code equal to the given itemControlCode |
| [ItemFieldGrid](functions/ItemFieldGrid.md) | - |
| [mapQItemsIndex](functions/mapQItemsIndex.md) | Generate a dictionary of QuestionnaireItems linkIds mapped to their respective array indexes `<linkId, QItemIndex>` i.e. `{ ee2589d5: 0, f9aaa187: 1, 88cab112: 2 }` where ee2589d5, f9aaa187 and 88cab112 are linkIds of QItem0, QItem1 and QItem2 respectively |
| [paperOverride](functions/paperOverride.md) | - |
| [parseDecimalStringToFloat](functions/parseDecimalStringToFloat.md) | - |
| [parseDecimalStringWithPrecision](functions/parseDecimalStringWithPrecision.md) | - |
| [parseFhirDateTimeToDisplayDateTime](functions/parseFhirDateTimeToDisplayDateTime.md) | Parse a FHIR dateTime string to a human-readable display format. Supports full and partial FHIR dateTime values. |
| [parseFhirDateToDisplayDate](functions/parseFhirDateToDisplayDate.md) | Parse a FHIR date string to a human-readable display format. |
| [removeEmptyAnswersFromResponse](functions/removeEmptyAnswersFromResponse.md) | Remove all empty/hidden answers from the filled QuestionnaireResponse. This takes into account enableWhens, enableWhenExpressions, items without item.answer, empty item.answer arrays and empty strings. This does not remove items that are hidden by the http://hl7.org/fhir/StructureDefinition/questionnaire-hidden extension. |
| [removeInternalIdsFromResponse](functions/removeInternalIdsFromResponse.md) | Remove all instances of item.answer.id from the filled QuestionnaireResponse. These IDs are used internally for rendering repeating items, and can be safely left out of the final response. |
| [rendererThemeComponentOverrides](functions/rendererThemeComponentOverrides.md) | - |
| [RendererThemeProvider](functions/RendererThemeProvider.md) | Default theme used by the renderer using Material UI. You can customise your own theme by defining a new ThemeProvider. |
| [RepeatGroup](functions/RepeatGroup.md) | Main component to render a repeating, group Questionnaire item. Store and manages the state of multiple instances of GroupItem in a repeating group. |
| [RepeatItem](functions/RepeatItem.md) | Main component to render a repeating, non-group Questionnaire item. |
| [repopulateForm](functions/repopulateForm.md) | Re-populate the form with a provided (already filled) QuestionnaireResponse. |
| [repopulateResponse](functions/repopulateResponse.md) | Re-populate checked items in the re-population dialog into the current QuestionnaireResponse |
| [SingleItem](functions/SingleItem.md) | Main component to render a repeating, non-group Questionnaire item. Store and manages the state of multiple instances of SingleItem in a repeating item. |
| [SmartFormsRenderer](functions/SmartFormsRenderer.md) | A self-initialising wrapper around the BaseRenderer rendering engine. |
| [speedDialOverride](functions/speedDialOverride.md) | - |
| [StringField](functions/StringField.md) | - |
| [tableOverride](functions/tableOverride.md) | - |
| [updateQrItemsInGroup](functions/updateQrItemsInGroup.md) | Updates the QuestionnaireResponseItem group by adding/removing a new/modified child QuestionnaireResponseItem into/from a qrGroup Takes either a single newQrItem or an array of newQrItems |
| [useBuildForm](functions/useBuildForm.md) | React hook wrapping around [buildForm](functions/buildForm.md) to build a form from a Questionnaire and an optional filled QuestionnaireResponse. If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse. |
| [useDisplayCqfAndCalculatedExpression](functions/useDisplayCqfAndCalculatedExpression.md) | Returns the value of a cqf-expression, calculatedExpression or ItemTextAriaLabelExpression. |
| [useHidden](functions/useHidden.md) | React hook to determine if a QuestionnaireItem is hidden via item.hidden, enableWhens, enableWhenExpressions. When checking for repeating group enableWhen items, the parentRepeatGroupIndex should be provided. |
| [useReadOnly](functions/useReadOnly.md) | - |
| [useRendererQueryClient](functions/useRendererQueryClient.md) | Default QueryClient used by the renderer. You can customise your own QueryClient with your own options, use v5 of @tanstack/react-query. |
| [useRenderingExtensions](functions/useRenderingExtensions.md) | - |
| [useResponsive](functions/useResponsive.md) | A hook to determine if the screen size matches a given breakpoint query. |
| [useValidationFeedback](functions/useValidationFeedback.md) | - |
| [useValueSetCodings](functions/useValueSetCodings.md) | - |
