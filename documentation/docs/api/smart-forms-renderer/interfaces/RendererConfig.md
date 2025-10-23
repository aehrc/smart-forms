# Interface: RendererConfig

RendererConfig interface
Provides fine-grained control over the styling and behaviour of the renderer.

## Properties

### disableHeadingFocusOnTabSwitch?

> `optional` **disableHeadingFocusOnTabSwitch**: `boolean`

If `true`, the first heading will be focused when switching tabs.
 - Default: `false`

***

### disablePageButtons?

> `optional` **disablePageButtons**: `boolean`

If `true`, hides navigation buttons for pages.
  - Default: `false`

***

### disablePageCardView?

> `optional` **disablePageCardView**: `boolean`

If `true`, disables the card-style layout for pages.
  - Default: `false`

***

### disableTabButtons?

> `optional` **disableTabButtons**: `boolean`

If `true`, hides navigation buttons for tabs.
  - Default: `false`

***

### enableWhenAsReadOnly?

> `optional` **enableWhenAsReadOnly**: `boolean` \| `Set`\<`"string"` \| `"boolean"` \| `"group"` \| `"display"` \| `"question"` \| `"decimal"` \| `"integer"` \| `"date"` \| `"dateTime"` \| `"time"` \| `"text"` \| `"url"` \| `"choice"` \| `"open-choice"` \| `"attachment"` \| `"reference"` \| `"quantity"`\>

Determines whether fields hidden by `enableWhen` logic should still be shown as read-only.
  - Can be `true` (all fields affected) or a `Set<QuestionnaireItem['type']>` to specify types.
  - Default: `false`

***

### hideClearButton?

> `optional` **hideClearButton**: `boolean`

If `true`, hides the clear button on input fields.
  - Default: `false`

***

### hideQuantityComparatorField?

> `optional` **hideQuantityComparatorField**: `boolean`

If `true`, hides the quantity comparator field.
  - Default: `false`

***

### inputsFlexGrow?

> `optional` **inputsFlexGrow**: `boolean`

Determines whether input fields should grow to fill available space.
  - `false` (default): Inputs maintain their default size.
  - `true`: Inputs expand to fill space.

***

### itemResponsive?

> `optional` **itemResponsive**: `object`

Controls responsive layout settings for item labels and fields.

#### columnGapPixels

> **columnGapPixels**: `number`

#### fieldBreakpoints

> **fieldBreakpoints**: `Partial`\<`Breakpoints`\[`"values"`\]\>

#### labelBreakpoints

> **labelBreakpoints**: `Partial`\<`Breakpoints`\[`"values"`\]\>

#### rowGapPixels

> **rowGapPixels**: `number`

***

### readOnlyVisualStyle?

> `optional` **readOnlyVisualStyle**: `"disabled"` \| `"readonly"`

If `true`, item.readOnly will result in form fields having MUI disabled property and styles (recommended from usability perspective). If `false`, item.readOnly will result in form fields having HTML readonly property (less stable, but recommended from accessibility perspective).
  - Default: `true`

***

### requiredIndicatorPosition?

> `optional` **requiredIndicatorPosition**: `"start"` \| `"end"`

Defines where the required asterisk (*) is placed relative to the label.
  - `"start"` (default): Asterisk appears before the label.
  - `"end"`: Asterisk appears after the label.

***

### reverseBooleanYesNo?

> `optional` **reverseBooleanYesNo**: `boolean`

If `true`, swaps "Yes" and "No" options for boolean fields.
  - Default: `false`

***

### showTabbedFormAt?

> `optional` **showTabbedFormAt**: [`UseResponsiveProps`](UseResponsiveProps.md)

Defines when the form should switch to a tabbed layout based on screen size.
  - Default: `{ query: 'up', start: 'md' }`

***

### tabListWidthOrResponsive?

> `optional` **tabListWidthOrResponsive**: `number` \| \{ `tabContentBreakpoints`: `Partial`\<`Breakpoints`\[`"values"`\]\>; `tabListBreakpoints`: `Partial`\<`Breakpoints`\[`"values"`\]\>; \}

Configures the width of the tab list, either as a fixed number or responsive breakpoints.
  - Default: `{ tabListBreakpoints: { xs: 12, sm: 3, md: 3, lg: 2.75 }, tabContentBreakpoints: { xs: 12, sm: 9, md: 9, lg: 9.25 } }`

***

### textFieldWidth?

> `optional` **textFieldWidth**: `number`

Defines the default width for text input fields (in pixels).
  - Default: `320`
