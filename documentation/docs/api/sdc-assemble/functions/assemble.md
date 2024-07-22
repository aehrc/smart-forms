# Function: assemble()

> **assemble**(`parameters`, `fetchQuestionnaireCallback`, `fetchQuestionnaireRequestConfig`): `Promise`\<`Questionnaire` \| `OperationOutcome` \| [`OutputParameters`](../interfaces/OutputParameters.md)\>

The $assemble operation - https://build.fhir.org/ig/HL7/sdc/OperationDefinition-Questionnaire-assemble.html

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `parameters` | [`InputParameters`](../interfaces/InputParameters.md) | The input parameters for $assemble |
| `fetchQuestionnaireCallback` | [`FetchQuestionnaireCallback`](../interfaces/FetchQuestionnaireCallback.md) | A callback function defined by the implementer to fetch Questionnaire resources by a canonical url |
| `fetchQuestionnaireRequestConfig` | `any` | A request configuration object to be passed to the callback function |

## Returns

`Promise`\<`Questionnaire` \| `OperationOutcome` \| [`OutputParameters`](../interfaces/OutputParameters.md)\>

A fully assembled questionnaire, an operationOutcome error(if present) or both (if there are warnings)
