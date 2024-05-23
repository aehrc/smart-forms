# Function: useHidden()

> **useHidden**(`qItem`, `parentRepeatGroupIndex`?): `boolean`

React hook to determine if a QuestionnaireItem is hidden via item.hidden, enableWhens, enableWhenExpressions.
When checking for repeating group enableWhen items, the parentRepeatGroupIndex should be provided.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `qItem` | `QuestionnaireItem` |
| `parentRepeatGroupIndex`? | `number` |

## Returns

`boolean`
