# Function: buildForm()

> **buildForm**(`params`): `Promise`\<`void`\>

Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse.
If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.

The build process also supports:
- Applying readOnly mode to all items in the form view
- Providing a default terminology server URL (fallbacks to a public Ontoserver instance if not provided)
- Passing additional SDC variables into the FhirPathContext (e.g. for pre-population purposes)
- Adjusting renderer styling and behaviour via `rendererConfigStore`
- Overriding QuestionnaireItem rendering via `qItemOverrideComponents`
- Overriding SDC UI controls via `sdcUiOverrideComponents`

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `params` | [`BuildFormParams`](../interfaces/BuildFormParams.md) | [BuildFormParams](../interfaces/BuildFormParams.md) containing the configuration for building the form |

## Returns

`Promise`\<`void`\>
