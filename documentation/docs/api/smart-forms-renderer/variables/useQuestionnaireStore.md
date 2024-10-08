# Variable: useQuestionnaireStore

> `const` **useQuestionnaireStore**: `StoreApi` \<[`QuestionnaireStoreType`](../interfaces/QuestionnaireStoreType.md)\> & `object`

Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire.
This is the React version of the store which can be used as React hooks in React functional components.

## See

 - QuestionnaireStoreType for available properties and methods.
 - questionnaireStore for the vanilla store.

## Type declaration

### use

> **use**: `object`

### use.addCodingToCache()

> **addCodingToCache**: () => (`valueSetUrl`, `codings`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `valueSetUrl` | `string` |
| `codings` | `Coding`[] |

##### Returns

`void`

### use.answerExpressions()

> **answerExpressions**: () => `Record`\<`string`, `AnswerExpression`\>

#### Returns

`Record`\<`string`, `AnswerExpression`\>

### use.buildSourceQuestionnaire()

> **buildSourceQuestionnaire**: () => (`questionnaire`, `questionnaireResponse`?, `additionalVariables`?, `terminologyServerUrl`?, `readOnly`?) => `Promise`\<`void`\>

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `questionnaire` | `Questionnaire` |
| `questionnaireResponse`? | `QuestionnaireResponse` |
| `additionalVariables`? | `Record`\<`string`, `object`\> |
| `terminologyServerUrl`? | `string` |
| `readOnly`? | `boolean` |

##### Returns

`Promise`\<`void`\>

### use.cachedValueSetCodings()

> **cachedValueSetCodings**: () => `Record`\<`string`, `Coding`[]\>

#### Returns

`Record`\<`string`, `Coding`[]\>

### use.calculatedExpressions()

> **calculatedExpressions**: () => `Record`\<`string`, `CalculatedExpression`[]\>

#### Returns

`Record`\<`string`, `CalculatedExpression`[]\>

### use.currentPageIndex()

> **currentPageIndex**: () => `number`

#### Returns

`number`

### use.currentTabIndex()

> **currentTabIndex**: () => `number`

#### Returns

`number`

### use.destroySourceQuestionnaire()

> **destroySourceQuestionnaire**: () => () => `void`

#### Returns

`Function`

##### Returns

`void`

### use.enableWhenExpressions()

> **enableWhenExpressions**: () => `EnableWhenExpressions`

#### Returns

`EnableWhenExpressions`

### use.enableWhenIsActivated()

> **enableWhenIsActivated**: () => `boolean`

#### Returns

`boolean`

### use.enableWhenItems()

> **enableWhenItems**: () => `EnableWhenItems`

#### Returns

`EnableWhenItems`

### use.enableWhenLinkedQuestions()

> **enableWhenLinkedQuestions**: () => `Record`\<`string`, `string`[]\>

#### Returns

`Record`\<`string`, `string`[]\>

### use.fhirPathContext()

> **fhirPathContext**: () => `Record`\<`string`, `any`\>

#### Returns

`Record`\<`string`, `any`\>

### use.focusedLinkId()

> **focusedLinkId**: () => `string`

#### Returns

`string`

### use.initialExpressions()

> **initialExpressions**: () => `Record`\<`string`, `InitialExpression`\>

#### Returns

`Record`\<`string`, `InitialExpression`\>

### use.itemPreferredTerminologyServers()

> **itemPreferredTerminologyServers**: () => `Record`\<`string`, `string`\>

#### Returns

`Record`\<`string`, `string`\>

### use.itemTypes()

> **itemTypes**: () => `Record`\<`string`, `string`\>

#### Returns

`Record`\<`string`, `string`\>

### use.launchContexts()

> **launchContexts**: () => `Record`\<`string`, [`LaunchContext`](../interfaces/LaunchContext.md)\>

#### Returns

`Record`\<`string`, [`LaunchContext`](../interfaces/LaunchContext.md)\>

### use.markPageAsComplete()

> **markPageAsComplete**: () => (`pageLinkId`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `pageLinkId` | `string` |

##### Returns

`void`

### use.markTabAsComplete()

> **markTabAsComplete**: () => (`tabLinkId`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `tabLinkId` | `string` |

##### Returns

`void`

### use.mutateRepeatEnableWhenItems()

> **mutateRepeatEnableWhenItems**: () => (`parentRepeatGroupLinkId`, `parentRepeatGroupIndex`, `actionType`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `parentRepeatGroupLinkId` | `string` |
| `parentRepeatGroupIndex` | `number` |
| `actionType` | `"add"` \| `"remove"` |

##### Returns

`void`

### use.onFocusLinkId()

> **onFocusLinkId**: () => (`linkId`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `linkId` | `string` |

##### Returns

`void`

### use.pages()

> **pages**: () => `Pages`

#### Returns

`Pages`

### use.populatedContext()

> **populatedContext**: () => `Record`\<`string`, `any`\>

#### Returns

`Record`\<`string`, `any`\>

### use.processedValueSetCodings()

> **processedValueSetCodings**: () => `Record`\<`string`, `Coding`[]\>

#### Returns

`Record`\<`string`, `Coding`[]\>

### use.processedValueSetUrls()

> **processedValueSetUrls**: () => `Record`\<`string`, `string`\>

#### Returns

`Record`\<`string`, `string`\>

### use.readOnly()

> **readOnly**: () => `boolean`

#### Returns

`boolean`

### use.setFormAsReadOnly()

> **setFormAsReadOnly**: () => (`readOnly`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `readOnly` | `boolean` |

##### Returns

`void`

### use.setPopulatedContext()

> **setPopulatedContext**: () => (`newPopulatedContext`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `newPopulatedContext` | `Record`\<`string`, `any`\> |

##### Returns

`void`

### use.sourceQuestionnaire()

> **sourceQuestionnaire**: () => `Questionnaire`

#### Returns

`Questionnaire`

### use.switchPage()

> **switchPage**: () => (`newPageIndex`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `newPageIndex` | `number` |

##### Returns

`void`

### use.switchTab()

> **switchTab**: () => (`newTabIndex`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `newTabIndex` | `number` |

##### Returns

`void`

### use.tabs()

> **tabs**: () => [`Tabs`](../type-aliases/Tabs.md)

#### Returns

[`Tabs`](../type-aliases/Tabs.md)

### use.toggleEnableWhenActivation()

> **toggleEnableWhenActivation**: () => (`isActivated`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `isActivated` | `boolean` |

##### Returns

`void`

### use.updateEnableWhenItem()

> **updateEnableWhenItem**: () => (`linkId`, `newAnswer`, `parentRepeatGroupIndex`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `linkId` | `string` |
| `newAnswer` | `undefined` \| `QuestionnaireResponseItemAnswer`[] |
| `parentRepeatGroupIndex` | `null` \| `number` |

##### Returns

`void`

### use.updateExpressions()

> **updateExpressions**: () => (`updatedResponse`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `updatedResponse` | `QuestionnaireResponse` |

##### Returns

`void`

### use.updatePopulatedProperties()

> **updatePopulatedProperties**: () => (`populatedResponse`, `populatedContext`?, `persistTabIndex`?) => `QuestionnaireResponse`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `populatedResponse` | `QuestionnaireResponse` |
| `populatedContext`? | `Record`\<`string`, `any`\> |
| `persistTabIndex`? | `boolean` |

##### Returns

`QuestionnaireResponse`

### use.variables()

> **variables**: () => [`Variables`](../interfaces/Variables.md)

#### Returns

[`Variables`](../interfaces/Variables.md)
