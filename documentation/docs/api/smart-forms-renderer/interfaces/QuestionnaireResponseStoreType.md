# Interface: QuestionnaireResponseStoreType

QuestionnaireResponseStore properties and methods
Properties can be accessed for fine-grain details.
Methods are usually used internally, using them from an external source is not recommended.

## Method

validateQuestionnaire - Used to validate the questionnaire response based on the questionnaire

## Method

buildSourceResponse - Used to build the source response when the form is first initialised

## Method

setUpdatableResponseAsPopulated - Used to set a pre-populated response as the current response

## Method

updateResponse - Used to update the current response

## Method

setUpdatableResponseAsSaved - Used to set a saved response as the current response

## Method

setUpdatableResponseAsEmpty - Used to set an empty response as the current response

## Method

destroySourceResponse - Used to destroy the source response  and reset all properties

## Properties

### buildSourceResponse()

> **buildSourceResponse**: (`response`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `response` | `QuestionnaireResponse` |

#### Returns

`void`

***

### destroySourceResponse()

> **destroySourceResponse**: () => `void`

#### Returns

`void`

***

### formChangesHistory

> **formChangesHistory**: (`null` \| `Diff`\<`QuestionnaireResponse`, `QuestionnaireResponse`\>[])[]

Array of form changes history in the form of deep-diff objects

***

### invalidItems

> **invalidItems**: `Record`\<`string`, `OperationOutcome`\>

Key-value pair of invalid items based on defined value constraints in the questionnaire `Record<linkId, OperationOutcome>`

***

### responseIsValid

> **responseIsValid**: `boolean`

Whether there are any invalid items in the response

***

### setUpdatableResponseAsEmpty()

> **setUpdatableResponseAsEmpty**: (`clearedResponse`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `clearedResponse` | `QuestionnaireResponse` |

#### Returns

`void`

***

### setUpdatableResponseAsPopulated()

> **setUpdatableResponseAsPopulated**: (`populatedResponse`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `populatedResponse` | `QuestionnaireResponse` |

#### Returns

`void`

***

### setUpdatableResponseAsSaved()

> **setUpdatableResponseAsSaved**: (`savedResponse`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
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

> **updateResponse**: (`updatedResponse`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `updatedResponse` | `QuestionnaireResponse` |

#### Returns

`void`

***

### validateQuestionnaire()

> **validateQuestionnaire**: (`questionnaire`, `updatedResponse`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `questionnaire` | `Questionnaire` |
| `updatedResponse` | `QuestionnaireResponse` |

#### Returns

`void`
