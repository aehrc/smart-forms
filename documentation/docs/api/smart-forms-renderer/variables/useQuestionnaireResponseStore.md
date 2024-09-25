# Variable: useQuestionnaireResponseStore

> `const` **useQuestionnaireResponseStore**: `StoreApi` \<[`QuestionnaireResponseStoreType`](../interfaces/QuestionnaireResponseStoreType.md)\> & `object`

QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaire.
This is the React version of the store which can be used as React hooks in React functional components.

## See

 - QuestionnaireResponseStoreType for available properties and methods.
 - questionnaireResponseStore for the vanilla store.

## Type declaration

### use

> **use**: `object`

### use.buildSourceResponse()

> **buildSourceResponse**: () => (`response`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `response` | `QuestionnaireResponse` |

##### Returns

`void`

### use.destroySourceResponse()

> **destroySourceResponse**: () => () => `void`

#### Returns

`Function`

##### Returns

`void`

### use.formChangesHistory()

> **formChangesHistory**: () => (`null` \| `Diff`\<`QuestionnaireResponse`, `QuestionnaireResponse`\>[])[]

#### Returns

(`null` \| `Diff`\<`QuestionnaireResponse`, `QuestionnaireResponse`\>[])[]

### use.invalidItems()

> **invalidItems**: () => `Record`\<`string`, `OperationOutcome`\>

#### Returns

`Record`\<`string`, `OperationOutcome`\>

### use.key()

> **key**: () => `string`

#### Returns

`string`

### use.responseIsValid()

> **responseIsValid**: () => `boolean`

#### Returns

`boolean`

### use.setUpdatableResponseAsEmpty()

> **setUpdatableResponseAsEmpty**: () => (`clearedResponse`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `clearedResponse` | `QuestionnaireResponse` |

##### Returns

`void`

### use.setUpdatableResponseAsPopulated()

> **setUpdatableResponseAsPopulated**: () => (`populatedResponse`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `populatedResponse` | `QuestionnaireResponse` |

##### Returns

`void`

### use.setUpdatableResponseAsSaved()

> **setUpdatableResponseAsSaved**: () => (`savedResponse`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `savedResponse` | `QuestionnaireResponse` |

##### Returns

`void`

### use.sourceResponse()

> **sourceResponse**: () => `QuestionnaireResponse`

#### Returns

`QuestionnaireResponse`

### use.updatableResponse()

> **updatableResponse**: () => `QuestionnaireResponse`

#### Returns

`QuestionnaireResponse`

### use.updatableResponseItems()

> **updatableResponseItems**: () => `Record`\<`string`, `QuestionnaireResponseItem`[]\>

#### Returns

`Record`\<`string`, `QuestionnaireResponseItem`[]\>

### use.updateResponse()

> **updateResponse**: () => (`updatedResponse`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `updatedResponse` | `QuestionnaireResponse` |

##### Returns

`void`

### use.validateQuestionnaire()

> **validateQuestionnaire**: () => (`questionnaire`, `updatedResponse`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `questionnaire` | `Questionnaire` |
| `updatedResponse` | `QuestionnaireResponse` |

##### Returns

`void`
