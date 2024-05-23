# Interface: PopulateQuestionnaireParams

## Properties

### encounter?

> `optional` **encounter**: `Encounter`

Encounter resource as encounter in context, optional

***

### fetchResourceCallback

> **fetchResourceCallback**: [`FetchResourceCallback`](FetchResourceCallback.md)

A callback function to fetch resources

***

### patient

> **patient**: `Patient`

Patient resource as patient in context

***

### questionnaire

> **questionnaire**: `Questionnaire`

Questionnaire to populate

***

### requestConfig

> **requestConfig**: `any`

Any request configuration to be passed to the fetchResourceCallback i.e. headers, auth etc.

***

### user?

> `optional` **user**: `Practitioner`

Practitioner resource as user in context
