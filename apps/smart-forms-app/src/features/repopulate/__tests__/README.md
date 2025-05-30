# Comprehensive Repopulate Tests

This directory contains comprehensive tests for the repopulate functionality using **Vitest**, a modern testing framework.

## What is Vitest?

**Vitest** is a fast, modern testing framework that provides:
- ⚡ **Fast execution** with Vite's transformation pipeline
- 🔧 **Jest-compatible API** for easy migration
- 📦 **Built-in TypeScript support**
- 🎯 **Modern developer experience** with hot reload
- 🧪 **Comprehensive testing** capabilities

## Test Files

### `RepopulateComprehensive.test.tsx`
A comprehensive test suite covering all repopulate scenarios using the "repop-tester" patient data that was successfully created in the FHIR server.

**Test Coverage:**
1. **Simple Data Types** (string/text/url)
2. **Numeric Data Types** (decimal/integer)
3. **Boolean Data Type**
4. **Date/DateTime Data Types**
5. **Choice Data Types** (dropdown/radio selections)
6. **Quantity Data Type** (values with units)
7. **Repeating Items** (multiple answers)
8. **Group Items** (medical history tables)
9. **Mixed Preferences** (some old, some new values)
10. **Edge Cases** (empty data, no selections, dialog close)
11. **Integration Tests** (real patient data structure)

**Patient Data Used:**
- **Patient:** Clever Form (repop-tester)
- **1 Encounter:** health check
- **9 Observations:** BMI, weight, height, waist, BP, heart rate, smoking
- **12 Conditions:** CKD stage 3B, diabetes, hypertension, remittent fever, etc.
- **10 AllergyIntolerances:** bee venom, penicillin, aspirin, etc.
- **3 Immunizations:** 2 COVID vaccines, 1 DTP vaccine

## Running the Tests

### Prerequisites
Make sure you're in the smart-forms-app directory:
```bash
cd apps/smart-forms-app
```

### Run All Repopulate Tests
```bash
npm run test repopulate
```

### Run Specific Test File
```bash
npm run test RepopulateComprehensive.test.tsx
```

### Run Tests in Watch Mode
```bash
npm run test:watch repopulate
```

### Run Tests with Coverage
```bash
npm run test:coverage repopulate
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:ui
```

## Test Structure

Each test follows this pattern:

```typescript
describe('Test Category', () => {
  it('should handle specific scenario', async () => {
    // 1. Setup mock data
    const mockData = { /* ... */ };
    
    // 2. Render component
    renderDialog(mockData);
    
    // 3. Interact with UI
    fireEvent.click(checkbox);
    fireEvent.click(radioButton);
    
    // 4. Trigger action
    fireEvent.click(confirmButton);
    
    // 5. Assert results
    await waitFor(() => {
      expect(mockedFunction).toHaveBeenCalled();
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Key Testing Scenarios

### 1. Value Preference Selection
Tests that users can choose between:
- **OLD VALUE** (user's current form data)
- **NEW VALUE** (server suggestion)

### 2. Mixed Preferences
Tests scenarios where users select different preferences for different fields within the same form.

### 3. Data Type Handling
Ensures all FHIR data types are properly displayed and processed:
- String values show correctly
- Numeric values (decimal/integer) are handled
- Boolean values display appropriately
- Date values are formatted correctly
- Choice values show display text (not codes)
- Quantity values include units
- Repeating items show all values

### 4. Edge Cases
- Empty itemsToRepopulate
- No selections made before confirm
- Dialog close without confirmation
- Real patient data structure integration

## Debugging Tests

### View Test Output
```bash
npm run test repopulate -- --reporter=verbose
```

### Debug Specific Test
```bash
npm run test RepopulateComprehensive.test.tsx -- --reporter=verbose
```

### Check Test Coverage
```bash
npm run test:coverage
```

## Integration with repop-tester Patient

These tests are designed to work with the actual patient data created in the FHIR server:
- **Patient ID:** repop-tester
- **Patient Name:** Clever Form
- **FHIR Server:** https://proxy.smartforms.io/fhir

The test data mirrors the real FHIR resources to ensure comprehensive testing of the repopulate functionality.

## Mocking Strategy

The tests use Vitest's mocking capabilities:

```typescript
// Mock the repopulateResponse function
vi.mock('@aehrc/smart-forms-renderer', () => ({
  repopulateResponse: vi.fn()
}));
```

This allows us to:
- Test UI interactions without actual FHIR calls
- Verify correct data is passed to the repopulate function
- Test error scenarios safely
- Run tests quickly and reliably

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use descriptive test names
3. Include both positive and negative test cases
4. Test edge cases and error scenarios
5. Use the mock data patterns established
6. Ensure tests are isolated and don't depend on each other 