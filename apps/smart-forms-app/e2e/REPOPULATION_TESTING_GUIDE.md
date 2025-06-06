# Comprehensive Repopulation Testing Guide

## Overview

This guide covers the comprehensive testing suite for repopulation functionality with initial expressions in the SMART Forms application. The tests verify that users can properly choose between their current form values and server-suggested values for every field with initial expressions.

## Test Files

### 1. `repop-comprehensive-initial-expressions.spec.ts`
**Purpose**: Comprehensive testing of all repopulation dialog scenarios for fields with initial expressions.

**Key Features**:
- Tests all 8 critical scenarios for repopulation behavior
- Verifies checkbox functionality ("YOUR CURRENT VALUE" vs "SUGGESTED (SERVER)")
- Tests value preservation and changes based on user selection
- Covers all field types: string, decimal, integer, boolean, choice, date
- Tests complex fields like medical history tables with granular preferences
- Performance and edge case testing

## Test Scenarios

### Scenario 1: Default Behavior - Keep User Values
**What it tests**: 
- Default state has "YOUR CURRENT VALUE" checked for all fields
- "SUGGESTED (SERVER)" is unchecked by default
- Confirming without changes preserves user values

**Expected behavior**:
- User values remain unchanged after repopulation
- Form fields retain the values the user entered

### Scenario 2: Select Server Values
**What it tests**:
- Selecting "SUGGESTED (SERVER)" for all fields
- Values change to server-suggested values after confirmation

**Expected behavior**:
- All field values change to server-suggested values
- User can observe the value changes in the form

### Scenario 3: Mixed Preferences
**What it tests**:
- Some fields use server values, some use user values
- Granular control over individual field preferences

**Expected behavior**:
- Fields with server selection show server values
- Fields with user selection retain user values
- Mixed behavior is correctly applied

### Scenario 4: Toggle Behavior
**What it tests**:
- Switching between user and server values within the dialog
- Mutual exclusivity of checkboxes
- Cancel functionality

**Expected behavior**:
- Only one checkbox can be selected per field
- Toggling works correctly
- Cancel preserves original state

### Scenario 5: Complex Fields - Medical History Table
**What it tests**:
- Granular preferences for complex repeating groups
- Individual field control within table rows

**Expected behavior**:
- Each field in complex structures can be controlled independently
- Granular preferences are applied correctly

### Scenario 6: All Field Types Coverage
**What it tests**:
- String fields (names, text)
- Decimal fields (height, weight, BMI)
- Integer fields (age, counts)
- Date fields (onset dates, recorded dates)
- Choice fields (status, severity)
- Boolean fields (smoker, diabetes)

**Expected behavior**:
- All field types are handled correctly
- Type-specific behavior is preserved

### Scenario 7: Edge Cases
**What it tests**:
- Empty values
- Null values
- Special cases and error conditions

**Expected behavior**:
- Edge cases don't break the dialog
- Checkboxes work even with empty values

### Scenario 8: Performance and Responsiveness
**What it tests**:
- Large number of fields
- Rapid checkbox toggling
- Confirmation performance

**Expected behavior**:
- Responsive interaction with many fields
- Reasonable performance for large forms

## Running the Tests

### Prerequisites
1. Ensure the `repop-patient` exists on the FHIR server with comprehensive test data
2. The Dev715 questionnaire should be available
3. Playwright should be installed and configured

### Command Line Options

#### Run all comprehensive repopulation tests:
```bash
npm run playwright:repop-comprehensive
```

#### Run with UI mode (visual debugging):
```bash
npm run playwright:repop-comprehensive:ui
```

#### Run with debug mode (step-by-step):
```bash
npm run playwright:repop-comprehensive:debug
```

#### Run specific scenario:
```bash
npx playwright test repop-comprehensive-initial-expressions.spec.ts -g "Scenario 1"
```

#### Run with headed browser (visible):
```bash
npx playwright test repop-comprehensive-initial-expressions.spec.ts --headed
```

