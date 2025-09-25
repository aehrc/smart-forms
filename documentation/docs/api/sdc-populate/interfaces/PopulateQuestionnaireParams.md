# Interface: PopulateQuestionnaireParams

## Properties

### encounter?

> `optional` **encounter**: `Encounter`

Encounter resource as encounter in context, optional

***

### fetchResourceCallback

> **fetchResourceCallback**: [`FetchResourceCallback`](FetchResourceCallback.md)

A callback function to fetch resources from your FHIR server

***

### fetchResourceRequestConfig

> **fetchResourceRequestConfig**: [`FetchResourceRequestConfig`](FetchResourceRequestConfig.md)

Any request configuration to be passed to the fetchResourceCallback i.e. headers, auth etc.

***

### fetchTerminologyCallback?

> `optional` **fetchTerminologyCallback**: [`FetchTerminologyCallback`](FetchTerminologyCallback.md)

A callback function to fetch terminology resources, optional

***

### fetchTerminologyRequestConfig?

> `optional` **fetchTerminologyRequestConfig**: [`FetchTerminologyRequestConfig`](FetchTerminologyRequestConfig.md)

Any request configuration to be passed to the fetchTerminologyCallback i.e. headers, auth etc., optional

***

### fhirContext?

> `optional` **fhirContext**: [`FhirContext`](FhirContext.md)[]

An array of contextual resources within a launch. See https://build.fhir.org/ig/HL7/smart-app-launch/scopes-and-launch-context.html#fhircontext-exp

***

### patient

> **patient**: `Patient`

Patient resource as patient in context

***

### questionnaire

> **questionnaire**: `Questionnaire`

Questionnaire to populate

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Timeout in milliseconds for the $populate operation, default is 10000ms (10 seconds)

***

### user?

> `optional` **user**: `Practitioner`

Practitioner resource as user in context, optional
