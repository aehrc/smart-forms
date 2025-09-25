# Function: buildForm()

> **buildForm**(`questionnaire`, `questionnaireResponse?`, `readOnly?`, `terminologyServerUrl?`, `additionalVariables?`, `qItemOverrideComponents?`, `sdcUiOverrideComponents?`): `Promise`\<`void`\>

Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse.
If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.
There are other optional properties such as applying readOnly, providing a terminology server url and additional variables.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `questionnaire` | `Questionnaire` | Questionnaire to be rendered |
| `questionnaireResponse?` | `QuestionnaireResponse` | Pre-populated/draft/loaded QuestionnaireResponse to be rendered (optional) |
| `readOnly?` | `boolean` | Applies read-only mode to all items in the form view |
| `terminologyServerUrl?` | `string` | Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional) |
| `additionalVariables?` | `Record`\<`string`, `any`\> | Additional key-value pair of SDC variables + values to be fed into the renderer's FhirPathContext `Record<name, value>` (likely coming from a pre-population module) e.g. `{ 'ObsBodyHeight': <Bundle of height observations> } }`. |
| `qItemOverrideComponents?` | `Record`\<`string`, `ComponentType`\<[`QItemOverrideComponentProps`](../interfaces/QItemOverrideComponentProps.md)\>\> | Key-value pair of React component overrides for Questionnaire Items via linkId `Record<linkId, React component>` |
| `sdcUiOverrideComponents?` | `Record`\<`string`, `ComponentType`\<[`SdcUiOverrideComponentProps`](../interfaces/SdcUiOverrideComponentProps.md)\>\> | Key-value pair of React component overrides for SDC UI Controls https://hl7.org/fhir/extensions/ValueSet-questionnaire-item-control.html `Record<SDC UI code, React component>` |

## Returns

`Promise`\<`void`\>
