# Function: createInputParameters()

> **createInputParameters**(`questionnaireResponse`, `questionnaire`, `comparisonSourceResponse`): [`InputParameters`](../interfaces/InputParameters.md)

Create input parameters to be passed to sdc-template-extract extract(). Questionnaire parameter is optional.
Refer to https://build.fhir.org/ig/HL7/sdc/OperationDefinition-QuestionnaireResponse-extract.html.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `questionnaireResponse` | `QuestionnaireResponse` |
| `questionnaire` | `Questionnaire` \| `undefined` |
| `comparisonSourceResponse` | `QuestionnaireResponse` \| `undefined` |

## Returns

[`InputParameters`](../interfaces/InputParameters.md)
