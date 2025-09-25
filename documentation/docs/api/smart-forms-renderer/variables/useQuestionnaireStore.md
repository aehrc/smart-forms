# Variable: useQuestionnaireStore

> `const` **useQuestionnaireStore**: `StoreApi`\<[`QuestionnaireStoreType`](../interfaces/QuestionnaireStoreType.md)\> & `object`

Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire.
This is the React version of the store which can be used as React hooks in React functional components.

## Type declaration

### use

> **use**: `object`

#### use.addCodingToCache()

> **addCodingToCache**: () => (`valueSetUrl`, `codings`) => `void`

##### Returns

> (`valueSetUrl`, `codings`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `valueSetUrl` | `string` |
| `codings` | `Coding`[] |

###### Returns

`void`

#### use.answerExpressions()

> **answerExpressions**: () => `Record`\<`string`, `AnswerExpression`\>

##### Returns

`Record`\<`string`, `AnswerExpression`\>

#### use.answerOptionsToggleExpressions()

> **answerOptionsToggleExpressions**: () => `Record`\<`string`, `AnswerOptionsToggleExpression`[]\>

##### Returns

`Record`\<`string`, `AnswerOptionsToggleExpression`[]\>

#### use.buildSourceQuestionnaire()

> **buildSourceQuestionnaire**: () => (`questionnaire`, `questionnaireResponse?`, `additionalVariables?`, `terminologyServerUrl?`, `readOnly?`, `qItemOverrideComponents?`, `sdcUiOverrideComponents?`) => `Promise`\<`void`\>

##### Returns

> (`questionnaire`, `questionnaireResponse?`, `additionalVariables?`, `terminologyServerUrl?`, `readOnly?`, `qItemOverrideComponents?`, `sdcUiOverrideComponents?`): `Promise`\<`void`\>

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `questionnaire` | `Questionnaire` |
| `questionnaireResponse?` | `QuestionnaireResponse` |
| `additionalVariables?` | `Record`\<`string`, `any`\> |
| `terminologyServerUrl?` | `string` |
| `readOnly?` | `boolean` |
| `qItemOverrideComponents?` | `Record`\<`string`, `ComponentType`\<[`QItemOverrideComponentProps`](../interfaces/QItemOverrideComponentProps.md)\>\> |
| `sdcUiOverrideComponents?` | `Record`\<`string`, `ComponentType`\<[`SdcUiOverrideComponentProps`](../interfaces/SdcUiOverrideComponentProps.md)\>\> |

###### Returns

`Promise`\<`void`\>

#### use.cachedValueSetCodings()

> **cachedValueSetCodings**: () => `Record`\<`string`, `Coding`[]\>

##### Returns

`Record`\<`string`, `Coding`[]\>

#### use.calculatedExpressions()

> **calculatedExpressions**: () => `Record`\<`string`, [`CalculatedExpression`](../interfaces/CalculatedExpression.md)[]\>

##### Returns

`Record`\<`string`, [`CalculatedExpression`](../interfaces/CalculatedExpression.md)[]\>

#### use.currentPageIndex()

> **currentPageIndex**: () => `number`

##### Returns

`number`

#### use.currentTabIndex()

> **currentTabIndex**: () => `number`

##### Returns

`number`

#### use.destroySourceQuestionnaire()

> **destroySourceQuestionnaire**: () => () => `void`

##### Returns

> (): `void`

###### Returns

`void`

#### use.enableWhenExpressions()

> **enableWhenExpressions**: () => `EnableWhenExpressions`

##### Returns

`EnableWhenExpressions`

#### use.enableWhenIsActivated()

> **enableWhenIsActivated**: () => `boolean`

##### Returns

`boolean`

#### use.enableWhenItems()

> **enableWhenItems**: () => `EnableWhenItems`

##### Returns

`EnableWhenItems`

#### use.enableWhenLinkedQuestions()

> **enableWhenLinkedQuestions**: () => `Record`\<`string`, `string`[]\>

##### Returns

`Record`\<`string`, `string`[]\>

#### use.fhirPathContext()

> **fhirPathContext**: () => `Record`\<`string`, `any`\>

##### Returns

`Record`\<`string`, `any`\>

#### use.fhirPathTerminologyCache()

> **fhirPathTerminologyCache**: () => `Record`\<`string`, `any`\>

##### Returns

`Record`\<`string`, `any`\>

#### use.focusedLinkId()

> **focusedLinkId**: () => `string`

##### Returns

`string`

#### use.initialExpressions()

> **initialExpressions**: () => `Record`\<`string`, `InitialExpression`\>

##### Returns

`Record`\<`string`, `InitialExpression`\>

#### use.itemMap()

> **itemMap**: () => `Record`\<`string`, `Omit`\<`QuestionnaireItem`, `"item"`\>\>

##### Returns

`Record`\<`string`, `Omit`\<`QuestionnaireItem`, `"item"`\>\>

#### use.itemPreferredTerminologyServers()

> **itemPreferredTerminologyServers**: () => `Record`\<`string`, `string`\>

##### Returns

`Record`\<`string`, `string`\>

#### use.launchContexts()

> **launchContexts**: () => `Record`\<`string`, [`LaunchContext`](../interfaces/LaunchContext.md)\>

##### Returns

`Record`\<`string`, [`LaunchContext`](../interfaces/LaunchContext.md)\>

#### use.markPageAsComplete()

> **markPageAsComplete**: () => (`pageLinkId`) => `void`

##### Returns

> (`pageLinkId`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `pageLinkId` | `string` |

###### Returns

`void`

#### use.markTabAsComplete()

> **markTabAsComplete**: () => (`tabLinkId`) => `void`

##### Returns

> (`tabLinkId`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tabLinkId` | `string` |

###### Returns

`void`

#### use.mutateRepeatEnableWhenItems()

> **mutateRepeatEnableWhenItems**: () => (`parentRepeatGroupLinkId`, `parentRepeatGroupIndex`, `actionType`) => `void`

##### Returns

> (`parentRepeatGroupLinkId`, `parentRepeatGroupIndex`, `actionType`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parentRepeatGroupLinkId` | `string` |
| `parentRepeatGroupIndex` | `number` |
| `actionType` | `"add"` \| `"remove"` |

###### Returns

`void`

#### use.onFocusLinkId()

> **onFocusLinkId**: () => (`linkId`) => `void`

##### Returns

> (`linkId`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `linkId` | `string` |

###### Returns

`void`

#### use.pages()

> **pages**: () => `Pages`

##### Returns

`Pages`

#### use.populatedContext()

> **populatedContext**: () => `Record`\<`string`, `any`\>

##### Returns

`Record`\<`string`, `any`\>

#### use.processedValueSets()

> **processedValueSets**: () => `Record`\<`string`, `ProcessedValueSet`\>

##### Returns

`Record`\<`string`, `ProcessedValueSet`\>

#### use.qItemOverrideComponents()

> **qItemOverrideComponents**: () => `Record`\<`string`, `ComponentType`\<[`QItemOverrideComponentProps`](../interfaces/QItemOverrideComponentProps.md)\>\>

##### Returns

`Record`\<`string`, `ComponentType`\<[`QItemOverrideComponentProps`](../interfaces/QItemOverrideComponentProps.md)\>\>

#### use.readOnly()

> **readOnly**: () => `boolean`

##### Returns

`boolean`

#### use.sdcUiOverrideComponents()

> **sdcUiOverrideComponents**: () => `Record`\<`string`, `ComponentType`\<[`SdcUiOverrideComponentProps`](../interfaces/SdcUiOverrideComponentProps.md)\>\>

##### Returns

`Record`\<`string`, `ComponentType`\<[`SdcUiOverrideComponentProps`](../interfaces/SdcUiOverrideComponentProps.md)\>\>

#### use.setFormAsReadOnly()

> **setFormAsReadOnly**: () => (`readOnly`) => `void`

##### Returns

> (`readOnly`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `readOnly` | `boolean` |

###### Returns

`void`

#### use.setPopulatedContext()

> **setPopulatedContext**: () => (`newPopulatedContext`, `addToFhirPathContext?`) => `void`

##### Returns

> (`newPopulatedContext`, `addToFhirPathContext?`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `newPopulatedContext` | `Record`\<`string`, `any`\> |
| `addToFhirPathContext?` | `boolean` |

###### Returns

`void`

#### use.sourceQuestionnaire()

> **sourceQuestionnaire**: () => `Questionnaire`

##### Returns

`Questionnaire`

#### use.switchPage()

> **switchPage**: () => (`newPageIndex`) => `void`

##### Returns

> (`newPageIndex`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `newPageIndex` | `number` |

###### Returns

`void`

#### use.switchTab()

> **switchTab**: () => (`newTabIndex`) => `void`

##### Returns

> (`newTabIndex`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `newTabIndex` | `number` |

###### Returns

`void`

#### use.tabs()

> **tabs**: () => [`Tabs`](../type-aliases/Tabs.md)

##### Returns

[`Tabs`](../type-aliases/Tabs.md)

#### use.targetConstraintLinkIds()

> **targetConstraintLinkIds**: () => `Record`\<`string`, `string`[]\>

##### Returns

`Record`\<`string`, `string`[]\>

#### use.targetConstraints()

> **targetConstraints**: () => `Record`\<`string`, `TargetConstraint`\>

##### Returns

`Record`\<`string`, `TargetConstraint`\>

#### use.toggleEnableWhenActivation()

> **toggleEnableWhenActivation**: () => (`isActivated`) => `void`

##### Returns

> (`isActivated`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `isActivated` | `boolean` |

###### Returns

`void`

#### use.updateEnableWhenItem()

> **updateEnableWhenItem**: () => (`linkId`, `newAnswer`, `parentRepeatGroupIndex`) => `void`

##### Returns

> (`linkId`, `newAnswer`, `parentRepeatGroupIndex`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `linkId` | `string` |
| `newAnswer` | `undefined` \| `QuestionnaireResponseItemAnswer`[] |
| `parentRepeatGroupIndex` | `null` \| `number` |

###### Returns

`void`

#### use.updateExpressions()

> **updateExpressions**: () => (`updatedResponse`) => `Promise`\<`void`\>

##### Returns

> (`updatedResponse`): `Promise`\<`void`\>

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `updatedResponse` | `QuestionnaireResponse` |

###### Returns

`Promise`\<`void`\>

#### use.updatePopulatedProperties()

> **updatePopulatedProperties**: () => (`populatedResponse`, `populatedContext?`, `persistTabIndex?`) => `Promise`\<`QuestionnaireResponse`\>

##### Returns

> (`populatedResponse`, `populatedContext?`, `persistTabIndex?`): `Promise`\<`QuestionnaireResponse`\>

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `populatedResponse` | `QuestionnaireResponse` |
| `populatedContext?` | `Record`\<`string`, `any`\> |
| `persistTabIndex?` | `boolean` |

###### Returns

`Promise`\<`QuestionnaireResponse`\>

#### use.variables()

> **variables**: () => [`Variables`](../interfaces/Variables.md)

##### Returns

[`Variables`](../interfaces/Variables.md)

## See

 - QuestionnaireStoreType for available properties and methods.
 - questionnaireStore for the vanilla store.
