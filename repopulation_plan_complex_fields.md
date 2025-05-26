# Plan for Repopulating Complex Fields (e.g., Medical History)

**Objective:** Enhance the repopulation dialog to correctly display and handle changes within complex fields like grids or repeating groups (e.g., "Medical history and current problems list").

**Current Challenges with Complex Fields:**
1.  **Incorrect Old/New Display:** The dialog currently may not accurately differentiate between what was removed, added, or changed *within* a list of items. It might show aggregated changes rather than specific item-level diffs.
2.  **Missing Granular Headings/Context:** Changes to sub-items (e.g., a specific medical condition) are not clearly presented under their respective headings.
3.  **Handling Additions/Removals/Changes within the List:** The UI needs to clearly distinguish between:
    *   Entirely new sub-items.
    *   Entirely removed sub-items.
    *   Modifications to fields within existing sub-items.

**Proposed Plan:**

1.  **Review and Refine `SimplifiedRepopulateItemSwitcher.tsx`:**
    *   Focus on the logic that handles `QuestionnaireItem`s of type `group` or items representing repeating structures (identified often by the presence of `qItem.repeats` or by specific `linkId` patterns like "medical-history").
    *   The existing `isMedicalHistory` check and the `detectChanges` function within it will be the primary area of focus.

2.  **Enhance `detectChanges` Function (within `SimplifiedRepopulateItemSwitcher.tsx`):**
    *   **Input:** This function receives the `oldQRItem` and `newQRItem` (or `oldQRItems`/`newQRItems`) for the group.
        *   *Dependency Note:* Be mindful of the "dirty fix" in `RepopulateSelectDialog.tsx`. If the root cause of `oldQRItem` and `newQRItem` being swapped by `generateItemsToRepopulate` (in the renderer) is not yet fixed, `detectChanges` will receive these swapped items. It might need to temporarily "unswap" them internally for its comparison logic to be correct, or the "dirty fix" needs to be very reliably applied.
    *   **Logic:**
        *   Iterate through the sub-items (e.g., individual medical conditions) in both the old and new item lists.
        *   **Identify New Sub-Items:** Sub-items present in `newQRItem.item` but not in `oldQRItem.item`.
        *   **Identify Removed Sub-Items:** Sub-items present in `oldQRItem.item` but not in `newQRItem.item`.
        *   **Identify Potentially Changed Sub-Items:** Sub-items present in both. For these, perform a deeper comparison of their fields (e.g., "Onset Date," "Recorded Date," "Condition Name").
    *   **Output:** The function should return a structured representation of these changes, clearly categorizing them (added, removed, modified) and including the specific field-level differences for modified items.

3.  **Implement Structured Display in `SimplifiedRepopulateItemSwitcher.tsx`:**
    *   Based on the output of the enhanced `detectChanges` function:
        *   Render an overall heading for the complex item (e.g., "Medical history and current problems list").
        *   **For Added Sub-Items:** Clearly display them under a "NEW" section or with appropriate visual cues, showing all their fields and values.
        *   **For Removed Sub-Items:** Clearly display them under an "OLD" section (or marked as "REMOVED"), showing all their fields and values.
        *   **For Modified Sub-Items:**
            *   Display a sub-heading for the specific sub-item (e.g., the condition name like "Diabetes Mellitus Type 2").
            *   For each field *within this sub-item* that has changed, show a side-by-side "OLD VALUE" and "NEW VALUE".
            *   Fields within the sub-item that haven't changed do not need to be explicitly shown in the diff, or could be shown as "No change".
    *   Ensure each distinct change (or distinct sub-item) has its own set of "Use OLD Value" / "Use NEW Value" checkboxes (or the radio button equivalent we settled on) to allow granular choices. This might require passing more detailed context to the preference handling functions.

4.  **Adapt Preference Handling:**
    *   The `preferOldValues` state in `RepopulateSelectDialog.tsx` and the `onValuePreferenceChange` callback might need to handle more granular `linkId`s if users can select old/new at the sub-item field level (e.g., `medical-history:diabetes:onset-date`). Alternatively, if the choice is per sub-item (e.g., accept all old/new for "Diabetes"), the current `linkId` structure might suffice, but the `SimplifiedRepopulateItemSwitcher` will manage the sub-choices internally.
    *   If choosing "Use OLD Value" for a modified sub-item, ensure all its fields revert to their old state.

5.  **Testing:**
    *   Create new test cases in `RepopulateDialog.test.tsx` specifically for complex/grid items.
    *   Scenarios to test:
        *   Adding a new condition to medical history.
        *   Removing an existing condition.
        *   Changing a date field within one existing condition.
        *   Changing multiple fields in multiple conditions.
        *   No changes to the medical history list.
        *   User selects "OLD" for one modified condition and "NEW" for another.

**Key Considerations During Implementation:**
*   **Identifying Sub-Items:** A reliable way to match sub-items between the old and new lists is needed (e.g., using a unique sub-identifier if available, or by comparing key fields like condition name).
*   **Performance:** For very long lists of sub-items, the comparison logic should be reasonably efficient.
*   **Clarity of UI:** The presentation of changes must be very clear and easy for the user to understand, especially with nested data. 