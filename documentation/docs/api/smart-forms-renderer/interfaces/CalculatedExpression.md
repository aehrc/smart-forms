# Interface: CalculatedExpression

CalculatedExpression interface

## Properties

### expression

> **expression**: `string`

CalculatedExpression FHIRPath expression

***

### from

> **from**: `"item"` \| `"item._text"` \| `"item._answerValueSet"`

Whether the expressions is for the item itself, for item._text or item._answerValueSet

***

### value?

> `optional` **value**: `null` \| `string` \| `number` \| `boolean` \| `object`

Evaluated value of the expression via FHIRPath
