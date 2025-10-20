# Interface: RendererConfigStoreType

RendererConfigStore properties and methods

## Properties

### disablePageButtons

> **disablePageButtons**: `boolean`

***

### disablePageCardView

> **disablePageCardView**: `boolean`

***

### disableTabButtons

> **disableTabButtons**: `boolean`

***

### enableWhenAsReadOnly

> **enableWhenAsReadOnly**: `boolean` \| `Set`\<`"string"` \| `"boolean"` \| `"group"` \| `"display"` \| `"question"` \| `"decimal"` \| `"integer"` \| `"date"` \| `"dateTime"` \| `"time"` \| `"text"` \| `"url"` \| `"choice"` \| `"open-choice"` \| `"attachment"` \| `"reference"` \| `"quantity"`\>

***

### hideClearButton

> **hideClearButton**: `boolean`

***

### hideQuantityComparatorField

> **hideQuantityComparatorField**: `boolean`

***

### inputsFlexGrow

> **inputsFlexGrow**: `boolean`

***

### itemResponsive

> **itemResponsive**: `object`

#### columnGapPixels

> **columnGapPixels**: `number`

#### fieldBreakpoints

> **fieldBreakpoints**: `Partial`\<`Breakpoints`\[`"values"`\]\>

#### labelBreakpoints

> **labelBreakpoints**: `Partial`\<`Breakpoints`\[`"values"`\]\>

#### rowGapPixels

> **rowGapPixels**: `number`

***

### readOnlyVisualStyle

> **readOnlyVisualStyle**: `"disabled"` \| `"readonly"`

***

### requiredIndicatorPosition

> **requiredIndicatorPosition**: `"start"` \| `"end"`

***

### reverseBooleanYesNo

> **reverseBooleanYesNo**: `boolean`

***

### setRendererConfig()

> **setRendererConfig**: (`params`) => `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`RendererConfig`](RendererConfig.md) |

#### Returns

`void`

***

### showTabbedFormAt

> **showTabbedFormAt**: [`UseResponsiveProps`](UseResponsiveProps.md)

***

### tabListWidthOrResponsive

> **tabListWidthOrResponsive**: `number` \| \{ `tabContentBreakpoints`: `Partial`\<`Breakpoints`\[`"values"`\]\>; `tabListBreakpoints`: `Partial`\<`Breakpoints`\[`"values"`\]\>; \}

***

### textFieldWidth

> **textFieldWidth**: `number`
