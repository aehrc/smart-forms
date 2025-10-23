# Function: useDisplayCqfAndCalculatedExpression()

> **useDisplayCqfAndCalculatedExpression**(`qItem`, `from`): `string` \| `null`

Returns the value of a cqf-expression, calculatedExpression or ItemTextAriaLabelExpression.

- If no expression is found → returns null.
- If the value is null → returns an empty string.
- If the value is a string or number → returns it as a string.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `qItem` | `QuestionnaireItem` | The questionnaire item. |
| `from` | `"item"` \| `"item._text"` \| `"item._text.aria-label"` \| `"item._answerValueSet"` | The expression source. Should be a one of 'item._text' or 'item._text.aria-label' |

## Returns

`string` \| `null`

The display value as a string, empty string, or null.
