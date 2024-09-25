# @aehrc/smart-forms-renderer

## Interfaces

| Interface | Description |
| :------ | :------ |
| [InitialiseFormWrapperProps](interfaces/InitialiseFormWrapperProps.md) | - |
| [ItemToRepopulate](interfaces/ItemToRepopulate.md) | ItemToRepopulate interface |
| [LaunchContext](interfaces/LaunchContext.md) | LaunchContext interface |
| [QuestionnaireResponseStoreType](interfaces/QuestionnaireResponseStoreType.md) | QuestionnaireResponseStore properties and methods |
| [QuestionnaireStoreType](interfaces/QuestionnaireStoreType.md) | QuestionnaireStore properties and methods |
| [SmartConfigStoreType](interfaces/SmartConfigStoreType.md) | SmartConfigStore properties and methods |
| [SmartFormsRendererProps](interfaces/SmartFormsRendererProps.md) | SmartFormsRenderer properties |
| [TerminologyServerStoreType](interfaces/TerminologyServerStoreType.md) | TerminologyServerStore properties and methods |
| [VariableXFhirQuery](interfaces/VariableXFhirQuery.md) | VariableXFhirQuery interface |
| [Variables](interfaces/Variables.md) | Variables interface |

## Type Aliases

| Type alias | Description |
| :------ | :------ |
| [Tab](type-aliases/Tab.md) | Tab interface |
| [Tabs](type-aliases/Tabs.md) | Key-value pair of tabs `Record<linkId, Tab>` |

## Variables

| Variable | Description |
| :------ | :------ |
| [questionnaireResponseStore](variables/questionnaireResponseStore.md) | QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaireResponse. |
| [questionnaireStore](variables/questionnaireStore.md) | Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire. |
| [smartConfigStore](variables/smartConfigStore.md) | Smart Config state management store. This is only used for answerExpressions. |
| [terminologyServerStore](variables/terminologyServerStore.md) | Terminology server state management store. This is used for resolving valueSets externally. |
| [useQuestionnaireResponseStore](variables/useQuestionnaireResponseStore.md) | QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaire. |
| [useQuestionnaireStore](variables/useQuestionnaireStore.md) | Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire. |
| [useSmartConfigStore](variables/useSmartConfigStore.md) | Smart Config state management store. This is only used for answerExpressions. |
| [useTerminologyServerStore](variables/useTerminologyServerStore.md) | Terminology server state management store. This is used for resolving valueSets externally. |

## Functions

| Function | Description |
| :------ | :------ |
| [BaseRenderer](functions/BaseRenderer.md) | Main component of the form-rendering engine. |
| [GridGroup](functions/GridGroup.md) | Main component to render a Group Grid (grid) Questionnaire item. |
| [GroupTable](functions/GroupTable.md) | Main component to render a Group Table (gtable) Questionnaire item. |
| [InitialiseFormWrapperForStorybook](functions/InitialiseFormWrapperForStorybook.md) | This is a one-to-one replacement for the SmartFormsRenderer for demo purposes. |
| [RendererThemeProvider](functions/RendererThemeProvider.md) | Default theme used by the renderer using Material UI. You can customise your own theme by defining a new ThemeProvider. |
| [RepeatGroup](functions/RepeatGroup.md) | Main component to render a repeating, group Questionnaire item. |
| [RepeatItem](functions/RepeatItem.md) | Main component to render a repeating, non-group Questionnaire item. |
| [SingleItem](functions/SingleItem.md) | Main component to render a repeating, non-group Questionnaire item. |
| [SmartFormsRenderer](functions/SmartFormsRenderer.md) | A self-initialising wrapper around the BaseRenderer rendering engine. |
| [buildForm](functions/buildForm.md) | Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse. |
| [destroyForm](functions/destroyForm.md) | Destroy the form to clean up the questionnaire and questionnaireResponse stores. |
| [extractObservationBased](functions/extractObservationBased.md) | Extract an array of Observations from a QuestionnaireResponse and its source Questionnaire. |
| [generateItemsToRepopulate](functions/generateItemsToRepopulate.md) | Compare latest data from the server with the current QuestionnaireResponse and decide items to re-populate |
| [getResponse](functions/getResponse.md) | Get the filled QuestionnaireResponse at its current state. |
| [initialiseQuestionnaireResponse](functions/initialiseQuestionnaireResponse.md) | Initialise a questionnaireResponse from a given questionnaire |
| [isRepeatItemAndNotCheckbox](functions/isRepeatItemAndNotCheckbox.md) | Check if qItem is a repeat item AND if it isn't a checkbox item |
| [isSpecificItemControl](functions/isSpecificItemControl.md) | Check if the extension has an itemControl code equal to the given itemControlCode |
| [parseFhirDateToDisplayDate](functions/parseFhirDateToDisplayDate.md) | Parse a FHIR date string to a date to be consumed and displayed by the DateItem component. |
| [removeEmptyAnswersFromResponse](functions/removeEmptyAnswersFromResponse.md) | Remove all empty/hidden answers from the filled QuestionnaireResponse. |
| [removeInternalIdsFromResponse](functions/removeInternalIdsFromResponse.md) | Remove all instances of item.answer.id from the filled QuestionnaireResponse. |
| [repopulateResponse](functions/repopulateResponse.md) | Re-populate checked items in the re-population dialog into the current QuestionnaireResponse |
| [useBuildForm](functions/useBuildForm.md) | React hook wrapping around the buildForm() function to build a form from a questionnaire and an optional QuestionnaireResponse. |
| [useHidden](functions/useHidden.md) | React hook to determine if a QuestionnaireItem is hidden via item.hidden, enableWhens, enableWhenExpressions. |
| [useRendererQueryClient](functions/useRendererQueryClient.md) | Default QueryClient used by the renderer. |
