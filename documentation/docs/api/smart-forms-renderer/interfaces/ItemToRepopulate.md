# Interface: ItemToRepopulate

Represents an item within a questionnaire that can be re-populated with updated data from the patient record.

## Properties

### currentQRItem?

> `optional` **currentQRItem**: `QuestionnaireResponseItem`

Current QuestionnaireResponseItem in form (optional)

// For repeating groups:

***

### currentQRItems?

> `optional` **currentQRItems**: `QuestionnaireResponseItem`[]

Array of current QuestionnaireResponseItems in form (optional)

Use serverQRItem/currentQRItem for single items, and serverQRItems/currentQRItems for repeat groups.

***

### isInGrid

> **isInGrid**: `boolean`

Whether this item is part of a grid

// For non-repeating items:

***

### parentItemText

> **parentItemText**: `string` \| `null`

Immediate parent item.text

***

### qItem

> **qItem**: `QuestionnaireItem` \| `null`

QuestionnaireItem definition for this item

***

### sectionItemText

> **sectionItemText**: `string` \| `null`

Top-level group item.text this item belongs to

***

### serverQRItem?

> `optional` **serverQRItem**: `QuestionnaireResponseItem`

QuestionnaireResponseItem from server (optional)

***

### serverQRItems?

> `optional` **serverQRItems**: `QuestionnaireResponseItem`[]

Array of QuestionnaireResponseItems from server (optional)
