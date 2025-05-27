# Test Cases for Re-population Dialog

## General Testing Setup

1.  **Identify/Create Test Questionnaires on `dev715`:**
    *   [ ] Select existing questionnaires covering diverse FHIR item types.
    *   [ ] Create/modify questionnaires for full coverage if needed (especially `gtable`, `grid`).
2.  **Prepare QuestionnaireResponse (QR) Data:**
    *   **Scenario 1: Populating an Empty Form**
        *   [ ] "Old" QR: Empty or minimally filled.
        *   [ ] "New" QR (Server Suggestion): Pre-filled data.
    *   **Scenario 2: Overwriting/Merging with an Existing Form**
        *   [ ] "Old" QR (User's Current Form): Partially/fully filled by user.
        *   [ ] "New" QR (Server Suggestion): Different values, some new items, some missing items compared to "Old" QR.
3.  **Trigger Re-population:**
    *   [ ] Successfully trigger the dialog with test `Questionnaire` and prepared "Old"/"New" QR data.

## Verification Steps (For each scenario below)

*   **Display:**
    *   [ ] Correct item `text` (label) is shown.
    *   [ ] "Your Current Value" string is accurate.
    *   [ ] "Suggested (Server)" string is accurate.
    *   [ ] "No change", "No value", "Not set" messages appear appropriately.
    *   [ ] For `gtable`/`grid`, changes are correctly attributed to specific rows/columns/fields.
*   **Preference Selection:**
    *   [ ] Checkboxes for "Your Current Value" and "Suggested (Server)" work.
    *   [ ] UI highlights the selected option.
    *   [ ] `onValuePreferenceChange` callback receives correct `linkId` and preference.
*   **Confirmation:**
    *   [ ] Main form is updated with values based on user's selections after "Confirm".

---

## Test Scenarios by FHIR Item Type / Feature

### 1. Simple Data Types (`string` / `text` / `url`)

*   **Base Cases:**
    *   [ ] Old value present, new value different.
    *   [ ] Old value present, new value same (shows "No change" or equivalent).
    *   [ ] Old value present, new value absent.
    *   [ ] Old value absent, new value present.
    *   [ ] Both absent (shows "No value" or equivalent for both).
*   **Edge Cases:**
    *   [ ] Very long strings.
    *   [ ] Strings with special characters (e.g., `&`, `<`, `>`, `"`).

### 2. Numeric Data Types (`integer` / `decimal`)

*   **Base Cases:**
    *   [ ] Old value present, new value different.
    *   [ ] Old value present, new value same.
    *   [ ] Old value present, new value absent.
    *   [ ] Old value absent, new value present.
*   **Specific Values:**
    *   [ ] Zero values.
    *   [ ] Positive values.
    *   [ ] Negative values.

### 3. Boolean Data Type (`boolean`)

*   [ ] Old: true, New: false
*   [ ] Old: false, New: true
*   [ ] Old: true, New: true (shows "No change")
*   [ ] Old: true, New: absent
*   [ ] Old: absent, New: false
*   [ ] Both absent.

### 4. Display Item Type (`display`)

*   [ ] Item appears in list (if it has `qItem.text`).
*   [ ] Shows no answer / "No data" for comparison as expected.
*   [ ] Correctly skipped by `SimplifiedRepopulateItemSwitcher` if it has no text/answers to compare.

### 5. Date/Time Data Types (`date` / `dateTime` / `time`)

*   **Base Cases:**
    *   [ ] Old value present, new value different.
    *   [ ] Old value present, new value same.
    *   [ ] Old value present, new value absent.
    *   [ ] Old value absent, new value present.
*   **Formatting:**
    *   [ ] `getAnswerValueAsString` provides clear, unambiguous format.
    *   [ ] `dateTime` includes timezone information if applicable and significant.

### 6. Choice Data Types

*   **`choice` (Dropdown, Radio Button):**
    *   [ ] Old selection different from new.
    *   [ ] Old selection same as new.
    *   [ ] Old selection present, new absent.
    *   [ ] Old selection absent, new present.
    *   [ ] `getAnswerValueAsString` shows the *display value* of the choice.
*   **`open-choice` (Dropdown/Radio + Text Input):**
    *   [ ] Selected choice different (open-text same or absent).
    *   [ ] Selected choice same, open-choice text different.
    *   [ ] Selected choice different, open-choice text different.
    *   [ ] Old: choice selected; New: open-text entered (no choice).
    *   [ ] Old: open-text entered; New: choice selected.
    *   [ ] `getAnswerValueAsString` clearly shows both selected option (if any) and free text.

### 7. Quantity Data Type (`quantity`)

*   [ ] Different values, same unit.
*   [ ] Same value, different units.
*   [ ] Different values, different units.
*   [ ] Old value present, new absent (and vice-versa).
*   [ ] `getAnswerValueAsString` displays both value and unit clearly.

### 8. Attachment Data Type (`attachment`)

*   [ ] Old attachment present, new different (e.g., different filename/URL if that's what `getAnswerValueAsString` outputs).
*   [ ] Old present, new absent.
*   [ ] Old absent, new present.
*   [ ] Verify `getAnswerValueAsString` output is meaningful (e.g., filename, placeholder).

### 9. Repeating Items (Non-Group, e.g., `item.repeats = true`)

*   [ ] Different number of repetitions (e.g., Old: 2 answers, New: 3 answers).
*   [ ] Same number of repetitions, but some values different.
*   [ ] Values are joined clearly (e.g., by comma) by `extractFormattedValues` for display.
*   [ ] Old has multiple answers, New has one (and vice-versa).
*   [ ] Old has multiple answers, New has none (and vice-versa).

### 10. Groups - Non-Repeating (`grid` logic)
*(QuestionnaireItem `type = 'group'`, `repeats = false`)*

*   **Sub-item Changes:**
    *   [ ] One sub-item changed.
    *   [ ] Multiple sub-items changed.
    *   [ ] All sub-items changed.
    *   [ ] No sub-items changed (shows "No changes in grid").
    *   [ ] Sub-item present in old, absent in new (and vice-versa within the group structure).
*   **Functionality:**
    *   [ ] Individual field preferences within the grid can be set.

### 11. Groups - Repeating (`gtable` logic)
*(QuestionnaireItem `type = 'group'`, `repeats = true`, `itemControl = 'gtable'`)*

*   **Row Status Detection (`detectGTableChanges`):**
    *   [ ] **`'added'` Row:** Exists in "Your Current Value", not in "Suggested (Server)".
    *   [ ] **`'removed'` Row:** Exists in "Suggested (Server)", not in "Your Current Value".
    *   [ ] **`'modified'` Row:** Exists in both, one or more cell values differ.
*   **Scenarios:**
    *   [ ] User added a new row (not present in server suggestion).
    *   [ ] Server suggests a new row (not present in user's current form).
    *   [ ] User modified a cell in an existing row.
    *   [ ] Server suggests a different value for a cell in an existing row.
    *   [ ] User deleted a row that server still suggests.
    *   [ ] Server does not suggest a row that user currently has.
    *   [ ] Completely different sets of rows between old and new.
    *   [ ] Table goes from empty to populated.
    *   [ ] Table goes from populated to empty.
    *   [ ] No changes in any row or cell (shows "No changes in table").
*   **Functionality:**
    *   [ ] Row title/identifier is clear and helpful.
    *   [ ] Individual field preferences within each changed row can be set.
    *   [ ] Test with `gtable` where first column might not be a good unique identifier or might be empty.

### 12. General / Edge Cases

*   **Item Hidden by `enableWhen`:**
    *   [ ] Item correctly hidden/skipped in re-population dialog if `useHidden` evaluates to true.
*   **Read-Only Items in Questionnaire:**
    *   [ ] Ensure `qItemToRepopulate = { ...qItem, readOnly: true }` in `RepopulateListItem` doesn't negatively affect display or logic in switcher.
*   **Items with No `qItem.text`:**
    *   [ ] `linkId` is used as display text and is acceptable.
*   **Initial Preference State in Switcher:**
    *   [ ] Checkboxes initialize correctly when `initialUserFormPreference` is `true`.
    *   [ ] Checkboxes initialize correctly when `initialUserFormPreference` is `false`.
    *   [ ] Checkboxes initialize correctly when `initialUserFormPreference` is `undefined` (should default to user's current value).
*   **Dialog Flow & State:**
    *   [ ] `RepopulateSelectDialog` correctly tracks `userPrefersTheirCurrentFormValue` based on switcher interactions.
    *   [ ] `handleConfirmRepopulate` uses the preference map correctly to build `itemsToActuallyRepopulate`.
    *   [ ] Spinner and snackbar messages appear correctly during/after repopulation.
*   **Empty `itemsToRepopulate`:**
    *   [ ] Dialog handles scenario where `itemsToRepopulate` is initially empty or becomes empty after user de-selects all.
    *   [ ] "No items were selected for re-population" message appears if confirmed with no changes selected.
*   **Multiple Sections/Headings in Dialog:**
    *   [ ] If `itemsToRepopulateTuplesByHeadings` has multiple headings, they are displayed correctly.
    *   [ ] Dividers appear correctly between sections.

---
*Remember to use browser developer tools to inspect props and console logs during testing.* 