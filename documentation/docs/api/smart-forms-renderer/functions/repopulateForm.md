# Function: repopulateForm()

> **repopulateForm**(`params`): `void`

Re-populate the form with a provided (already filled) QuestionnaireResponse.

This function does not modify the Questionnaire state.
It replaces the current QuestionnaireResponse state in the store and triggers a form update so that SDC expressions are re-evaluated against the new response.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `params` | [`RepopulateFormParams`](../interfaces/RepopulateFormParams.md) | [RepopulateFormParams](../interfaces/RepopulateFormParams.md) containing the configuration for repopulating the form |

## Returns

`void`
