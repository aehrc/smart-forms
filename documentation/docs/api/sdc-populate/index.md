# @aehrc/sdc-populate

## Interfaces

| Interface | Description |
| ------ | ------ |
| [CustomContextResultParameter](interfaces/CustomContextResultParameter.md) | - |
| [FetchResourceCallback](interfaces/FetchResourceCallback.md) | To define a method to fetch resources from the FHIR server with a given query string Method should be able to handle both absolute urls and query strings |
| [FetchResourceRequestConfig](interfaces/FetchResourceRequestConfig.md) | - |
| [FetchTerminologyCallback](interfaces/FetchTerminologyCallback.md) | To define a method to fetch resources from the FHIR server with a given query string Method should be able to handle both absolute urls and query strings |
| [FetchTerminologyRequestConfig](interfaces/FetchTerminologyRequestConfig.md) | - |
| [FhirContext](interfaces/FhirContext.md) | Represents a contextual FHIR resource reference passed during app launch. |
| [IdentifierParameter](interfaces/IdentifierParameter.md) | - |
| [InputParameters](interfaces/InputParameters.md) | Input parameters for the $populate operation |
| [IssuesParameter](interfaces/IssuesParameter.md) | - |
| [OutputParameters](interfaces/OutputParameters.md) | Output parameters for the $populate operation |
| [PopulateQuestionnaireParams](interfaces/PopulateQuestionnaireParams.md) | - |
| [PopulateResult](interfaces/PopulateResult.md) | - |
| [QuestionnaireRefParameter](interfaces/QuestionnaireRefParameter.md) | - |
| [ResponseParameter](interfaces/ResponseParameter.md) | - |

## Functions

| Function | Description |
| ------ | ------ |
| [isCanonicalParameter](functions/isCanonicalParameter.md) | Re-exports type predicate and population functions for SDC operations. Use these exports to access type guards and population logic from a single entry point. |
| [isContextParameter](functions/isContextParameter.md) | Re-exports type predicate and population functions for SDC operations. Use these exports to access type guards and population logic from a single entry point. |
| [isInputParameters](functions/isInputParameters.md) | Re-exports type predicate and population functions for SDC operations. Use these exports to access type guards and population logic from a single entry point. |
| [isOutputParameters](functions/isOutputParameters.md) | Re-exports type predicate and population functions for SDC operations. Use these exports to access type guards and population logic from a single entry point. |
| [isSubjectParameter](functions/isSubjectParameter.md) | Re-exports type predicate and population functions for SDC operations. Use these exports to access type guards and population logic from a single entry point. |
| [populate](functions/populate.md) | Executes the SDC Populate Questionnaire operation - $populate. Input and output specific parameters conformant to the SDC populate specification. Can be deployed as a $populate microservice. |
| [populateQuestionnaire](functions/populateQuestionnaire.md) | Performs an in-app population of the provided questionnaire. By in-app, it means that a callback function is provided to fetch resources instead of it calling to a $populate service. This function helps to you create a nice set of populate input parameters from the provided params. If you already have them, use https://github.com/aehrc/smart-forms/blob/main/packages/sdc-populate/src/SDCPopulateQuestionnaireOperation/utils/populate.ts#L842 instead. |
