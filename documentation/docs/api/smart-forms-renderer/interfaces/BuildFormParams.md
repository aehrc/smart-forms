# Interface: BuildFormParams

Parameters for `buildForm()`.

## Properties

### additionalContext?

> `optional` **additionalContext**: `Record`\<`string`, `any`\>

Additional key-value pairs of SDC variables and values to feed into the renderer's FhirPathContext.
Likely used for passing in data from a pre-population module.
Example: `{ 'ObsBodyHeight': <Bundle of height observations> }`.

***

### preserveNavigationState?

> `optional` **preserveNavigationState**: `boolean`

Whether to preserve the current navigation state (e.g. current page in paged forms, current tab in tabbed forms) when rebuilding the form.
This is useful when you want to perform re-population or other updates without losing the user's current position in the form.

***

### qItemOverrideComponents?

> `optional` **qItemOverrideComponents**: `Record`\<`string`, `ComponentType`\<[`QItemOverrideComponentProps`](QItemOverrideComponentProps.md)\>\>

Key-value pairs of React component overrides for specific Questionnaire Items via linkId.
Example: `{ 'linkId123': MyCustomComponent }`

***

### questionnaire

> **questionnaire**: `Questionnaire`

The Questionnaire resource to be rendered.

***

### questionnaireResponse?

> `optional` **questionnaireResponse**: `QuestionnaireResponse`

An optional pre-populated, draft, or loaded QuestionnaireResponse to initialise the form with.
If not provided, an empty QuestionnaireResponse will be created.

***

### readOnly?

> `optional` **readOnly**: `boolean`

Whether to apply read-only mode to all items in the form view.

***

### rendererConfigOptions?

> `optional` **rendererConfigOptions**: [`RendererConfig`](RendererConfig.md)

Optional renderer styling configurations to have fine-grained control over the styling and behaviour of the renderer.

***

### sdcUiOverrideComponents?

> `optional` **sdcUiOverrideComponents**: `Record`\<`string`, `ComponentType`\<[`SdcUiOverrideComponentProps`](SdcUiOverrideComponentProps.md)\>\>

Key-value pairs of React component overrides for SDC UI Controls, as defined in:
https://hl7.org/fhir/extensions/ValueSet-questionnaire-item-control.html
Example: `{ 'example-code': MyCustomUIComponent }`

***

### terminologyServerUrl?

> `optional` **terminologyServerUrl**: `string`

A terminology server URL to fetch terminology data.
If available, preferredTerminologyServer SDC extension still takes precedence over this.
If not provided, a fallback public Ontoserver terminology server will be used.
