# @aehrc/smart-forms-renderer

## Interfaces

| Interface | Description |
| ------ | ------ |
| [CalculatedExpression](interfaces/CalculatedExpression.md) | CalculatedExpression interface |
| [InitialiseFormWrapperProps](interfaces/InitialiseFormWrapperProps.md) | - |
| [ItemToRepopulate](interfaces/ItemToRepopulate.md) | ItemToRepopulate interface |
| [LaunchContext](interfaces/LaunchContext.md) | LaunchContext interface |
| [QItemOverrideComponentProps](interfaces/QItemOverrideComponentProps.md) | - |
| [QuestionnaireResponseStoreType](interfaces/QuestionnaireResponseStoreType.md) | QuestionnaireResponseStore properties and methods Properties can be accessed for fine-grain details. Methods are usually used internally, using them from an external source is not recommended. |
| [QuestionnaireStoreType](interfaces/QuestionnaireStoreType.md) | QuestionnaireStore properties and methods Properties can be accessed for fine-grain details. Methods are usually used internally, using them from an external source is not recommended. |
| [RendererStyling](interfaces/RendererStyling.md) | - |
| [RendererStylingStoreType](interfaces/RendererStylingStoreType.md) | RendererStylingStore properties and methods |
| [SdcUiOverrideComponentProps](interfaces/SdcUiOverrideComponentProps.md) | - |
| [SmartConfigStoreType](interfaces/SmartConfigStoreType.md) | SmartConfigStore properties and methods Properties can be accessed for fine-grain details. Methods are usually used internally, using them from an external source is not recommended. |
| [SmartFormsRendererProps](interfaces/SmartFormsRendererProps.md) | SmartFormsRenderer properties |
| [TerminologyServerStoreType](interfaces/TerminologyServerStoreType.md) | TerminologyServerStore properties and methods Properties can be accessed for fine-grain details. Methods are usually used internally, using them from an external source is not recommended. |
| [Variables](interfaces/Variables.md) | Variables interface |
| [VariableXFhirQuery](interfaces/VariableXFhirQuery.md) | VariableXFhirQuery interface |

## Type Aliases

| Type alias | Description |
| ------ | ------ |
| [Tab](type-aliases/Tab.md) | Tab interface |
| [Tabs](type-aliases/Tabs.md) | Key-value pair of tabs `Record<linkId, Tab>` |

## Variables

| Variable | Description |
| ------ | ------ |
| [questionnaireResponseStore](variables/questionnaireResponseStore.md) | QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaireResponse. This is the vanilla version of the store which can be used in non-React environments. |
| [questionnaireStore](variables/questionnaireStore.md) | Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire. This is the vanilla version of the store which can be used in non-React environments. |
| [rendererStylingStore](variables/rendererStylingStore.md) | - |
| [smartConfigStore](variables/smartConfigStore.md) | Smart Config state management store. This is only used for answerExpressions. It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities. Will be deprecated in version 1.0.0. |
| [terminologyServerStore](variables/terminologyServerStore.md) | Terminology server state management store. This is used for resolving valueSets externally. Defaults to use https://tx.ontoserver.csiro.au/fhir. This is the vanilla version of the store which can be used in non-React environments. |
| [useQuestionnaireResponseStore](variables/useQuestionnaireResponseStore.md) | QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaire. This is the React version of the store which can be used as React hooks in React functional components. |
| [useQuestionnaireStore](variables/useQuestionnaireStore.md) | Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire. This is the React version of the store which can be used as React hooks in React functional components. |
| [useRendererStylingStore](variables/useRendererStylingStore.md) | - |
| [useSmartConfigStore](variables/useSmartConfigStore.md) | Smart Config state management store. This is only used for answerExpressions. It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities. Will be deprecated in version 1.0.0. |
| [useTerminologyServerStore](variables/useTerminologyServerStore.md) | Terminology server state management store. This is used for resolving valueSets externally. Defaults to use https://tx.ontoserver.csiro.au/fhir. This is the React version of the store which can be used as React hooks in React functional components. |

## Functions

