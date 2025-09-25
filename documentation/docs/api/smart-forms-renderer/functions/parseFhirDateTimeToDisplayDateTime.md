# Function: parseFhirDateTimeToDisplayDateTime()

> **parseFhirDateTimeToDisplayDateTime**(`fhirDateTime`): `object`

Parse a FHIR dateTime string to a human-readable display format.
Supports full and partial FHIR dateTime values.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `fhirDateTime` | `string` |

## Returns

`object`

### dateParseFail?

> `optional` **dateParseFail**: `boolean`

### displayDateTime

> **displayDateTime**: `string`
