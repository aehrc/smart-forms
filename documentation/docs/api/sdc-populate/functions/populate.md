# Function: populate()

> **populate**(`parameters`, `fetchResourceCallback`, `fetchResourceRequestConfig`, `fetchTerminologyCallback?`, `fetchTerminologyRequestConfig?`): `Promise`\<`OperationOutcome` \| [`OutputParameters`](../interfaces/OutputParameters.md)\>

Executes the SDC Populate Questionnaire operation - $populate.
Input and output specific parameters conformant to the SDC populate specification. Can be deployed as a $populate microservice.

This function expects a nice set of populate input parameters to go. If you do you not have them, use https://github.com/aehrc/smart-forms/blob/main/packages/sdc-populate/src/inAppPopulation/utils/populateQuestionnaire.ts#L82 instead.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `parameters` | [`InputParameters`](../interfaces/InputParameters.md) |
| `fetchResourceCallback` | [`FetchResourceCallback`](../interfaces/FetchResourceCallback.md) |
| `fetchResourceRequestConfig` | [`FetchResourceRequestConfig`](../interfaces/FetchResourceRequestConfig.md) |
| `fetchTerminologyCallback?` | [`FetchTerminologyCallback`](../interfaces/FetchTerminologyCallback.md) |
| `fetchTerminologyRequestConfig?` | [`FetchTerminologyRequestConfig`](../interfaces/FetchTerminologyRequestConfig.md) |

## Returns

`Promise`\<`OperationOutcome` \| [`OutputParameters`](../interfaces/OutputParameters.md)\>

## See

[https://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html](https://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html)
Added custom output parameters populationContextResults for visual and debugging purposes.
