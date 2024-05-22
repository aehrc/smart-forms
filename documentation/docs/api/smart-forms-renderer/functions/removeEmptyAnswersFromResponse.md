# Function: removeEmptyAnswersFromResponse()

> **removeEmptyAnswersFromResponse**(`questionnaire`, `questionnaireResponse`): `QuestionnaireResponse`

Remove all hidden answers from the filled QuestionnaireResponse.
This takes into account enableWhens, enableWhenExpressions, items without item.answer, empty item.answer arrays and empty strings.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `questionnaire` | `Questionnaire` |
| `questionnaireResponse` | `QuestionnaireResponse` |

## Returns

`QuestionnaireResponse`