### Test Data Requirements

The tests require a patient with ID `repop-patient` that has:

1. **Medical History Conditions**:
   - Chronic kidney disease stage 3B
   - Type 2 diabetes mellitus
   - Essential hypertension
   - Remittent fever
   - Various clinical statuses and onset dates

2. **Examination Data**:
   - Height measurements
   - Weight measurements
   - BMI calculations
   - Vital signs (blood pressure, heart rate)

3. **CVD Risk Factors**:
   - Systolic blood pressure values
   - Cholesterol levels
   - Diabetes status
   - Smoking status

## Expected Test Results

### Success Criteria
- ✅ All 8 scenarios pass
- ✅ Default behavior preserves user values
- ✅ Server selection changes values appropriately
- ✅ Mixed preferences work correctly
- ✅ Toggle behavior is mutually exclusive
- ✅ Complex fields support granular preferences
- ✅ All field types are covered
- ✅ Edge cases are handled gracefully
- ✅ Performance is acceptable

### Screenshots Generated
The tests automatically generate screenshots for debugging:
- `repopulation-dialog-default-keep-user-values.png`
- `repopulation-dialog-select-server-values.png`
- `repopulation-dialog-mixed-preferences.png`
- `repopulation-dialog-toggle-behavior.png`
- `repopulation-dialog-complex-fields.png`
- `repopulation-dialog-all-field-types.png`
- `repopulation-dialog-edge-cases.png`
- `repopulation-dialog-performance.png`

## Troubleshooting

### Common Issues

1. **"Repopulate Form" button not found**
   - Ensure the patient has data that differs from initial expressions
   - Check that the questionnaire has fields with initial expressions
   - Verify the patient data exists on the FHIR server

2. **Dialog not appearing**
   - Check browser console for JavaScript errors
   - Verify the repopulation logic is working
   - Ensure the patient has conflicting data

3. **Checkboxes not working**
   - Check that the dialog is fully loaded
   - Verify the checkbox selectors are correct
   - Look for any UI framework changes

4. **Values not changing**
   - Verify the repopulation logic is correctly implemented
   - Check that the server has different values than user values
   - Ensure the confirmation process is working

### Debug Mode
Use debug mode to step through tests:
```bash
npm run playwright:repop-comprehensive:debug
```

This allows you to:
- See the browser in action
- Pause at each step
- Inspect elements manually
- Verify the dialog state

## Integration with Existing Tests

This comprehensive test suite complements the existing `repop-dev715-focused.spec.ts` test by:

1. **Broader Coverage**: Tests all scenarios, not just basic functionality
2. **Detailed Verification**: Checks actual value changes, not just dialog presence
3. **User Experience Focus**: Verifies the user can observe changes
4. **Edge Case Coverage**: Tests unusual conditions and performance
5. **Field Type Coverage**: Ensures all data types work correctly

## Maintenance

### Updating Tests
When the repopulation dialog UI changes:
1. Update the selectors in the test file
2. Verify the checkbox labels still match
3. Test the new UI behavior
4. Update screenshots if needed

### Adding New Scenarios
To add new test scenarios:
1. Add a new test case in the describe block
2. Follow the existing pattern of helper functions
3. Include appropriate assertions
4. Add documentation to this guide

## Manager Demo Points

When demonstrating to your manager, highlight:

1. **Comprehensive Coverage**: "We test every single field with initial expressions"
2. **User Control**: "Users can choose server values or keep their own for each field"
3. **Visual Verification**: "The tests verify users can see the values change"
4. **Real-world Scenarios**: "We test mixed preferences like users would actually use"
5. **Robustness**: "Edge cases and performance are covered"
6. **Automation**: "All scenarios run automatically with clear pass/fail results"

The tests demonstrate that the repopulation functionality works exactly as intended, giving users full control over which values to accept while maintaining data integrity and user experience quality. 