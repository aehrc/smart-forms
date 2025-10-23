# Interface: CalculatedExpression

CalculatedExpression interface

## Properties

### expression

> **expression**: `string`

CalculatedExpression FHIRPath expression

***

### from

> **from**: `"item"` \| `"item._text"` \| `"item._text.aria-label"` \| `"item._answerValueSet"`

Whether the expressions is for the item itself, for item._text or item._answerValueSet

***

### value?

> `optional` **value**: `string` \| `number` \| `boolean` \| `object` \| `null`

Evaluated value of the expression via FHIRPath
