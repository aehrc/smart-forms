# Function: QuestionnaireTitleText()

> **QuestionnaireTitleText**(`props`): `Element`

Renders `Questionnaire.title` with support for optional `Questionnaire._title` rendering
extensions (xhtml, markdown, style).

This component is rendered automatically by the renderer at the top of the form unless
`hideQuestionnaireTitle` is set to `true` in the renderer config (via `setRendererConfig`).
Set `hideQuestionnaireTitle: true` when your consuming app already displays the questionnaire
title in its own header, to avoid rendering it twice.

The component is also exported so consuming apps can render the styled title independently
in a custom location (e.g. a page header or sidebar).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `props` | `QuestionnaireTitleTextProps` |

## Returns

`Element`

## Example

```ts
// Render title in a custom location
import { QuestionnaireTitleText } from '@aehrc/smart-forms-renderer';
<QuestionnaireTitleText questionnaire={questionnaire} />
```

## See

QuestionnaireTitleTextProps
