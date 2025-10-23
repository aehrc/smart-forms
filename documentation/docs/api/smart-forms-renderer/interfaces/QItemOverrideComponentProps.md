# Interface: QItemOverrideComponentProps

## Properties

### calcExpUpdated?

> `optional` **calcExpUpdated**: `boolean`

***

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

### onQrItemChange()

> **onQrItemChange**: (`qrItem`) => `unknown`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `qrItem` | `QuestionnaireResponseItem` |

#### Returns

`unknown`

***

### onQrRepeatGroupChange()

> **onQrRepeatGroupChange**: (`qrRepeatGroup`) => `unknown`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `qrRepeatGroup` | `QrRepeatGroup` |

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

> **qrItem**: `QuestionnaireResponseItem` \| `QuestionnaireResponseItem`[] \| `null`

***

### renderingExtensions?

> `optional` **renderingExtensions**: `RenderingExtensions`
