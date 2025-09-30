# Function: getSectionHeading()

> **getSectionHeading**(`questionnaire`, `targetLinkId`, `tabs`): `null` \| `string`

Returns the section heading text for a given linkId in a questionnaire, used to label tab sections.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `questionnaire` | `Questionnaire` | The FHIR Questionnaire to search through. |
| `targetLinkId` | `string` | The linkId of the target item. |
| `tabs` | [`Tabs`](../type-aliases/Tabs.md) | Tab definitions used to match section headings. |

## Returns

`null` \| `string`

The section heading text if found, otherwise null.