| Function | Description |
| ------ | ------ |
| [BaseRenderer](functions/BaseRenderer.md) | Main component of the form-rendering engine. Renders the Questionnaire and QuestionnaireResponse defined in the state management stores QuestionnaireStore and QuestionnaireResponseStore respectively. Use buildForm() in your wrapping component or in an event handler to initialise the form. |
| [BooleanField](functions/BooleanField.md) | **NOTE**: Exotic components are not callable. |
| [buildForm](functions/buildForm.md) | Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse. If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse. There are other optional properties such as applying readOnly, providing a terminology server url and additional variables. |
| [ChoiceRadioSingle](functions/ChoiceRadioSingle.md) | - |
| [createEmptyQrGroup](functions/createEmptyQrGroup.md) | Create an empty group qrItem from a given group qItem |
| [createEmptyQrItem](functions/createEmptyQrItem.md) | Create an empty qrItem from a given qItem, optionally with an answer key |
| [DecimalField](functions/DecimalField.md) | - |
| [destroyForm](functions/destroyForm.md) | Destroy the form to clean up the questionnaire and questionnaireResponse stores. |
| [extractObservationBased](functions/extractObservationBased.md) | Extract an array of Observations from a QuestionnaireResponse and its source Questionnaire. |
| [FullWidthFormComponentBox](functions/FullWidthFormComponentBox.md) | - |
| [generateItemsToRepopulate](functions/generateItemsToRepopulate.md) | Compare latest data from the server with the current QuestionnaireResponse and decide items to re-populate |
| [getDecimalPrecision](functions/getDecimalPrecision.md) | Check if the decimal value has a quantity precision for the decimal value |
| [getQrItemsIndex](functions/getQrItemsIndex.md) | Generate an array of QuestionnaireResponseItems corresponding to its QuestionnaireItem indexes an array. QuestionnaireItems without a corresponding QuestionnaireResponseItem is set as undefined. i.e. QItems = [QItem0, QItem1, QItem2]. Only QItem0 and QItem2 have QrItems Generated array: [QrItem0, undefined, QrItem2] Note: There's a bug where if the qItems are child items from a repeat group, the function fails at the isRepeatGroup line. Ensure that repeat groups are handled prior to calling this function. |
| [getQuestionnaireItem](functions/getQuestionnaireItem.md) | - |
| [getResponse](functions/getResponse.md) | Get the filled QuestionnaireResponse at its current state. If no changes have been made to the form, the initial QuestionnaireResponse is returned. |
| [GridGroup](functions/GridGroup.md) | Main component to render a Group Grid (grid) Questionnaire item. |
| [GroupItem](functions/GroupItem.md) | - |
| [GroupTable](functions/GroupTable.md) | Main component to render a Group Table (gtable) Questionnaire item. |
| [InitialiseFormWrapperForStorybook](functions/InitialiseFormWrapperForStorybook.md) | This is a one-to-one replacement for the SmartFormsRenderer for demo purposes. Instead of using this React component, define your own wrapper component that uses the BaseRenderer directly. Things to note: - It is required to wrap the BaseRenderer with the QueryClientProvider to make requests. - You can wrap the BaseRenderer with the RendererThemeProvider to apply the default renderer theme used in Smart Forms. Optionally, you can define your own ThemeProvider https://mui.com/material-ui/customization/theming/. - Make your buildForm() call in a button click or other event handler. Alternatively, you can use the useInitialiseForm hook to initialise the form. - Make your own initialiseFhirClient() call in a button click or other event handler. Alternatively, you can use the useInitialiseForm hook to initialise the form. - The initialised FHIRClient is only used for further FHIR calls. It does not provide pre-population capabilities. |
| [initialiseQuestionnaireResponse](functions/initialiseQuestionnaireResponse.md) | Initialise a questionnaireResponse from a given questionnaire optionally takes in an existing questionnaireResponse to be initialised |
| [isHiddenByEnableWhen](functions/isHiddenByEnableWhen.md) | - |
| [isRepeatItemAndNotCheckbox](functions/isRepeatItemAndNotCheckbox.md) | Check if qItem is a repeat item AND if it isn't a checkbox item Note: repeat checkbox items are rendered as multi-select checkbox instead of being rendered as a traditional repeat item |
| [isSpecificItemControl](functions/isSpecificItemControl.md) | Check if the extension has an itemControl code equal to the given itemControlCode |
| [ItemFieldGrid](functions/ItemFieldGrid.md) | - |
| [ItemLabelWrapper](functions/ItemLabelWrapper.md) | - |
| [mapQItemsIndex](functions/mapQItemsIndex.md) | Generate a dictionary of QuestionnaireItems linkIds mapped to their respective array indexes `<linkId, QItemIndex>` i.e. `{ ee2589d5: 0, f9aaa187: 1, 88cab112: 2 }` where ee2589d5, f9aaa187 and 88cab112 are linkIds of QItem0, QItem1 and QItem2 respectively |
| [objectIsCoding](functions/objectIsCoding.md) | - |
| [parseDecimalStringToFloat](functions/parseDecimalStringToFloat.md) | - |
| [parseDecimalStringWithPrecision](functions/parseDecimalStringWithPrecision.md) | - |
| [parseFhirDateToDisplayDate](functions/parseFhirDateToDisplayDate.md) | Parse a FHIR date string to a date to be consumed and displayed by the DateItem component. |
| [removeEmptyAnswersFromResponse](functions/removeEmptyAnswersFromResponse.md) | Remove all empty/hidden answers from the filled QuestionnaireResponse. This takes into account enableWhens, enableWhenExpressions, items without item.answer, empty item.answer arrays and empty strings. This does not remove items that are hidden by the http://hl7.org/fhir/StructureDefinition/questionnaire-hidden extension. |
| [removeInternalIdsFromResponse](functions/removeInternalIdsFromResponse.md) | Remove all instances of item.answer.id from the filled QuestionnaireResponse. These IDs are used internally for rendering repeating items, and can be safely left out of the final response. |
| [RendererThemeProvider](functions/RendererThemeProvider.md) | Default theme used by the renderer using Material UI. You can customise your own theme by defining a new ThemeProvider. |
| [RepeatGroup](functions/RepeatGroup.md) | Main component to render a repeating, group Questionnaire item. Store and manages the state of multiple instances of GroupItem in a repeating group. |
| [RepeatItem](functions/RepeatItem.md) | Main component to render a repeating, non-group Questionnaire item. |
| [repopulateResponse](functions/repopulateResponse.md) | Re-populate checked items in the re-population dialog into the current QuestionnaireResponse |
| [SingleItem](functions/SingleItem.md) | Main component to render a repeating, non-group Questionnaire item. Store and manages the state of multiple instances of SingleItem in a repeating item. |
| [SmartFormsRenderer](functions/SmartFormsRenderer.md) | A self-initialising wrapper around the BaseRenderer rendering engine. Will be deprecated in version 1.0.0. For alternative usage, see: - https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/InitialiseFormWrapperForStorybook.tsx#L40-L57 |
| [StringField](functions/StringField.md) | - |
| [updateQrItemsInGroup](functions/updateQrItemsInGroup.md) | Updates the QuestionnaireResponseItem group by adding/removing a new/modified child QuestionnaireResponseItem into/from a qrGroup Takes either a single newQrItem or an array of newQrItems |
| [useBuildForm](functions/useBuildForm.md) | React hook wrapping around the buildForm() function to build a form from a questionnaire and an optional QuestionnaireResponse. |
| [useCodingCalculatedExpression](functions/useCodingCalculatedExpression.md) | - |
| [useDisplayCqfAndCalculatedExpression](functions/useDisplayCqfAndCalculatedExpression.md) | - |
| [useHidden](functions/useHidden.md) | React hook to determine if a QuestionnaireItem is hidden via item.hidden, enableWhens, enableWhenExpressions. When checking for repeating group enableWhen items, the parentRepeatGroupIndex should be provided. |
| [useReadOnly](functions/useReadOnly.md) | - |
| [useRendererQueryClient](functions/useRendererQueryClient.md) | Default QueryClient used by the renderer. You can customise your own QueryClient with your own options, use v4 of @tanstack/react-query. |
| [useRenderingExtensions](functions/useRenderingExtensions.md) | - |
| [useStringCalculatedExpression](functions/useStringCalculatedExpression.md) | - |
| [useValidationFeedback](functions/useValidationFeedback.md) | - |
| [useValueSetCodings](functions/useValueSetCodings.md) | - |
