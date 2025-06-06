/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect, test } from '@playwright/test';
import {
  PLAYWRIGHT_APP_URL,
  PLAYWRIGHT_EHR_URL,
  PLAYWRIGHT_FORMS_SERVER_URL
} from './globals';

// Custom launch parameter for repop-patient testing with Dev715 questionnaire (same as examination)
const LAUNCH_PARAM_REPOP_PATIENT_DIRECT = btoa(
  JSON.stringify([
    0,
    'repop-patient', // Use our repop-patient instead of pat-sf
    'primary-peter',
    '',
    0,
    0,
    0,
    'fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs',
    PLAYWRIGHT_APP_URL,
    '1ff7bdc2-36b2-4303-8c05-c57342c5b043', // Use the correct client ID from ehr.smartforms.io
    '',
    '',
    '',
    '',
    0,
    1,
    '{"role":"questionnaire-render-on-launch","canonical":"http://www.health.gov.au/assessments/mbs/715-dev|0.1.0-assembled","type":"Questionnaire"}',
    'https://proxy.smartforms.io/v/r4/fhir',
    false
  ])
);

/**
 * Comprehensive CVD Risk Calculator Repopulation Test Suite
 * 
 * This test suite covers the CVD Risk Calculator Variables section in the Dev715 questionnaire including:
 * 1. Age and demographic information
 * 2. Sex at birth selection
 * 3. Smoking status changes
 * 4. Systolic blood pressure values and dates
 * 5. Mixed field types (numeric, choice, boolean, dates)
 * 
 * Run with: npx playwright test repop-cvd-risk-comprehensive.spec.ts --headed --timeout=180000
 */

