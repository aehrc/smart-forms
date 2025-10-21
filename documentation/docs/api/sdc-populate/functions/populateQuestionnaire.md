# Function: populateQuestionnaire()

> **populateQuestionnaire**(`params`): `Promise`\<\{ `populateResult`: [`PopulateResult`](../interfaces/PopulateResult.md) \| `null`; `populateSuccess`: `boolean`; \}\>

Performs an in-app population of the provided questionnaire.
By in-app, it means that a callback function is provided to fetch resources instead of it calling to a $populate service.
This function helps to you create a nice set of populate input parameters from the provided params.
If you already have them, use https://github.com/aehrc/smart-forms/blob/main/packages/sdc-populate/src/SDCPopulateQuestionnaireOperation/utils/populate.ts#L842 instead.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `params` | [`PopulateQuestionnaireParams`](../interfaces/PopulateQuestionnaireParams.md) | Refer to PopulateQuestionnaireParams interface |

## Returns

`Promise`\<\{ `populateResult`: [`PopulateResult`](../interfaces/PopulateResult.md) \| `null`; `populateSuccess`: `boolean`; \}\>

populateSuccess - A boolean indicating if the population was successful
