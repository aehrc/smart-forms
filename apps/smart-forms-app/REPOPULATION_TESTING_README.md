# SMART Forms Repopulation Testing Guide

## Overview

This document provides comprehensive instructions for running the SMART Forms repopulation tests. These tests verify that the repopulation dialog functionality works correctly across different form sections and user interaction scenarios.

## Test Coverage

The repopulation tests cover three major form sections:

1. **Medical History & Current Problems** - Complex multi-row medication and condition management
2. **Examination** - Vital signs, measurements, and clinical observations  
3. **CVD Risk Calculator** - Risk factor variables and calculations

## Prerequisites

- Node.js and npm installed
- Playwright browsers installed (`npx playwright install`)
- SMART Forms application running locally
- Test patient data loaded (repop-patient)

## Quick Start

### Run All Tests at Once
```bash
npm run test:repop-all-forms
```
*Runs all three form sections (Medical History, Examination, CVD Risk Calculator) - approximately 10 minutes*

## Individual Test Commands

### Medical History Tests
```bash
# Run all medical history scenarios
npm run test:repop-scenarios

# Run with specific browser
npm run test:repop-scenarios-chromium

# Debug mode
npx playwright test repop-comprehensive-scenarios.spec.ts --debug
```

### Examination Tests
```bash
# Run all examination scenarios
npm run test:repop-examination

# Run with specific browser  
npm run test:repop-examination:chromium

# Debug mode
npm run test:repop-examination:debug
```

### CVD Risk Calculator Tests
```bash
# Run all CVD risk scenarios
npm run test:repop-cvd

# Run with specific browser
npm run test:repop-cvd:chromium

# Debug mode
npm run test:repop-cvd:debug
```

## Test Scenarios

### Medical History (5 scenarios)
1. **Scenario 1**: User keeps all changes - All checkboxes remain on user values
2. **Scenario 2**: Mixed preferences - Some user values, some server values
3. **Scenario 3**: Complex multi-row - Tests medication and condition rows
4. **Scenario 4**: Field-type specific - Tests different field types separately
5. **Scenario 5**: All server/user values - Comprehensive preference testing

### Examination (4 scenarios)
1. **Scenario 1**: User keeps all changes (17 total changes)
   - 5 vital signs changes (BP, heart rate, dates)
   - 7 measurement changes (height, weight, BMI, waist circumference)
   - 5 clinical observation changes (notes, dates, radio buttons)

2. **Scenario 2**: Mixed preferences (11 checkbox pairs)
3. **Scenario 3**: Revert all to server values
4. **Scenario 4**: Field-type specific testing

### CVD Risk Calculator (4 scenarios)
1. **Scenario 1**: User keeps all changes (4 risk factor changes)
   - Smoking status changes
   - Systolic blood pressure and date changes
   - Cholesterol value changes

2. **Scenario 2**: Mixed preferences (3 checkbox pairs)
3. **Scenario 3**: Revert all to server values  
4. **Scenario 4**: Risk factor category testing

## Expected Results

### Successful Test Run
- ✅ All scenarios pass without errors
- ✅ Screenshots generated for key interaction points
- ✅ Checkbox interactions work correctly
- ✅ Form values update according to user preferences
- ✅ Total runtime: ~10 minutes for all tests

### Key Metrics
- **Medical History**: ~11 checkbox pairs per scenario
- **Examination**: ~11 checkbox pairs per scenario (17 total changes)
- **CVD Risk Calculator**: ~3 checkbox pairs per scenario (4 total changes)

## Screenshots

Tests automatically generate screenshots at key points:
- `*-after-changes.png` - Form state after making changes
- `*-dialog.png` - Repopulation dialog initial state
- `*-dialog-prefs-set.png` - Dialog after setting preferences
- `*-final-result.png` - Final form state after repopulation

Screenshots are saved in the `apps/smart-forms-app/` directory.

## Troubleshooting

### Common Issues

1. **Tests fail to find fields**
   - Ensure the questionnaire is fully loaded
   - Check that the correct patient data is loaded
   - Verify navigation to the correct form section

2. **Checkbox interactions fail**
   - Repopulation dialog may not be fully rendered
   - Check for timing issues with `waitFor` conditions
   - Verify checkbox selectors are correct

3. **Navigation issues**
   - Ensure form sections are accessible
   - Check for any form validation errors
   - Verify patient data includes required fields

### Debug Mode

Use debug mode to step through tests interactively:
```bash
npm run test:repop-examination:debug
npm run test:repop-cvd:debug
npx playwright test repop-comprehensive-scenarios.spec.ts --debug
```

### Headed Mode

Run tests with visible browser for debugging:
```bash
npx playwright test repop-comprehensive-scenarios.spec.ts --headed
```

### Specific Test Selection

Run individual test scenarios:
```bash
# Run only scenario 1 of medical history
npx playwright test repop-comprehensive-scenarios.spec.ts -g "Scenario 1"

# Run only examination tests
npx playwright test repop-examination-comprehensive.spec.ts

# Run only CVD risk tests  
npx playwright test repop-cvd-risk-comprehensive.spec.ts
```

## Test Configuration

### Timeouts
- Default timeout: 180 seconds (3 minutes) per test
- Total suite timeout: ~10 minutes for all tests
- Individual action timeout: 30 seconds

### Browser Configuration
- Default: Chromium (fastest, most reliable)
- Available: Firefox, WebKit (commented out in config)
- Cross-browser testing: `npm run playwright:cross-browser`

## File Structure

```
apps/smart-forms-app/
├── e2e/
│   ├── repop-comprehensive-scenarios.spec.ts    # Medical History tests
│   ├── repop-examination-comprehensive.spec.ts  # Examination tests
│   ├── repop-cvd-risk-comprehensive.spec.ts    # CVD Risk tests
│   └── debug-*.spec.ts                         # Debug utilities
├── package.json                                # Test scripts
├── playwright.config.ts                       # Playwright configuration
└── *.png                                      # Generated screenshots
```

## Performance Notes

- **Medical History**: Most complex, ~3-4 minutes
- **Examination**: Moderate complexity, ~2-3 minutes  
- **CVD Risk Calculator**: Simplest, ~1-2 minutes
- **Total Runtime**: ~9-10 minutes for all tests

## Known Limitations

### CVD Risk Calculator
- Age and Smoking Status fields use `calculatedExpression` instead of `initialExpression`
- These fields don't appear in repopulation dialog (by design)
- Only Systolic BP, BP Date, and Cholesterol appear in dialog
- This is expected behavior based on questionnaire configuration

## Success Criteria

A successful test run should show:
- ✅ All 13 test scenarios pass
- ✅ No timeout errors
- ✅ Screenshots generated successfully
- ✅ Checkbox interactions work correctly
- ✅ Form values update according to preferences
- ✅ No console errors or warnings

## Commit Readiness Checklist

Before committing, ensure:
- [ ] All tests pass: `npm run test:repop-all-forms`
- [ ] Screenshots are clean and organized
- [ ] No debug files or temporary test files remain
- [ ] Test configuration is optimized for CI/CD
- [ ] Documentation is up to date

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Run tests in debug mode to investigate
3. Review generated screenshots for visual confirmation
4. Check Playwright test reports: `npx playwright show-report`

---

*Last updated: December 2024*
*Test suite version: 1.0*
*Compatible with: SMART Forms Renderer v2.x* 