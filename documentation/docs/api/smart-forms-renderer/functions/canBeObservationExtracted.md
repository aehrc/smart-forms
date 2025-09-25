# Function: canBeObservationExtracted()

> **canBeObservationExtracted**(`questionnaire`): `boolean`

Checks whether a Questionnaire or any of its items contains a valid `sdc-questionnaire-observationExtract` extension (and if it's at the item level, a valid item.code too).
Array.prototype.some() is short-circuiting, so it will return true as soon as it finds a valid extension.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `questionnaire` | `Questionnaire` | The FHIR Questionnaire to check. |

## Returns

`boolean`

`true` if at least one valid observationExtract extension exists.
