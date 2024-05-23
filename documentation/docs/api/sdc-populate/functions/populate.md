# Function: populate()

> **populate**(`parameters`, `fetchResourceCallback`, `requestConfig`): `Promise` \<[`OutputParameters`](../interfaces/OutputParameters.md) \| `OperationOutcome`\>

Executes the SDC Populate Questionnaire operation - $populate.
Input and output specific parameters conformant to the SDC populate specification. Can be deployed as a $populate microservice.

This function expects a nice set of populate input parameters to go. If you do you not have them, use https://github.com/aehrc/smart-forms/blob/main/packages/sdc-populate/src/inAppPopulation/utils/populateQuestionnaire.ts#L82 instead.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `parameters` | [`InputParameters`](../interfaces/InputParameters.md) |
| `fetchResourceCallback` | [`FetchResourceCallback`](../interfaces/FetchResourceCallback.md) |
| `requestConfig` | `any` |

## Returns

`Promise` \<[`OutputParameters`](../interfaces/OutputParameters.md) \| `OperationOutcome`\>

## See

[https://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html](https://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html)
Added custom output parameters populationContextResults for visual and debugging purposes.
