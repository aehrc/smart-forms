# Interface: QuestionnaireStoreType

QuestionnaireStore properties and methods
Properties can be accessed for fine-grain details.
Methods are usually used internally, using them from an external source is not recommended.

## Properties

### addCodingToCache()

> **addCodingToCache**: (`valueSetUrl`, `codings`) => `void`

Used to add a coding to the cached value set codings

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `valueSetUrl` | `string` |
| `codings` | `Coding`[] |

#### Returns

`void`

***

### additionalContext

> **additionalContext**: `Record`\<`string`, `any`\>

Key-value pair of additional/pre-populated FHIRPath values `Record<variable/launchContext/sourceQueries batch name, evaluated value(s)>`

***

### answerExpressions

> **answerExpressions**: `Record`\<`string`, `AnswerExpression`\>

Key-value pair of answer expressions `Record<linkId, answer expression properties>`

***

### answerOptionsToggleExpressions

> **answerOptionsToggleExpressions**: `Record`\<`string`, `AnswerOptionsToggleExpression`[]\>

Key-value pair of answer options toggle expressions `Record<linkId, array of answer options toggle expressions>`

***

### buildSourceQuestionnaire()

> **buildSourceQuestionnaire**: (`questionnaire`, `questionnaireResponse?`, `additionalContext?`, `terminologyServerUrl?`, `readOnly?`, `qItemOverrideComponents?`, `sdcUiOverrideComponents?`) => `Promise`\<`void`\>

Used to build the source questionnaire with the provided questionnaire and optionally questionnaire response, additional variables, terminology server url and readyOnly flag

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `questionnaire` | `Questionnaire` |
| `questionnaireResponse?` | `QuestionnaireResponse` |
| `additionalContext?` | `Record`\<`string`, `any`\> |
| `terminologyServerUrl?` | `string` |
| `readOnly?` | `boolean` |
| `qItemOverrideComponents?` | `Record`\<`string`, `ComponentType`\<[`QItemOverrideComponentProps`](QItemOverrideComponentProps.md)\>\> |
| `sdcUiOverrideComponents?` | `Record`\<`string`, `ComponentType`\<[`SdcUiOverrideComponentProps`](SdcUiOverrideComponentProps.md)\>\> |

#### Returns

`Promise`\<`void`\>

***

### cachedValueSetCodings

> **cachedValueSetCodings**: `Record`\<`string`, `Coding`[]\>

Key-value pair of cached value set codings `Record<valueSetUrl, codings>`

***

### calculatedExpressions

> **calculatedExpressions**: `Record`\<`string`, [`CalculatedExpression`](CalculatedExpression.md)[]\>

Key-value pair of calculated expressions `Record<linkId, array of calculated expression properties>`

***

### currentPageIndex

> **currentPageIndex**: `number`

Index of the current page

***

### currentTabIndex

> **currentTabIndex**: `number`

Index of the current tab

***

### destroySourceQuestionnaire()

> **destroySourceQuestionnaire**: () => `void`

Used to destroy the source questionnaire and reset all properties

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

### fhirPathTerminologyCache

> **fhirPathTerminologyCache**: `Record`\<`string`, `any`\>

Key-value pair of cached FHIRPath Terminology results `Record<cacheKey, cached terminology result>`

***

### focusedLinkId

> **focusedLinkId**: `string`

LinkId of the currently focused item

***

### initialExpressions

> **initialExpressions**: `Record`\<`string`, `InitialExpression`\>

Key-value pair of initial expressions `Record<linkId, InitialExpression>`

***

### itemMap

> **itemMap**: `Record`\<`string`, `Omit`\<`QuestionnaireItem`, `"item"`\>\>

Key-value pair of item types `Record<linkId, { linkId, QuestionnaireItem (without qItem.item) }>`

***

### itemPreferredTerminologyServers

> **itemPreferredTerminologyServers**: `Record`\<`string`, `string`\>

Key-value pair of item types `Record<linkId, preferred terminology servers>`

***

### launchContexts

> **launchContexts**: `Record`\<`string`, [`LaunchContext`](LaunchContext.md)\>

Key-value pair of launch contexts `Record<launch context name, launch context properties>`

***

### markPageAsComplete()

> **markPageAsComplete**: (`pageLinkId`) => `void`

