# Interface: RepopulateFormParams

Parameters for `repopulateForm()`.

## Properties

### additionalContext?

> `optional` **additionalContext**: `Record`\<`string`, `any`\>

Optional additional key-value pairs of SDC variables and values to feed into the renderer's FhirPathContext.
Useful for pre-population or enriching the context used by calculatedExpressions.
Example: `{ 'ObsBloodPressure': <Bundle of BP observations> }`

***

### questionnaireResponse

> **questionnaireResponse**: `QuestionnaireResponse`

The re-populated QuestionnaireResponse to set as the new source response.
