# Function: useResponsive()

> **useResponsive**(`props`): `boolean`

A hook to determine if the screen size matches a given breakpoint query.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`UseResponsiveProps`](../interfaces/UseResponsiveProps.md) | The responsive query options. |

## Returns

`boolean`

`true` if the current screen size matches the query, otherwise `false`.

## Examples

```ts
// Check if the screen size is at least 'md' (medium)
const isMdUp = useResponsive({ query: 'up', start: 'md' });
```

```ts
// Check if the screen size is exactly 'lg' (large)
const isLgOnly = useResponsive({ query: 'only', start: 'lg' });
```

```ts
// Check if the screen size is at least 'tablet' - this is a custom breakpoint https://mui.com/material-ui/customization/breakpoints/#custom-breakpoints
const isTabletUp = useResponsive({ query: 'up', start: 'tablet' });
```
