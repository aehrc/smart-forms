# Function: removeEmptyAnswersFromResponse()

> **removeEmptyAnswersFromResponse**(`questionnaire`, `questionnaireResponse`): `QuestionnaireResponse`

Remove all empty/hidden answers from the filled QuestionnaireResponse.
This takes into account enableWhens, enableWhenExpressions, items without item.answer, empty item.answer arrays and empty strings.
This does not remove items that are hidden by the http://hl7.org/fhir/StructureDefinition/questionnaire-hidden extension.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `questionnaire` | `Questionnaire` |
| `questionnaireResponse` | `QuestionnaireResponse` |

## Returns

`QuestionnaireResponse`
