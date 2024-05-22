# Interface: QuestionnaireStoreType

QuestionnaireStore properties and methods
Properties can be accessed for fine-grain details.
Methods are usually used internally, using them from an external source is not recommended.

## Method

buildSourceQuestionnaire - Used to build the source questionnaire with the provided questionnaire and optionally questionnaire response, additional variables, terminology server url and readyOnly flag

## Method

destroySourceQuestionnaire - Used to destroy the source questionnaire and reset all properties

## Method

switchTab - Used to switch the current tab index

## Method

markTabAsComplete - Used to mark a tab index as complete

## Method

updateEnableWhenItem - Used to update linked enableWhen items by updating a question with a new answer

## Method

mutateRepeatEnableWhenItems - Used to add or remove instances of repeating enableWhen items

## Method

toggleEnableWhenActivation - Used to toggle enableWhen checks on/off

## Method

updateExpressions - Used to update all SDC expressions based on the updated questionnaire response

## Method

addCodingToCache - Used to add a coding to the cached value set codings

## Method

updatePopulatedProperties - Used to update all SDC expressions based on a pre-populated questionnaire response

## Method

onFocusLinkId - Used to set the focused linkId

## Method

setPopulatedContext - Used to set the populated contexts (launchContext, sourceQueries, x-fhir-query vars) for debugging purposes

## Method

setFormAsReadOnly - Used to set the form as read-only

## Properties

### addCodingToCache()

> **addCodingToCache**: (`valueSetUrl`, `codings`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `valueSetUrl` | `string` |
| `codings` | `Coding`[] |

#### Returns

`void`

***

### answerExpressions

> **answerExpressions**: `Record`\<`string`, `AnswerExpression`\>

Key-value pair of answer expressions `Record<linkId, answer expression properties>`

***

### buildSourceQuestionnaire()

> **buildSourceQuestionnaire**: (`questionnaire`, `questionnaireResponse`?, `additionalVariables`?, `terminologyServerUrl`?, `readOnly`?) => `Promise`\<`void`\>

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `questionnaire` | `Questionnaire` |
| `questionnaireResponse`? | `QuestionnaireResponse` |
| `additionalVariables`? | `Record`\<`string`, `object`\> |
| `terminologyServerUrl`? | `string` |
| `readOnly`? | `boolean` |

#### Returns

`Promise`\<`void`\>

***

### cachedValueSetCodings

> **cachedValueSetCodings**: `Record`\<`string`, `Coding`[]\>

Key-value pair of cached value set codings `Record<valueSetUrl, codings>`

***

### calculatedExpressions

> **calculatedExpressions**: `Record`\<`string`, `CalculatedExpression`[]\>

Key-value pair of calculated expressions `Record<linkId, array of calculated expression properties>`

***

### currentTabIndex

> **currentTabIndex**: `number`

Index of the current tab

***

### destroySourceQuestionnaire()

> **destroySourceQuestionnaire**: () => `void`

#### Returns

`void`

***

### enableWhenExpressions

> **enableWhenExpressions**: `EnableWhenExpressions`

EnableWhenExpressions object containing enableWhen expressions

***

### enableWhenIsActivated

> **enableWhenIsActivated**: `boolean`

Flag to turn enableWhen checks on/off

***

### enableWhenItems

> **enableWhenItems**: `EnableWhenItems`

EnableWhenItems object containing enableWhen items and their linked questions

***

### enableWhenLinkedQuestions

> **enableWhenLinkedQuestions**: `Record`\<`string`, `string`[]\>

Key-value pair of linked questions to enableWhen items `Record<linkId, linkIds of linked questions>`

***

### fhirPathContext

> **fhirPathContext**: `Record`\<`string`, `any`\>

Key-value pair of evaluated FHIRPath values `Record<variable name, evaluated value(s)>`

***

### focusedLinkId

> **focusedLinkId**: `string`

LinkId of the currently focused item

***

### itemTypes

> **itemTypes**: `Record`\<`string`, `string`\>

Key-value pair of item types `Record<linkId, item.type>`

***

### launchContexts

> **launchContexts**: `Record`\<`string`, [`LaunchContext`](LaunchContext.md)\>

Key-value pair of launch contexts `Record<launch context name, launch context properties>`

***

### markTabAsComplete()

> **markTabAsComplete**: (`tabLinkId`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `tabLinkId` | `string` |

#### Returns

`void`

***

### mutateRepeatEnableWhenItems()

> **mutateRepeatEnableWhenItems**: (`parentRepeatGroupLinkId`, `parentRepeatGroupIndex`, `actionType`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `parentRepeatGroupLinkId` | `string` |
| `parentRepeatGroupIndex` | `number` |
| `actionType` | `"add"` \| `"remove"` |

#### Returns

`void`

***

### onFocusLinkId()

> **onFocusLinkId**: (`linkId`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `linkId` | `string` |

#### Returns

`void`

***

### populatedContext

> **populatedContext**: `Record`\<`string`, `any`\>

Key-value pair of one-off pre-populated FHIRPath values `Record<variable/launchContext/sourceQueries batch name, evaluated value(s)>`

***

### processedValueSetCodings

> **processedValueSetCodings**: `Record`\<`string`, `Coding`[]\>

Key-value pair of processed value set codings `Record<valueSetUrl, codings>`

***

### processedValueSetUrls

> **processedValueSetUrls**: `Record`\<`string`, `string`\>

Key-value pair of contained value set urls `Record<valueSetName, valueSetUrl>`

***

### readOnly

> **readOnly**: `boolean`

Flag to set the form to read-only mode

***

### setFormAsReadOnly()

> **setFormAsReadOnly**: (`readOnly`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `readOnly` | `boolean` |

#### Returns

`void`

***

### setPopulatedContext()

> **setPopulatedContext**: (`newPopulatedContext`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `newPopulatedContext` | `Record`\<`string`, `any`\> |

#### Returns

`void`

***

### sourceQuestionnaire

> **sourceQuestionnaire**: `Questionnaire`

FHIR R4 Questionnaire to render

***

### switchTab()

> **switchTab**: (`newTabIndex`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `newTabIndex` | `number` |

#### Returns

`void`

***

### tabs

> **tabs**: [`Tabs`](../type-aliases/Tabs.md)

Key-value pair of tabs `Record<linkId, Tab>`

***

### toggleEnableWhenActivation()

> **toggleEnableWhenActivation**: (`isActivated`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `isActivated` | `boolean` |

#### Returns

`void`

***

### updateEnableWhenItem()

> **updateEnableWhenItem**: (`linkId`, `newAnswer`, `parentRepeatGroupIndex`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `linkId` | `string` |
| `newAnswer` | `undefined` \| `QuestionnaireResponseItemAnswer`[] |
| `parentRepeatGroupIndex` | `null` \| `number` |

#### Returns

`void`

***

### updateExpressions()

> **updateExpressions**: (`updatedResponse`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `updatedResponse` | `QuestionnaireResponse` |

#### Returns

`void`

***

### updatePopulatedProperties()

> **updatePopulatedProperties**: (`populatedResponse`, `populatedContext`?, `persistTabIndex`?) => `QuestionnaireResponse`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `populatedResponse` | `QuestionnaireResponse` |
| `populatedContext`? | `Record`\<`string`, `any`\> |
| `persistTabIndex`? | `boolean` |

#### Returns

`QuestionnaireResponse`

***

### variables

> **variables**: [`Variables`](Variables.md)

Questionnaire variables object containing FHIRPath and x-fhir-query variables
