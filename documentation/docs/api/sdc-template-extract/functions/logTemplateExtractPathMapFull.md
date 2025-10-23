# Function: logTemplateExtractPathMapFull()

> **logTemplateExtractPathMapFull**(`templateId`, `templateExtractPathMap`): `void`

Logs a summary table of all extractable context and value paths from a given template.
Useful for debugging or inspecting the structure of a `TemplateExtractPath` map.

Each row of the table includes:
- the entry path (FHIRPath to the context element),
- the context location, expression and result
- the value path and corresponding extract expression + result.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `templateId` | `string` | The identifier for the template being logged. |
| `templateExtractPathMap` | `Map`\<`string`, `TemplateExtractPath`\> | A map of FHIRPath entries to `TemplateExtractPath` objects, representing extract contexts and value expressions. |

## Returns

`void`

## Example

Example output:

```
🔢 All columns for: PatientTemplate

| entryPath             | contextPath                        | contextExpression                                | valuePath                                 | valueExpression                                                      | valueResult            |
|-----------------------|----------------------------------- |------------------------------------------------- |------------------------------------------ |--------------------------------------------------------------------- |------------------------|
| Patient.identifier[0] | Patient.identifier[0].extension[0] | item.where(linkId = 'ihi').answer.value          | Patient.identifier[0]._value.extension[0] | first()                                                              | [ "8003608833357361" ] |
| Patient.name[0]       | Patient.name[0].extension[0]       | item.where(linkId = 'name')                      | Patient.name[0]._text.extension[0]        | item.where(linkId='given' or linkId='family').answer.value.join(' ') | [ "Jane" ]             |
| Patient.name[0]       | Patient.name[0].extension[0]       | item.where(linkId = 'name')                      | Patient.name[0]._family.extension[0]      | item.where(linkId = 'family').answer.value.first()                   | [ "Doe" ]              |
| Patient.telecom[0]    | Patient.telecom[0].extension[0]    | item.where(linkId = 'mobile-phone').answer.value | Patient.telecom[0]._value.extension[0]    | first()                                                              | [ "0491 572 665" ]     |
| Patient._gender       | null                               | null                                             | Patient._gender.extension[0]              | item.where(linkId = 'gender').answer.value.first().code              | [ "female" ]           |
```
