# Function: getQrItemsIndex()

> **getQrItemsIndex**(`qItems`, `qrItems`, `qItemsIndexMap`): (`QuestionnaireResponseItem` \| `QuestionnaireResponseItem`[] \| `undefined`)[]

Generate an array of QuestionnaireResponseItems corresponding to its QuestionnaireItem indexes an array.
QuestionnaireItems without a corresponding QuestionnaireResponseItem is set as undefined.
i.e. QItems = [QItem0, QItem1, QItem2]. Only QItem0 and QItem2 have QrItems
Generated array: [QrItem0, undefined, QrItem2]
Note: There's a bug where if the qItems are child items from a repeat group, the function fails at the isRepeatGroup line.
      Ensure that repeat groups are handled prior to calling this function.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `qItems` | `QuestionnaireItem`[] |
| `qrItems` | `QuestionnaireResponseItem`[] |
| `qItemsIndexMap` | `Record`\<`string`, `number`\> |

## Returns

(`QuestionnaireResponseItem` \| `QuestionnaireResponseItem`[] \| `undefined`)[]
