# Interface: SmartFormsRendererProps

SmartFormsRenderer properties

## Properties

### additionalVariables?

> `optional` **additionalVariables**: `Record`\<`string`, `object`\>

Additional key-value pair of SDC variables `Record<name, variable extension>` for testing (optional)

***

### fhirClient?

> `optional` **fhirClient**: `default`

FHIRClient object to perform further FHIR calls. At the moment it's only used in answerExpressions (optional)

***

### questionnaire

> **questionnaire**: `Questionnaire`

Input FHIR R4 Questionnaire to be rendered

***

### questionnaireResponse?

> `optional` **questionnaireResponse**: `QuestionnaireResponse`

Pre-populated QuestionnaireResponse to be rendered (optional)

***

### readOnly?

> `optional` **readOnly**: `boolean`

Applies read-only mode to all items in the form

***

### terminologyServerUrl?

> `optional` **terminologyServerUrl**: `string`

Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional)
