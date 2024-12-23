# Function: useBuildForm()

> **useBuildForm**(`questionnaire`, `questionnaireResponse`?, `readOnly`?, `terminologyServerUrl`?, `additionalVariables`?, `rendererStylingOptions`?, `qItemOverrideComponents`?, `sdcUiOverrideComponents`?): `boolean`

React hook wrapping around the buildForm() function to build a form from a questionnaire and an optional QuestionnaireResponse.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `questionnaire` | `Questionnaire` | Questionnaire to be rendered |
| `questionnaireResponse`? | `QuestionnaireResponse` | Pre-populated/draft/loaded QuestionnaireResponse to be rendered (optional) |
| `readOnly`? | `boolean` | Applies read-only mode to all items in the form view |
| `terminologyServerUrl`? | `string` | Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional) |
| `additionalVariables`? | `Record`\<`string`, `object`\> | Additional key-value pair of SDC variables `Record<name, variable extension>` for testing (optional) |
| `rendererStylingOptions`? | [`RendererStyling`](../interfaces/RendererStyling.md) | Renderer styling to be applied to the form. See docs for styling options. (optional) |
| `qItemOverrideComponents`? | `Record`\<`string`, `ComponentType`\<[`QItemOverrideComponentProps`](../interfaces/QItemOverrideComponentProps.md)\>\> | FIXME add comment |
| `sdcUiOverrideComponents`? | `Record`\<`string`, `ComponentType`\<[`SdcUiOverrideComponentProps`](../interfaces/SdcUiOverrideComponentProps.md)\>\> | FIXME add comment |

## Returns

`boolean`

## See

buildForm() for more information.
