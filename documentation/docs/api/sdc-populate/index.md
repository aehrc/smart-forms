# @aehrc/sdc-populate

## Interfaces

| Interface | Description |
| ------ | ------ |
| [CustomContextResultParameter](interfaces/CustomContextResultParameter.md) | - |
| [FetchResourceCallback](interfaces/FetchResourceCallback.md) | To define a method to fetch resources from the FHIR server with a given query string Method should be able to handle both absolute urls and query strings |
| [FetchTerminologyCallback](interfaces/FetchTerminologyCallback.md) | To define a method to fetch resources from the FHIR server with a given query string Method should be able to handle both absolute urls and query strings |
| [IdentifierParameter](interfaces/IdentifierParameter.md) | - |
| [InputParameters](interfaces/InputParameters.md) | Input parameters for the $populate operation |
| [IssuesParameter](interfaces/IssuesParameter.md) | - |
| [OutputParameters](interfaces/OutputParameters.md) | Output parameters for the $populate operation |
| [PopulateQuestionnaireParams](interfaces/PopulateQuestionnaireParams.md) | - |
| [PopulateResult](interfaces/PopulateResult.md) | - |
| [QuestionnaireRefParameter](interfaces/QuestionnaireRefParameter.md) | - |
| [ResponseParameter](interfaces/ResponseParameter.md) | - |
| [TerminologyRequestConfig](interfaces/TerminologyRequestConfig.md) | - |

## Functions

| Function | Description |
| ------ | ------ |
| [isCanonicalParameter](functions/isCanonicalParameter.md) | - |
| [isContextParameter](functions/isContextParameter.md) | - |
| [isInputParameters](functions/isInputParameters.md) | Checks if the parameters passed satisfies the conditions of populateInputParameters. |
| [isOutputParameters](functions/isOutputParameters.md) | - |
| [isSubjectParameter](functions/isSubjectParameter.md) | - |
| [populate](functions/populate.md) | Executes the SDC Populate Questionnaire operation - $populate. Input and output specific parameters conformant to the SDC populate specification. Can be deployed as a $populate microservice. |
| [populateQuestionnaire](functions/populateQuestionnaire.md) | Performs an in-app population of the provided questionnaire. By in-app, it means that a callback function is provided to fetch resources instead of it calling to a $populate service. This function helps to you create a nice set of populate input parameters from the provided params. If you already have them, use https://github.com/aehrc/smart-forms/blob/main/packages/sdc-populate/src/SDCPopulateQuestionnaireOperation/utils/populate.ts#L842 instead. |
