# Function: removeInternalIdsFromResponse()

> **removeInternalIdsFromResponse**(`questionnaire`, `questionnaireResponse`): `QuestionnaireResponse`

Remove all instances of item.answer.id from the filled QuestionnaireResponse.
These IDs are used internally for rendering repeating items, and can be safely left out of the final response.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `questionnaire` | `Questionnaire` |
| `questionnaireResponse` | `QuestionnaireResponse` |

## Returns

`QuestionnaireResponse`
