# Interface: QItemOverrideComponentProps

## Properties

### feedbackFromParent?

> `optional` **feedbackFromParent**: `string`

***

### groupCardElevation?

> `optional` **groupCardElevation**: `number`

***

### isRepeated

> **isRepeated**: `boolean`

***

### isTabled?

> `optional` **isTabled**: `boolean`

***

### itemPath

> **itemPath**: `ItemPath`

***

### onQrItemChange()

> **onQrItemChange**: (`qrItem`, `targetItemPath?`) => `unknown`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `qrItem` | `QuestionnaireResponseItem` |
| `targetItemPath?` | `ItemPath` |

#### Returns

`unknown`

***

### onQrRepeatGroupChange()

> **onQrRepeatGroupChange**: (`qrRepeatGroup`, `targetItemPath?`) => `unknown`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `qrRepeatGroup` | `QrRepeatGroup` |
| `targetItemPath?` | `ItemPath` |

#### Returns

`unknown`

***

### parentIsReadOnly?

> `optional` **parentIsReadOnly**: `boolean`

***

### parentIsRepeatGroup?

> `optional` **parentIsRepeatGroup**: `boolean`

***

### parentRepeatGroupIndex?

> `optional` **parentRepeatGroupIndex**: `number`

***

### parentStyles?

> `optional` **parentStyles**: `Record`\<`string`, `string`\>

***

### qItem

> **qItem**: `QuestionnaireItem`

***

### qrItem

> **qrItem**: `null` \| `QuestionnaireResponseItem` \| `QuestionnaireResponseItem`[]

***

### renderingExtensions?

> `optional` **renderingExtensions**: `RenderingExtensions`
