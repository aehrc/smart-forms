# Summary of Old/New Value Swapping Issue for Repopulation

**Affected Component(s):** Primarily the data preparation logic that feeds the `RepopulateSelectDialog`.

**Observed Problem:**

When a form is repopulated and there are changes to field values (e.g., date fields), the repopulation dialog incorrectly displays:
*   The **actual new value** under the "OLD VALUE" heading.
*   The **actual old value** under the "NEW VALUE" heading.

**Example Scenario:**

*   **Initial Form State:**
    *   Date of last completed health check: `08/05/2025`
    *   Date this health check commenced: `13/05/2025`
*   **New Data (Source for Repopulation):**
    *   Date of last completed health check: `10/05/2025`
    *   Date this health check commenced: `15/05/2025`

*   **Expected Dialog Display:**
    *   Date of last completed health check:
        *   OLD VALUE: `2025-05-08`
        *   NEW VALUE: `2025-05-10`
    *   Date this health check commenced:
        *   OLD VALUE: `2025-05-13`
        *   NEW VALUE: `2025-05-15`

*   **Actual (Incorrect) Dialog Display:**
    *   Date of last completed health check:
        *   OLD VALUE: `2025-05-10` (*this is the new data*)
        *   NEW VALUE: `2025-05-08` (*this is the old data*)
    *   Date this health check commenced:
        *   OLD VALUE: `2025-05-15` (*this is the new data*)
        *   NEW VALUE: `2025-05-13` (*this is the old data*)

**Root Cause Analysis:**

The display components (`SimplifiedRepopulateItemSwitcher`, `RepopulateListItem`, `RepopulateList`, `RepopulateSelectDialog`)
 appear to be correctly rendering the data they receive in their `oldQRItem` and `newQRItem` props.

The issue lies **upstream**, in the logic that constructs the `itemsToRepopulate` object. 
This object is then passed to the `RepopulateSelectDialog` (likely via the `RepopulationStore`).

The function responsible for comparing the current `QuestionnaireResponse` with the new source `QuestionnaireResponse` and
 generating the list of differences is incorrectly assigning:
*   The item from the **new source data** to the `oldQRItem` field.
*   The item from the **current/original form data** to the `newQRItem` field.

We identified that `generateItemsToRepopulate` function, imported from `@aehrc/smart-forms-renderer` and used in
 `apps/smart-forms-app/src/features/renderer/components/RendererActions/RepopulateAction.tsx`, 
 is the most probable location of this incorrect assignment logic.

**Current Workaround (Dirty Fix):**

A temporary fix has been implemented in `RepopulateSelectDialog.tsx` to manually swap
 `oldQRItem` and `newQRItem` (and `oldQRItems`/`newQRItems`) for each item received in the
  `itemsToRepopulate` prop. This corrects the display in the UI.

```tsx
// In RepopulateSelectDialog.tsx
const itemsToRepopulate = useMemo(() => {
  const correctedItems: Record<string, ItemToRepopulate> = {};
  for (const linkId in initialItemsToRepopulate) {
    const item = initialItemsToRepopulate[linkId];
    correctedItems[linkId] = {
      ...item,
      oldQRItem: item.newQRItem, // Swap: old becomes new
      newQRItem: item.oldQRItem, // Swap: new becomes old
      oldQRItems: item.newQRItems,
      newQRItems: item.oldQRItems
    };
  }
  return correctedItems;
}, [initialItemsToRepopulate]);
```

**Recommended Long-Term Solution:**

The root cause should be addressed by correcting the assignment logic within the
 `generateItemsToRepopulate` function in the `@aehrc/smart-forms-renderer` package.
  The `oldQRItem` should always represent the data from the form *before* repopulation,
   and `newQRItem` should represent the *incoming* data from the source.

Once the renderer package is fixed, the temporary workaround in `RepopulateSelectDialog.tsx` should be removed. 