# Variable: useRendererStylingStore

> `const` **useRendererStylingStore**: `StoreApi`\<[`RendererStylingStoreType`](../interfaces/RendererStylingStoreType.md)\> & `object`

## Type declaration

### use

> **use**: `object`

#### use.disablePageButtons()

> **disablePageButtons**: () => `boolean`

##### Returns

`boolean`

#### use.disablePageCardView()

> **disablePageCardView**: () => `boolean`

##### Returns

`boolean`

#### use.enableWhenAsReadOnly()

> **enableWhenAsReadOnly**: () => `boolean` \| `Set`\<`"string"` \| `"boolean"` \| `"group"` \| `"display"` \| `"question"` \| `"decimal"` \| `"integer"` \| `"date"` \| `"dateTime"` \| `"time"` \| `"text"` \| `"url"` \| `"choice"` \| `"open-choice"` \| `"attachment"` \| `"reference"` \| `"quantity"`\>

##### Returns

`boolean` \| `Set`\<`"string"` \| `"boolean"` \| `"group"` \| `"display"` \| `"question"` \| `"decimal"` \| `"integer"` \| `"date"` \| `"dateTime"` \| `"time"` \| `"text"` \| `"url"` \| `"choice"` \| `"open-choice"` \| `"attachment"` \| `"reference"` \| `"quantity"`\>

#### use.hideClearButton()

> **hideClearButton**: () => `boolean`

##### Returns

`boolean`

#### use.hideQuantityComparatorField()

> **hideQuantityComparatorField**: () => `boolean`

##### Returns

`boolean`

#### use.inputsFlexGrow()

> **inputsFlexGrow**: () => `boolean`

##### Returns

`boolean`

#### use.itemFieldGridBreakpoints()

> **itemFieldGridBreakpoints**: () => `ItemGridBreakpoints`

##### Returns

`ItemGridBreakpoints`

#### use.itemLabelFontWeight()

> **itemLabelFontWeight**: () => `"500"` \| `"800"` \| `"600"` \| `"default"` \| `"100"` \| `"200"` \| `"300"` \| `"400"` \| `"700"` \| `"900"`

##### Returns

`"500"` \| `"800"` \| `"600"` \| `"default"` \| `"100"` \| `"200"` \| `"300"` \| `"400"` \| `"700"` \| `"900"`

#### use.itemLabelGridBreakpoints()

> **itemLabelGridBreakpoints**: () => `ItemGridBreakpoints`

##### Returns

`ItemGridBreakpoints`

#### use.requiredIndicatorPosition()

> **requiredIndicatorPosition**: () => `"start"` \| `"end"`

##### Returns

`"start"` \| `"end"`

#### use.reverseBooleanYesNo()

> **reverseBooleanYesNo**: () => `boolean`

##### Returns

`boolean`

#### use.setRendererStyling()

> **setRendererStyling**: () => (`params`) => `void`

##### Returns

`Function`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`RendererStyling`](../interfaces/RendererStyling.md) |

###### Returns

`void`

#### use.textFieldWidth()

> **textFieldWidth**: () => `number`

##### Returns

`number`