Used to mark a page index as complete

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pageLinkId` | `string` |

#### Returns

`void`

***

### markTabAsComplete()

> **markTabAsComplete**: (`tabLinkId`) => `void`

Used to mark a tab index as complete

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `tabLinkId` | `string` |

#### Returns

`void`

***

### mutateRepeatEnableWhenItems()

> **mutateRepeatEnableWhenItems**: (`parentRepeatGroupLinkId`, `parentRepeatGroupIndex`, `actionType`) => `void`

Used to add or remove instances of repeating enableWhen items

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `parentRepeatGroupLinkId` | `string` |
| `parentRepeatGroupIndex` | `number` |
| `actionType` | `"add"` \| `"remove"` |

#### Returns

`void`

***

### onFocusLinkId()

> **onFocusLinkId**: (`linkId`) => `void`

Used to set the focused linkId

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `linkId` | `string` |

#### Returns

`void`

***

### pages

> **pages**: `Pages`

Key-value pair of pages `Record<linkId, Page>`

***

### processedValueSets

> **processedValueSets**: `Record`\<`string`, `ProcessedValueSet`\>

Key-value pair of (pre-)processed value set codings `Record<valueSetUrl, ProcessedValueSet>`

***

### qItemOverrideComponents

> **qItemOverrideComponents**: `Record`\<`string`, `ComponentType`\<[`QItemOverrideComponentProps`](QItemOverrideComponentProps.md)\>\>

Key-value pair of React component overrides for Questionnaire Items via linkId `Record<linkId, React component>`

***

### readOnly

> **readOnly**: `boolean`

Flag to set the form to read-only mode

***

### resetToFirstVisiblePage()

> **resetToFirstVisiblePage**: () => `void`

Used to reset the current page to the first visible page

#### Returns

`void`

***

### resetToFirstVisibleTab()

> **resetToFirstVisibleTab**: () => `void`

Used to reset the current tab to the first visible tab

#### Returns

`void`

***

### sdcUiOverrideComponents

> **sdcUiOverrideComponents**: `Record`\<`string`, `ComponentType`\<[`SdcUiOverrideComponentProps`](SdcUiOverrideComponentProps.md)\>\>

Key-value pair of React component overrides for SDC UI Controls https://hl7.org/fhir/extensions/ValueSet-questionnaire-item-control.html `Record<SDC UI code, React component>`

***

### setAdditionalContext()

> **setAdditionalContext**: (`additionalContext`) => `void`

Optionally used to set additional context information for FHIRPath eval. Useful to pass pre-populated context into the renderer. If you are rebuilding the form on pre-populate, you don't need to use this. pass `additionalContext` directly into buildForm().

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `additionalContext` | `Record`\<`string`, `any`\> |

#### Returns

`void`

***

### setFormAsReadOnly()

> **setFormAsReadOnly**: (`readOnly`) => `void`

Used to set the form as read-only

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `readOnly` | `boolean` |

#### Returns

`void`

***

### sourceQuestionnaire

> **sourceQuestionnaire**: `Questionnaire`

FHIR R4 Questionnaire to render

***

### switchPage()

> **switchPage**: (`newPageIndex`) => `void`

Used to switch the current page index

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `newPageIndex` | `number` |

#### Returns

`void`

***

### switchTab()

> **switchTab**: (`newTabIndex`) => `void`

Used to switch the current tab index

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `newTabIndex` | `number` |

#### Returns

`void`

***

### tabs

> **tabs**: [`Tabs`](../type-aliases/Tabs.md)

Key-value pair of tabs `Record<linkId, Tab>`

***

### targetConstraintLinkIds

> **targetConstraintLinkIds**: `Record`\<`string`, `string`[]\>

Key-value pair of linkIds against target constraint key(s) `Record<linkId, target constraint keys>`

***

### targetConstraints

> **targetConstraints**: `Record`\<`string`, `TargetConstraint`\>

Key-value pair of target constraints `Record<target constraint key, target constraint properties>`

***

### toggleEnableWhenActivation()

> **toggleEnableWhenActivation**: (`isActivated`) => `void`

Used to toggle enableWhen checks on/off

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `isActivated` | `boolean` |

#### Returns

`void`

***

### updateEnableWhenItem()

> **updateEnableWhenItem**: (`linkId`, `newAnswer`, `parentRepeatGroupIndex`) => `void`

Used to update linked enableWhen items by updating a question with a new answer

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `linkId` | `string` |
| `newAnswer` | `QuestionnaireResponseItemAnswer`[] \| `undefined` |
| `parentRepeatGroupIndex` | `number` \| `null` |

#### Returns

`void`

***

### updateExpressions()

> **updateExpressions**: (`updatedResponse`, `isInitialUpdate`) => `Promise`\<`void`\>

Used to update all SDC expressions based on the updated questionnaire response, initialUpdate flag is to ensure formChangesHistory is not updated during the first update after form build

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `updatedResponse` | `QuestionnaireResponse` |
| `isInitialUpdate` | `boolean` |

#### Returns

`Promise`\<`void`\>

***

### variables

> **variables**: [`Variables`](Variables.md)

Questionnaire variables object containing FHIRPath and x-fhir-query variables
