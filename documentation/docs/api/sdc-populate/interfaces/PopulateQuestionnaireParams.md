# Interface: PopulateQuestionnaireParams

## Param

Questionnaire to populate

## Param

A callback function to fetch resources

## Param

Any request configuration to be passed to the fetchResourceCallback i.e. headers, auth etc.

## Param

Patient resource as patient in context

## Param

Practitioner resource as user in context

## Param

Encounter resource as encounter in context, optional

## Properties

### encounter?

> `optional` **encounter**: `Encounter`

***

### fetchResourceCallback

> **fetchResourceCallback**: [`FetchResourceCallback`](FetchResourceCallback.md)

***

### patient

> **patient**: `Patient`

***

### questionnaire

> **questionnaire**: `Questionnaire`

***

### requestConfig

> **requestConfig**: `any`

***

### user?

> `optional` **user**: `Practitioner`