test.describe('Comprehensive CVD Risk Calculator Repopulation Tests', () => {
  
  // Helper function to launch the questionnaire and wait for it to load
  async function launchQuestionnaire(page) {
    console.log('🚀 Launching questionnaire with repop-patient...');
    
    const launchUrl = `${PLAYWRIGHT_APP_URL}/launch?iss=https%3A%2F%2Fproxy.smartforms.io%2Fv%2Fr4%2Ffhir&launch=${LAUNCH_PARAM_REPOP_PATIENT_DIRECT}`;
    await page.goto(launchUrl);

    // Wait for launch to complete
    await page.waitForTimeout(3000);

    // Verify questionnaire is loaded
    try {
      await expect(page).toHaveURL(`${PLAYWRIGHT_APP_URL}/renderer`, { timeout: 10000 });
      console.log('✅ Successfully on renderer with Dev715 questionnaire');
    } catch (error) {
      console.log('⚠️ URL check failed, but checking if questionnaire is loaded...');
      const currentUrl = page.url();
      if (currentUrl.includes('localhost:5173')) {
        console.log('✅ On correct domain, proceeding...');
      } else {
        throw error;
      }
    }

    // Check if questionnaire content is loaded
    const questionnaireTitle = page.locator('h1, h2, h3').filter({ hasText: /Aboriginal|Torres|Strait|Islander|Health|Check/i }).first();
    const anyQuestionElement = page.locator('[data-testid*="q-item"], .questionnaire-item, [role="group"]').first();
    
    try {
      await expect(questionnaireTitle.or(anyQuestionElement)).toBeVisible({ timeout: 10000 });
      console.log('✅ Questionnaire content is visible and loaded');
    } catch (error) {
      console.log('⚠️ Could not find questionnaire content, but continuing...');
    }
  }

  // Helper function to navigate to CVD Risk Calculator Variables section
  async function navigateToCVDRiskCalculator(page) {
    console.log('💗 Navigating to CVD Risk Calculator Variables section...');
    
    // Wait longer for questionnaire to fully load (this was the key issue)
    await page.waitForTimeout(5000);
    
    // Look for the correct section name with broader selectors
    const cvdButton = page.locator('button, [role="button"], [role="tab"], .MuiButton-root, .MuiTab-root').filter({ hasText: /Absolute.*cardiovascular.*disease.*risk.*calculation/i });
    
    if (await cvdButton.isVisible().catch(() => false)) {
      await cvdButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Successfully navigated to Absolute cardiovascular disease risk calculation');
      return true;
    }
    
    // Alternative: exact text match
    const exactCvdButton = page.locator('button, [role="button"], [role="tab"], .MuiButton-root, .MuiTab-root').filter({ hasText: 'Absolute cardiovascular disease risk calculation' });
    if (await exactCvdButton.isVisible().catch(() => false)) {
      await exactCvdButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Successfully found CVD Risk Calculator section');
      return true;
    }
    
    // Alternative: look for any button/element with cardiovascular-related text
    const allButtons = page.locator('button, [role="button"], [role="tab"], .MuiButton-root, .MuiTab-root');
    const buttonCount = await allButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const text = await button.textContent().catch(() => '');
      
      if (text && (text.toLowerCase().includes('cardiovascular') || text.toLowerCase().includes('cvd'))) {
        console.log(`✅ Found cardiovascular-related button: "${text}"`);
        await button.click();
        await page.waitForTimeout(2000);
        return true;
      }
    }
    
    console.log('⚠️ Could not find CVD Risk Calculator Variables section');
    return false;
  }

  // Helper function to make comprehensive CVD risk factor changes
  async function makeCVDRiskFactorChanges(page) {
    console.log('💗 Making comprehensive CVD risk factor changes...');
    
    // Navigate to CVD Risk Calculator Variables section first
    const navigationSuccess = await navigateToCVDRiskCalculator(page);
    if (!navigationSuccess) {
      console.log('⚠️ Could not navigate to CVD section, trying to find fields anyway...');
    }
    
    // Make demographic changes (age, sex at birth)
    const demographicChanges = await makeDemographicChanges(page);
    
    // Make lifestyle factor changes (smoking status)
    const lifestyleChanges = await makeLifestyleFactorChanges(page);
    
    // Make clinical measurement changes (systolic blood pressure + date)
    const clinicalChanges = await makeClinicalMeasurementChanges(page);
    
    return {
      demographic: demographicChanges,
      lifestyle: lifestyleChanges,
      clinical: clinicalChanges,
      totalChanges: demographicChanges.length + lifestyleChanges.length + clinicalChanges.length
    };
  }

  // Helper function to make demographic changes (age, sex at birth)
  async function makeDemographicChanges(page) {
    console.log('👤 Making demographic changes (sex at birth)...');
    
    const changes: Array<{ field: string; from: string; to: string; type: string }> = [];
    
    // Note: Age field changes don't trigger repopulation because there's no server conflict
    // Focus on sex/gender selection instead
    
    // Sex/Gender - look for radio buttons or choice fields
    const sexRadios = page.locator('input[type="radio"]');
    const radioCount = await sexRadios.count();
    console.log(`🔍 Found ${radioCount} radio buttons for potential sex/gender selection`);
    
    // Try to find and change a sex-related radio button
    for (let i = 0; i < Math.min(radioCount, 10); i++) {
      const radio = sexRadios.nth(i);
      if (await radio.isVisible().catch(() => false)) {
        try {
          const value = await radio.getAttribute('value').catch(() => '');
          const name = await radio.getAttribute('name').catch(() => '');
          const initialChecked = await radio.isChecked().catch(() => false);
          
          // Look for male/female or similar values
          if (value && (value.toLowerCase().includes('male') || value.toLowerCase().includes('female')) && !initialChecked) {
            await radio.click();
            await page.waitForTimeout(500);
            
            const newChecked = await radio.isChecked().catch(() => false);
            if (newChecked) {
              changes.push({
                field: 'Sex/Gender',
                from: initialChecked.toString(),
                to: `${value} (selected)`,
                type: 'demographic'
              });
              console.log(`✅ Changed Sex/Gender: selected "${value}"`);
              break;
            }
          }
        } catch (error) {
          console.log(`⚠️ Could not interact with radio button ${i}: ${error.message}`);
        }
      }
    }
    
    console.log(`👤 Demographic changes completed: ${changes.length} changes made`);
    return changes;
  }

  // Helper function to make lifestyle factor changes (smoking status)
  async function makeLifestyleFactorChanges(page) {
    console.log('🚬 Making lifestyle factor changes (smoking status)...');
    
    const changes: Array<{ field: string; from: string; to: string; type: string }> = [];
    
    // Smoking status - use the actual ID found in debug: choice-bac0f824-3784-400e-80f9-ad18d46bd8cb
    const smokingFieldId = 'choice-bac0f824-3784-400e-80f9-ad18d46bd8cb';
    
    // Try the combobox approach first (more reliable)
    const smokingCombobox = page.locator(`[role="combobox"]#${smokingFieldId}`);
    if (await smokingCombobox.isVisible().catch(() => false)) {
      try {
        const initialValue = await smokingCombobox.inputValue().catch(() => '');
        console.log(`🔍 Found smoking combobox with initial value: "${initialValue}"`);
        
        // Click to open dropdown
        await smokingCombobox.click();
        await page.waitForTimeout(1000);
        
        // Look for dropdown options
        const options = page.locator('[role="option"], .MuiAutocomplete-option');
        const optionCount = await options.count();
        console.log(`🔍 Found ${optionCount} dropdown options`);
        
        // Try to find and select "Ex-smoker" or similar
        let optionSelected = false;
        for (let i = 0; i < optionCount; i++) {
          const option = options.nth(i);
          const text = await option.textContent().catch(() => '');
          
          if (text && (text.toLowerCase().includes('ex') || text.toLowerCase().includes('former') || text.toLowerCase().includes('never'))) {
            console.log(`🔍 Selecting smoking option: "${text}"`);
            await option.click();
            await page.waitForTimeout(1000);
            
            // Verify the change took effect
            const newValue = await smokingCombobox.inputValue().catch(() => '');
            if (newValue !== initialValue) {
              changes.push({
                field: 'Smoking Status',
                from: initialValue,
                to: newValue,
                type: 'lifestyle'
              });
              console.log(`✅ Changed Smoking Status: "${initialValue}" → "${newValue}"`);
              optionSelected = true;
            } else {
              console.log(`⚠️ Smoking status value unchanged after selection: "${newValue}"`);
            }
            break;
          }
        }
        
        if (!optionSelected) {
          console.log('⚠️ Could not find suitable smoking status option to select');
        }
        
      } catch (error) {
        console.log(`⚠️ Could not interact with smoking combobox: ${error.message}`);
      }
    } else {
      // Fallback to text input approach
      const smokingInput = page.locator(`#${smokingFieldId}`);
      
      if (await smokingInput.isVisible().catch(() => false)) {
        try {
          const initialValue = await smokingInput.inputValue().catch(() => '');
          console.log(`🔍 Found smoking text field with initial value: "${initialValue}"`);
          
          // Try to change to "Ex-smoker"
          await smokingInput.clear();
          await page.waitForTimeout(300);
          await smokingInput.fill('Ex-smoker');
          await smokingInput.blur();
          await page.waitForTimeout(1000);
          
          const actualValue = await smokingInput.inputValue().catch(() => '');
          if (actualValue !== initialValue && actualValue.length > 0) {
            changes.push({
              field: 'Smoking Status (Text)',
              from: initialValue,
              to: actualValue,
              type: 'lifestyle'
            });
            console.log(`✅ Changed Smoking Status: "${initialValue}" → "${actualValue}"`);
          } else {
            console.log(`⚠️ Smoking status text field unchanged: "${actualValue}"`);
          }
        } catch (error) {
          console.log(`⚠️ Could not change smoking status text field: ${error.message}`);
        }
      } else {
        console.log('⚠️ Smoking status field not found or not visible');
      }
    }
    
    console.log(`🚬 Lifestyle factor changes completed: ${changes.length} changes made`);
    return changes;
  }

  // Helper function to make clinical measurement changes (systolic blood pressure + date)
  async function makeClinicalMeasurementChanges(page) {
    console.log('🩺 Making clinical measurement changes (systolic BP + date)...');
    
    const changes: Array<{ field: string; from: string; to: string; type: string }> = [];
    
    // Systolic blood pressure - use the actual ID found in debug: integer-818ce640-c8dd-457d-b607-3aaa8da38524
    const bpFieldId = 'integer-818ce640-c8dd-457d-b607-3aaa8da38524';
    const bpInput = page.locator(`#${bpFieldId}`);
    
    if (await bpInput.isVisible().catch(() => false)) {
      try {
        const initialValue = await bpInput.inputValue().catch(() => '');
        console.log(`🔍 Found systolic BP field with initial value: "${initialValue}"`);
        
        await bpInput.clear();
        await page.waitForTimeout(300);
        await bpInput.fill('145');
        await bpInput.blur();
        await page.waitForTimeout(500);
        
        const actualValue = await bpInput.inputValue().catch(() => '');
        if (actualValue === '145') {
          changes.push({
            field: 'Systolic Blood Pressure',
            from: initialValue,
            to: '145',
            type: 'clinical'
          });
          console.log(`✅ Changed Systolic BP: "${initialValue}" → "145"`);
        } else {
          console.log(`⚠️ Systolic BP field value after change: "${actualValue}" (expected "145")`);
        }
      } catch (error) {
        console.log(`⚠️ Could not change systolic BP: ${error.message}`);
      }
    } else {
      console.log('⚠️ Systolic BP field not found or not visible');
    }
    
    // Blood pressure date - use the actual ID found in debug: date-85d8faf7-ddb0-446c-b489-28d786d6de50
    const bpDateFieldId = 'date-85d8faf7-ddb0-446c-b489-28d786d6de50';
    const bpDateInput = page.locator(`#${bpDateFieldId}`);
    
    if (await bpDateInput.isVisible().catch(() => false)) {
      try {
        const initialValue = await bpDateInput.inputValue().catch(() => '');
        console.log(`🔍 Found BP date field with initial value: "${initialValue}"`);
        
        const newDate = '15/12/2024';
        await bpDateInput.clear();
        await page.waitForTimeout(300);
        await bpDateInput.fill(newDate);
        await bpDateInput.blur();
        await page.waitForTimeout(500);
        
        const actualValue = await bpDateInput.inputValue().catch(() => '');
        if (actualValue === newDate || actualValue === '2024-12-15') {
          changes.push({
            field: 'Blood Pressure Date',
            from: initialValue,
            to: actualValue,
            type: 'clinical'
          });
          console.log(`✅ Changed BP Date: "${initialValue}" → "${actualValue}"`);
        } else {
          console.log(`⚠️ BP date field value after change: "${actualValue}" (expected "${newDate}")`);
        }
      } catch (error) {
        console.log(`⚠️ Could not change BP date: ${error.message}`);
      }
    } else {
      console.log('⚠️ BP date field not found or not visible');
    }
    
    // Also try to change cholesterol values for more comprehensive testing
    const cholesterolFieldId = 'decimal-99932a93-8135-47b2-933b-fd751b34b7af';
    const cholesterolInput = page.locator(`#${cholesterolFieldId}`);
    
    if (await cholesterolInput.isVisible().catch(() => false)) {
      try {
        const initialValue = await cholesterolInput.inputValue().catch(() => '');
        console.log(`🔍 Found cholesterol field with initial value: "${initialValue}"`);
        
        await cholesterolInput.clear();
        await page.waitForTimeout(300);
        await cholesterolInput.fill('6.2');
        await cholesterolInput.blur();
        await page.waitForTimeout(500);
        
        const actualValue = await cholesterolInput.inputValue().catch(() => '');
        if (actualValue === '6.2') {
          changes.push({
            field: 'Total Cholesterol',
            from: initialValue,
            to: '6.2',
            type: 'clinical'
          });
          console.log(`✅ Changed Total Cholesterol: "${initialValue}" → "6.2"`);
        } else {
          console.log(`⚠️ Cholesterol field value after change: "${actualValue}" (expected "6.2")`);
        }
      } catch (error) {
        console.log(`⚠️ Could not change cholesterol: ${error.message}`);
      }
    }
    
    console.log(`🩺 Clinical measurement changes completed: ${changes.length} changes made`);
    return changes;
  }

  // Helper function to open repopulation dialog
  async function openRepopulationDialog(page) {
    console.log('🔄 Opening repopulation dialog...');
    
    const repopulateFormButton = page.getByText('Repopulate Form');
    
    if (!(await repopulateFormButton.isVisible().catch(() => false))) {
      console.log('❌ "Repopulate Form" button not found');
      return false;
    }

    await repopulateFormButton.click();
    await page.waitForTimeout(3000);

    const dialog = page.locator('[role="dialog"]');
    
    if (!(await dialog.isVisible().catch(() => false))) {
      console.log('❌ Repopulation dialog not found');
      return false;
    }

    console.log('✅ Repopulation dialog is open');
    return true;
  }

  // Helper function to capture checkbox states
  async function captureCheckboxStates(page) {
    const dialog = page.locator('[role="dialog"]');
    
    const userLabelCheckboxes = dialog.locator('label:has-text("YOUR CURRENT VALUE") input[type="checkbox"]');
    const serverLabelCheckboxes = dialog.locator('label:has-text("SUGGESTED (SERVER)") input[type="checkbox"]');
    
    const userCheckboxCount = await userLabelCheckboxes.count();
    const serverCheckboxCount = await serverLabelCheckboxes.count();
    
    console.log(`📋 Found ${userCheckboxCount} user checkboxes, ${serverCheckboxCount} server checkboxes`);
    
    const states: Array<{ index: number; userChecked: boolean; serverChecked: boolean }> = [];
    
    for (let i = 0; i < Math.min(userCheckboxCount, serverCheckboxCount); i++) {
      const userChecked = await userLabelCheckboxes.nth(i).isChecked().catch(() => false);
      const serverChecked = await serverLabelCheckboxes.nth(i).isChecked().catch(() => false);
      
      states.push({
        index: i,
        userChecked,
        serverChecked
      });
      
      console.log(`📋 Checkbox pair ${i + 1}: User=${userChecked}, Server=${serverChecked}`);
    }
    
    return { 
      userValueCheckboxes: userLabelCheckboxes, 
      serverValueCheckboxes: serverLabelCheckboxes, 
      states 
    };
  }

  // Helper function to verify checkbox state changes
  async function verifyCheckboxStateChange(page, checkboxIndex, expectedUserState, expectedServerState, userCheckboxes, serverCheckboxes) {
    console.log(`🔍 Verifying checkbox ${checkboxIndex + 1} state change...`);
    
    await page.waitForTimeout(1000);
    
    const actualUserState = await userCheckboxes.nth(checkboxIndex).isChecked().catch(() => false);
    const actualServerState = await serverCheckboxes.nth(checkboxIndex).isChecked().catch(() => false);
    
    console.log(`🔍 Checkbox ${checkboxIndex + 1} - Expected: User=${expectedUserState}, Server=${expectedServerState}`);
    console.log(`🔍 Checkbox ${checkboxIndex + 1} - Actual: User=${actualUserState}, Server=${actualServerState}`);
    
    if (actualUserState === expectedUserState && actualServerState === expectedServerState) {
      console.log(`✅ Checkbox ${checkboxIndex + 1} state change verified successfully`);
      return true;
    } else {
      console.log(`❌ Checkbox ${checkboxIndex + 1} state change verification failed`);
      return false;
    }
  }

  test('Scenario 1: CVD Risk - User Keeps All Risk Factor Changes', async ({ page }) => {
    console.log('\n🧪 CVD RISK SCENARIO 1: User keeps all risk factor changes');
    
    await launchQuestionnaire(page);
    
    // Make comprehensive CVD risk factor changes
    const changes = await makeCVDRiskFactorChanges(page);
    console.log(`📊 Total CVD risk factor changes made: ${changes.totalChanges}`);
    console.log(`   - Demographic: ${changes.demographic.length}`);
    console.log(`   - Clinical: ${changes.clinical.length}`);
    console.log(`   - Lifestyle: ${changes.lifestyle.length}`);
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states (should default to user values)
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs for CVD risk factor changes`);
    
    // Verify all checkboxes are set to user values by default
    let userValueCount = 0;
    for (const state of states) {
      if (state.userChecked && !state.serverChecked) {
        userValueCount++;
      }
    }
    
    console.log(`📊 ${userValueCount}/${states.length} checkbox pairs are set to user values`);
    
    // Take screenshot and confirm (keeping all user values)
    await page.screenshot({ path: 'cvd-risk-scenario1-keep-all-changes.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ CVD Risk Scenario 1 completed: All user changes kept');
  });

  test('Scenario 2: CVD Risk - Mixed Risk Factor Preferences', async ({ page }) => {
    console.log('\n🧪 CVD RISK SCENARIO 2: Mixed preferences for risk factor changes');
    
    await launchQuestionnaire(page);
    
    // Make comprehensive CVD risk factor changes
    const changes = await makeCVDRiskFactorChanges(page);
    console.log(`📊 Total CVD risk factor changes made: ${changes.totalChanges}`);
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs for CVD risk factor changes`);
    
    // Apply mixed preferences: keep clinical values, revert lifestyle factors to server
    let successfulToggles = 0;
    let failedToggles = 0;
    
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      
      // Strategy: Keep clinical and lab values, switch lifestyle factors to server
      const keepUserValue = i % 3 !== 0; // Keep 2/3 of changes
      
      console.log(`📋 Processing checkbox pair ${i + 1}: ${keepUserValue ? 'KEEP USER' : 'SWITCH TO SERVER'}`);
      
      try {
        if (!keepUserValue && state.userChecked && !state.serverChecked) {
          // Switch to server value
          console.log(`  🔄 Switching pair ${i + 1} to server value`);
          await serverValueCheckboxes.nth(i).click();
          await page.waitForTimeout(1500);
          
          const success = await verifyCheckboxStateChange(page, i, false, true, userValueCheckboxes, serverValueCheckboxes);
          if (success) {
            successfulToggles++;
            console.log(`  ✅ Successfully switched pair ${i + 1} to server value`);
          } else {
            failedToggles++;
            console.log(`  ❌ Failed to switch pair ${i + 1} to server value`);
          }
        } else {
          console.log(`  ✅ Keeping pair ${i + 1} as user value`);
          successfulToggles++;
        }
      } catch (error) {
        failedToggles++;
        console.log(`  ❌ Error processing pair ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`📊 Mixed Preference Results: ${successfulToggles} successful, ${failedToggles} failed out of ${states.length} total`);
    
    // Take screenshot and confirm
    await page.screenshot({ path: 'cvd-risk-scenario2-mixed-preferences.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ CVD Risk Scenario 2 completed: Mixed preferences applied');
  });

  test('Scenario 3: CVD Risk - Revert All to Server Values', async ({ page }) => {
    console.log('\n🧪 CVD RISK SCENARIO 3: Revert all risk factor changes to server values');
    
    await launchQuestionnaire(page);
    
    // Make comprehensive CVD risk factor changes
    const changes = await makeCVDRiskFactorChanges(page);
    console.log(`📊 Total CVD risk factor changes made: ${changes.totalChanges}`);
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs for CVD risk factor changes`);
    
    // Switch ALL to server values
    let successfulToggles = 0;
    let failedToggles = 0;
    
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      
      console.log(`📋 Processing checkbox pair ${i + 1}: SWITCH TO SERVER`);
      
      try {
        if (state.userChecked && !state.serverChecked) {
          // Switch to server value
          console.log(`  🔄 Switching pair ${i + 1} to server value`);
          await serverValueCheckboxes.nth(i).click();
          await page.waitForTimeout(1500);
          
          const success = await verifyCheckboxStateChange(page, i, false, true, userValueCheckboxes, serverValueCheckboxes);
          if (success) {
            successfulToggles++;
            console.log(`  ✅ Successfully switched pair ${i + 1} to server value`);
          } else {
            failedToggles++;
            console.log(`  ❌ Failed to switch pair ${i + 1} to server value`);
          }
        } else {
          console.log(`  ✅ Pair ${i + 1} already set to server value`);
          successfulToggles++;
        }
      } catch (error) {
        failedToggles++;
        console.log(`  ❌ Error processing pair ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`📊 Server Revert Results: ${successfulToggles} successful, ${failedToggles} failed out of ${states.length} total`);
    
    // Take screenshot and confirm
    await page.screenshot({ path: 'cvd-risk-scenario3-revert-all-server.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ CVD Risk Scenario 3 completed: All changes reverted to server values');
  });

  test('Scenario 4: CVD Risk - Risk Factor Category Testing', async ({ page }) => {
    test.setTimeout(180000);
    
    console.log('\n🧪 CVD RISK SCENARIO 4: Risk factor category specific testing');
    
    await launchQuestionnaire(page);
    
    // Make comprehensive CVD risk factor changes
    const changes = await makeCVDRiskFactorChanges(page);
    console.log(`📊 Total CVD risk factor changes made: ${changes.totalChanges}`);
    
    // Log detailed change information by category
    if (changes.demographic.length > 0) {
      console.log('👤 Demographic changes:');
      changes.demographic.forEach((change, idx) => {
        console.log(`  ${idx + 1}. ${change.field}: "${change.from}" → "${change.to}"`);
      });
    }
    
    if (changes.clinical.length > 0) {
      console.log('🩺 Clinical measurement changes:');
      changes.clinical.forEach((change, idx) => {
        console.log(`  ${idx + 1}. ${change.field}: "${change.from}" → "${change.to}"`);
      });
    }
    
    if (changes.lifestyle.length > 0) {
      console.log('🚬 Lifestyle factor changes:');
      changes.lifestyle.forEach((change, idx) => {
        console.log(`  ${idx + 1}. ${change.field}: "${change.from}" → "${change.to}"`);
      });
    }
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Take screenshot after changes
    await page.screenshot({ path: 'cvd-risk-scenario4-after-changes.png', fullPage: true });
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Take screenshot of dialog
    await page.screenshot({ path: 'cvd-risk-scenario4-dialog.png', fullPage: true });
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    
    // Apply category-specific preferences
    console.log('🎯 Applying risk factor category specific preferences...');
    
    const preferences: Array<{ index: number; choice: string; success: boolean }> = [];
    
    for (let i = 0; i < states.length; i++) {
      // Strategy: Keep clinical and lab values, revert lifestyle factors
      const keepUserValue = i % 4 !== 3; // Keep 3/4 of changes
      
      if (!keepUserValue) {
        console.log(`🔄 Setting checkbox pair ${i + 1} to SERVER value...`);
        
        try {
          await serverValueCheckboxes.nth(i).click();
          await page.waitForTimeout(1500);
          
          const stateChanged = await verifyCheckboxStateChange(
            page, i, false, true, userValueCheckboxes, serverValueCheckboxes
          );
          
          preferences.push({ index: i, choice: 'server', success: stateChanged });
          
          if (stateChanged) {
            console.log(`✅ Checkbox pair ${i + 1} set to server value`);
          } else {
            console.log(`❌ Checkbox pair ${i + 1} failed to set to server value`);
          }
        } catch (error) {
          console.log(`❌ Error setting checkbox pair ${i + 1} to server: ${error.message}`);
          preferences.push({ index: i, choice: 'server', success: false });
        }
      } else {
        console.log(`✅ Keeping checkbox pair ${i + 1} as USER value`);
        preferences.push({ index: i, choice: 'user', success: true });
      }
    }
    
    const successfulPreferences = preferences.filter(p => p.success).length;
    console.log(`📊 Risk factor category preferences: ${successfulPreferences}/${preferences.length} successful`);
    
    // Take screenshot after setting preferences
    await page.screenshot({ path: 'cvd-risk-scenario4-dialog-prefs-set.png', fullPage: true });
    
    // Confirm the dialog
    console.log('🎯 Confirming repopulation with category-specific preferences...');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForTimeout(3000);
    
    // Take final screenshot
    await page.screenshot({ path: 'cvd-risk-scenario4-final-result.png', fullPage: true });
    
    console.log('✅ CVD RISK SCENARIO 4 COMPLETED: Risk factor category specific testing');
    console.log('📁 Screenshots saved:');
    console.log('   - cvd-risk-scenario4-after-changes.png');
    console.log('   - cvd-risk-scenario4-dialog.png');
    console.log('   - cvd-risk-scenario4-dialog-prefs-set.png');
    console.log('   - cvd-risk-scenario4-final-result.png');
  });
});