# Interface: UseResponsiveProps

Props for the useResponsive() hook -  used to determine if the screen size matches a given breakpoint query.

## Param

The type of query:
  - `'up'`: Matches screen sizes above and including `start`.
  - `'down'`: Matches screen sizes below and including `start`.
  - `'between'`: Matches screen sizes between `start` and `end` (inclusive).
  - `'only'`: Matches exactly the `start` size.

## Param

The starting breakpoint - can be extended via MUI BreakpointOverrides.

## Param

The ending breakpoint (required if `query` is `'between'`) - can be extended via MUI BreakpointOverrides.

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

## Properties

### end?

> `optional` **end**: `Breakpoint`

***

### query

> **query**: `"up"` \| `"down"` \| `"between"` \| `"only"`

***

### start

> **start**: `Breakpoint`
