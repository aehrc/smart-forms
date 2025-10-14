# Variable: useRendererConfigStore

> `const` **useRendererConfigStore**: `StoreApi`\<[`RendererConfigStoreType`](../interfaces/RendererConfigStoreType.md)\> & `object`

## Type Declaration

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

#### use.disableTabButtons()

> **disableTabButtons**: () => `boolean`

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

#### use.itemResponsive()

> **itemResponsive**: () => `object`

##### Returns

`object`

###### columnGapPixels

> **columnGapPixels**: `number`

###### fieldBreakpoints

> **fieldBreakpoints**: `Partial`\<`Breakpoints`\[`"values"`\]\>

###### labelBreakpoints

> **labelBreakpoints**: `Partial`\<`Breakpoints`\[`"values"`\]\>

###### rowGapPixels

> **rowGapPixels**: `number`

#### use.readOnlyVisualStyle()

> **readOnlyVisualStyle**: () => `"disabled"` \| `"readonly"`

##### Returns

`"disabled"` \| `"readonly"`

#### use.requiredIndicatorPosition()

> **requiredIndicatorPosition**: () => `"start"` \| `"end"`

##### Returns

`"start"` \| `"end"`

#### use.reverseBooleanYesNo()

> **reverseBooleanYesNo**: () => `boolean`

##### Returns

`boolean`

#### use.setRendererConfig()

> **setRendererConfig**: () => (`params`) => `void`

##### Returns

> (`params`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`RendererConfig`](../interfaces/RendererConfig.md) |

###### Returns

`void`

#### use.showTabbedFormAt()

> **showTabbedFormAt**: () => [`UseResponsiveProps`](../interfaces/UseResponsiveProps.md)

##### Returns

[`UseResponsiveProps`](../interfaces/UseResponsiveProps.md)

#### use.tabListWidthOrResponsive()

> **tabListWidthOrResponsive**: () => `number` \| \{ `tabContentBreakpoints`: `Partial`\<`Breakpoints`\[`"values"`\]\>; `tabListBreakpoints`: `Partial`\<`Breakpoints`\[`"values"`\]\>; \}

##### Returns

`number` \| \{ `tabContentBreakpoints`: `Partial`\<`Breakpoints`\[`"values"`\]\>; `tabListBreakpoints`: `Partial`\<`Breakpoints`\[`"values"`\]\>; \}

#### use.textFieldWidth()

> **textFieldWidth**: () => `number`

##### Returns

`number`
