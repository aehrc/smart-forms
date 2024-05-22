# Function: buildForm()

> **buildForm**(`questionnaire`, `questionnaireResponse`?, `readOnly`?, `terminologyServerUrl`?, `additionalVariables`?): `Promise`\<`void`\>

Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse.
If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.
There are other optional properties such as applying readOnly, providing a terminology server url and additional variables.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `questionnaire` | `Questionnaire` | Questionnaire to be rendered |
| `questionnaireResponse`? | `QuestionnaireResponse` | Pre-populated/draft/loaded QuestionnaireResponse to be rendered (optional) |
| `readOnly`? | `boolean` | Applies read-only mode to all items in the form view |
| `terminologyServerUrl`? | `string` | Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional) |
| `additionalVariables`? | `Record`\<`string`, `object`\> | Additional key-value pair of SDC variables `Record<name, variable extension>` for testing (optional) |

## Returns

`Promise`\<`void`\>
