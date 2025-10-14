# Interface: QuestionnaireResponseStoreType

QuestionnaireResponseStore properties and methods
Properties can be accessed for fine-grain details.
Methods are usually used internally, but it is possible to use them externally to hook into the renderer for more fine-grain control.

## Properties

### buildSourceResponse()

> **buildSourceResponse**: (`response`) => `void`

Used to build the source response when the form is first initialised

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `response` | `QuestionnaireResponse` |

#### Returns

`void`

***

### destroySourceResponse()

> **destroySourceResponse**: () => `void`

Used to destroy the source response  and reset all properties

#### Returns

`void`

***

### formChangesHistory

> **formChangesHistory**: (`Diff`\<`QuestionnaireResponse`, `QuestionnaireResponse`\>[] \| `null`)[]

Array of form changes history in the form of deep-diff objects

***

### highlightRequiredItems()

> **highlightRequiredItems**: () => `void`

Used to highlight invalid items and show error feedback in the UI

#### Returns

`void`

***

### invalidItems

> **invalidItems**: `Record`\<`string`, `OperationOutcome`\>

Key-value pair of invalid items based on defined value constraints in the questionnaire `Record<linkId, OperationOutcome>`

***

### key

> **key**: `string`

The React key of the questionnaireResponse, used internally for refreshing the BaseRenderer

***

### requiredItemsIsHighlighted

> **requiredItemsIsHighlighted**: `boolean`

Required items are not highlighted by default (to provide a less-jarring UX), but can be manually toggled to be highlighted

***

### responseIsValid

> **responseIsValid**: `boolean`

Whether there are any invalid items in the response

***

### setUpdatableResponseAsEmpty()

> **setUpdatableResponseAsEmpty**: (`clearedResponse`) => `void`

Used to set an empty response as the current response

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `clearedResponse` | `QuestionnaireResponse` |

#### Returns

`void`

***

### setUpdatableResponseAsSaved()

> **setUpdatableResponseAsSaved**: (`savedResponse`) => `void`

Used to set a saved response as the current response

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `savedResponse` | `QuestionnaireResponse` |

#### Returns

`void`

***

### sourceResponse

> **sourceResponse**: `QuestionnaireResponse`

The original response created when the form is first initialised i.e. empty, pre-populated, opened saved draft

***

### updatableResponse

> **updatableResponse**: `QuestionnaireResponse`

The current state of the response that is being updated via form fields

***

### updatableResponseItems

> **updatableResponseItems**: `Record`\<`string`, `QuestionnaireResponseItem`[]\>

Key-value pair of updatableResponse items `Record<linkId, QR.item(s)>`

***

### updateResponse()

> **updateResponse**: (`updatedResponse`, `isInitialUpdate`) => `void`

Used to update the current response, initialUpdate flag is to ensure formChangesHistory is not updated during the first update after form build

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `updatedResponse` | `QuestionnaireResponse` |
| `isInitialUpdate` | `boolean` |

#### Returns

`void`

***

### validateResponse()

> **validateResponse**: (`questionnaire`, `updatedResponse`) => `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `questionnaire` | `Questionnaire` |
| `updatedResponse` | `QuestionnaireResponse` |

#### Returns

`void`
