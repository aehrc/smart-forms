# Function: mapQItemsIndex()

> **mapQItemsIndex**(`questionnaireOrQItem`): `Record`\<`string`, `number`\>

Generate a dictionary of QuestionnaireItems linkIds mapped to their respective array indexes `<linkId, QItemIndex>`
i.e. `{ ee2589d5: 0, f9aaa187: 1, 88cab112: 2 }`
where ee2589d5, f9aaa187 and 88cab112 are linkIds of QItem0, QItem1 and QItem2 respectively

## Parameters

| Parameter | Type |
| ------ | ------ |
| `questionnaireOrQItem` | `Questionnaire` \| `QuestionnaireItem` |

## Returns

`Record`\<`string`, `number`\>
