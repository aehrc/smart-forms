# @aehrc/sdc-assemble

## Interfaces

| Interface | Description |
| ------ | ------ |
| [FetchQuestionnaireCallback](interfaces/FetchQuestionnaireCallback.md) | To define a method to fetch Questionnaire resources from the FHIR server with the given canonical URL |
| [InputParameters](interfaces/InputParameters.md) | Input parameters for the $assemble operation |
| [OutcomeParameter](interfaces/OutcomeParameter.md) | Output parameter from $assemble's 'outcome' parameter |
| [OutputParameters](interfaces/OutputParameters.md) | Output parameters for the $assemble operation |

## Functions

| Function | Description |
| ------ | ------ |
| [assemble](functions/assemble.md) | The $assemble operation - https://build.fhir.org/ig/HL7/sdc/OperationDefinition-Questionnaire-assemble.html |
| [isInputParameters](functions/isInputParameters.md) | Check if the given parameters is a valid InputParameters for $assemble |
