# Function: updateQrItemsInGroup()

> **updateQrItemsInGroup**(`newQrItem`, `newQrRepeatGroup`, `questionnaireResponseOrQrItem`, `qItemsIndexMap`): `void`

Updates the QuestionnaireResponseItem group by adding/removing a new/modified child QuestionnaireResponseItem into/from a qrGroup
Takes either a single newQrItem or an array of newQrItems

## Parameters

| Parameter | Type |
| ------ | ------ |
| `newQrItem` | `null` \| `QuestionnaireResponseItem` |
| `newQrRepeatGroup` | `null` \| `QrRepeatGroup` |
| `questionnaireResponseOrQrItem` | `QuestionnaireResponse` \| `QuestionnaireResponseItem` |
| `qItemsIndexMap` | `Record`\<`string`, `number`\> |

## Returns

`void`
