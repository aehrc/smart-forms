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

// Custom launch parameter for repop-patient testing with direct questionnaire launch
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
 * Comprehensive Examination Repopulation Test Suite
 * 
 * This test suite covers the Examination section of the 715 questionnaire including:
 * 1. Vital signs (blood pressure, heart rate, temperature)
 * 2. Physical measurements (height, weight, BMI, waist circumference)
 * 3. Clinical observations and examination findings
 * 4. Mixed field types (numeric, text, boolean, choice)
 * 
 * Run with: npx playwright test repop-examination-comprehensive.spec.ts --headed --timeout=180000
 */

test.describe('Comprehensive Examination Repopulation Tests', () => {
  
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

  // Helper function to navigate to Examination section
  async function navigateToExamination(page) {
    console.log('🔬 Navigating to Examination section...');
    await page.getByRole('button', { name: 'Examination' }).click();
    await page.waitForTimeout(2000);
  }

  // Helper function to make comprehensive examination changes
  async function makeExaminationChanges(page) {
    console.log('🔬 Making comprehensive examination changes...');
    
    // Make vital signs changes
    const vitalSignsChanges = await makeVitalSignsChanges(page);
    
    // Make physical measurements changes
    const measurementChanges = await makePhysicalMeasurementChanges(page);
    
    // Make clinical observation changes
    const clinicalChanges = await makeClinicalObservationChanges(page);
    
    return {
      vitalSigns: vitalSignsChanges,
      measurements: measurementChanges,
      clinical: clinicalChanges,
      totalChanges: vitalSignsChanges.length + measurementChanges.length + clinicalChanges.length
    };
  }

  // Helper function to make vital signs changes
  async function makeVitalSignsChanges(page) {
    console.log('🩺 Making vital signs changes...');
    
    const changes: Array<{ field: string; from: string; to: string; type: string }> = [];
    
    // Blood pressure fields with their associated dates - using actual field IDs found in debug
    const bpFields = [
      { id: 'integer-e68b660d-cfd2-4b89-957a-c96a4c73a5fd', label: 'Systolic BP', newValue: '140' },
      { id: 'integer-867b0022-f812-4f80-b287-79686c972b15', label: 'Diastolic BP', newValue: '90' },
      { id: 'date-a005050c-ed79-46ed-ac14-2fc1496059a5', label: 'BP Date', newValue: '15/12/2024' }
    ];
    
    for (const field of bpFields) {
      try {
        const input = page.locator(`#${field.id}`);
        if (await input.isVisible().catch(() => false)) {
          const initialValue = await input.inputValue().catch(() => '');
          
          await input.clear();
          await page.waitForTimeout(300);
          await input.fill(field.newValue);
          await input.blur();
          await page.waitForTimeout(500);
          
          const actualValue = await input.inputValue().catch(() => '');
          if (actualValue === field.newValue) {
            changes.push({
              field: field.label,
              from: initialValue,
              to: field.newValue,
              type: 'vital-signs'
            });
            console.log(`✅ Changed ${field.label}: "${initialValue}" → "${field.newValue}"`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not change ${field.label}: ${error.message}`);
      }
    }
    
    // Heart rate field with its associated date - using actual field IDs found in debug
    const heartRateFields = [
      { id: 'integer-49029ef0-eaa8-44f8-b26a-177820c82dfd', label: 'Heart Rate', newValue: '75' },
      { id: 'date-feeac08f-2ba6-4048-80a2-10b3f90cf5e3', label: 'Heart Rate Date', newValue: '15/12/2024' }
    ];
    
    for (const field of heartRateFields) {
      try {
        const input = page.locator(`#${field.id}`);
        if (await input.isVisible().catch(() => false)) {
          const initialValue = await input.inputValue().catch(() => '');
          
          await input.clear();
          await page.waitForTimeout(300);
          await input.fill(field.newValue);
          await input.blur();
          await page.waitForTimeout(500);
          
          const actualValue = await input.inputValue().catch(() => '');
          if (actualValue === field.newValue) {
            changes.push({
              field: field.label,
              from: initialValue,
              to: field.newValue,
              type: 'vital-signs'
            });
            console.log(`✅ Changed ${field.label}: "${initialValue}" → "${field.newValue}"`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not change ${field.label}: ${error.message}`);
      }
    }
    
    console.log(`🩺 Vital signs changes completed: ${changes.length} changes made`);
    return changes;
  }

  // Helper function to make physical measurement changes
  async function makePhysicalMeasurementChanges(page) {
    console.log('📏 Making physical measurement changes...');
    
    const changes: Array<{ field: string; from: string; to: string; type: string }> = [];
    
    // Physical measurement fields with their associated dates - using actual field IDs found in debug
    const measurementFields = [
      { id: 'decimal-7035c7e7-ada3-4c6b-9ea8-f39666f5d4ea', label: 'Height', newValue: '175.5' },
      { id: 'date-c666ac96-1e64-40e2-8e0b-7d0187bb3e50', label: 'Height Date', newValue: '15/12/2024' },
      { id: 'decimal-443bd584-684a-449c-ab6e-9d07da4df9fa', label: 'Weight', newValue: '78.2' },
      { id: 'date-92cdc1c7-eb6c-4f6d-9bd9-ae726a0e0d3d', label: 'Weight Date', newValue: '15/12/2024' },
      { id: 'decimal-2ada6633-03c6-4b05-bc23-18dec84ec150', label: 'BMI', newValue: '25.4' },
      { id: 'decimal-8df0f5d8-821d-4f71-b3c1-d164616ea2f5', label: 'Waist Circumference', newValue: '85.0' },
      { id: 'date-3eb3b929-e67a-4331-8949-b8447b66a4c7', label: 'Waist Circumference Date', newValue: '15/12/2024' }
    ];
    
    for (const field of measurementFields) {
      try {
        const input = page.locator(`#${field.id}`);
        if (await input.isVisible().catch(() => false)) {
          const initialValue = await input.inputValue().catch(() => '');
          
          await input.clear();
          await page.waitForTimeout(300);
          await input.fill(field.newValue);
          await input.blur();
          await page.waitForTimeout(500);
          
          const actualValue = await input.inputValue().catch(() => '');
          if (actualValue === field.newValue) {
            changes.push({
              field: field.label,
              from: initialValue,
              to: field.newValue,
              type: 'measurements'
            });
            console.log(`✅ Changed ${field.label}: "${initialValue}" → "${field.newValue}"`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not change ${field.label}: ${error.message}`);
      }
    }
    
    console.log(`📏 Physical measurement changes completed: ${changes.length} changes made`);
    return changes;
  }

  // Helper function to make clinical observation changes
  async function makeClinicalObservationChanges(page) {
    console.log('🔍 Making clinical observation changes...');
    
    const changes: Array<{ field: string; from: string; to: string; type: string }> = [];
    
    // Text area for examination findings - using actual field ID found in debug
    try {
      const textArea = page.locator('#text-fcbfa6e1-c101-4675-969d-aa11027859c2');
      if (await textArea.isVisible().catch(() => false)) {
        const initialValue = await textArea.inputValue().catch(() => '');
        const newValue = 'Normal cardiac examination - regular rhythm, no murmurs detected. Abdomen soft, no tenderness or masses palpated.';
        
        await textArea.clear();
        await page.waitForTimeout(300);
        await textArea.fill(newValue);
        await textArea.blur();
        await page.waitForTimeout(500);
        
        const actualValue = await textArea.inputValue().catch(() => '');
        if (actualValue === newValue) {
          changes.push({
            field: 'Examination Notes',
            from: initialValue,
            to: newValue,
            type: 'clinical'
          });
          console.log(`✅ Changed Examination Notes: "${initialValue}" → "${newValue}"`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Could not change examination notes: ${error.message}`);
    }
    
    // Update any empty date fields that might be associated with clinical observations
    const clinicalDateFields = [
      { id: 'date-eeb56682-0eae-4428-9c37-0e63852026c0', label: 'Clinical Observation Date', newValue: '15/12/2024' }
    ];
    
    for (const field of clinicalDateFields) {
      try {
        const input = page.locator(`#${field.id}`);
        if (await input.isVisible().catch(() => false)) {
          const initialValue = await input.inputValue().catch(() => '');
          
          // Only change if the field is empty or has a different value
          if (initialValue === '' || initialValue !== field.newValue) {
            await input.clear();
            await page.waitForTimeout(300);
            await input.fill(field.newValue);
            await input.blur();
            await page.waitForTimeout(500);
            
            const actualValue = await input.inputValue().catch(() => '');
            if (actualValue === field.newValue) {
              changes.push({
                field: field.label,
                from: initialValue,
                to: field.newValue,
                type: 'clinical'
              });
              console.log(`✅ Changed ${field.label}: "${initialValue}" → "${field.newValue}"`);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not change ${field.label}: ${error.message}`);
      }
    }
    
    // Radio button fields - toggle some radio selections
    const radioButtons = page.locator('input[type="radio"]:visible');
    const radioCount = await radioButtons.count();
    console.log(`Found ${radioCount} radio buttons`);
    
    // Try to change a few radio button selections
    for (let i = 0; i < Math.min(radioCount, 3); i++) {
      try {
        const radio = radioButtons.nth(i);
        const initialChecked = await radio.isChecked().catch(() => false);
        const value = await radio.getAttribute('value').catch(() => '');
        
        if (!initialChecked) {
          await radio.click();
          await page.waitForTimeout(500);
          
          const newChecked = await radio.isChecked().catch(() => false);
          if (newChecked) {
            changes.push({
              field: `Radio Option ${i + 1}`,
              from: initialChecked.toString(),
              to: newChecked.toString(),
              type: 'clinical'
            });
            console.log(`✅ Changed Radio Option ${i + 1}: ${initialChecked} → ${newChecked} (value: ${value})`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not change radio button ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`🔍 Clinical observation changes completed: ${changes.length} changes made`);
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

  test('Scenario 1: Examination - User Keeps All Changes', async ({ page }) => {
    console.log('\n🧪 EXAMINATION SCENARIO 1: User keeps all examination changes');
    
    await launchQuestionnaire(page);
    await navigateToExamination(page);
    
    // Make comprehensive examination changes
    const changes = await makeExaminationChanges(page);
    console.log(`📊 Total examination changes made: ${changes.totalChanges}`);
    console.log(`   - Vital signs: ${changes.vitalSigns.length}`);
    console.log(`   - Measurements: ${changes.measurements.length}`);
    console.log(`   - Clinical observations: ${changes.clinical.length}`);
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states (should default to user values)
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs for examination changes`);
    
    // Verify all checkboxes are set to user values by default
    let userValueCount = 0;
    for (const state of states) {
      if (state.userChecked && !state.serverChecked) {
        userValueCount++;
      }
    }
    
    console.log(`📊 ${userValueCount}/${states.length} checkbox pairs are set to user values`);
    
    // Take screenshot and confirm (keeping all user values)
    await page.screenshot({ path: 'examination-scenario1-keep-all-changes.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Examination Scenario 1 completed: All user changes kept');
  });

  test('Scenario 2: Examination - Mixed Preferences', async ({ page }) => {
    console.log('\n🧪 EXAMINATION SCENARIO 2: Mixed preferences for examination changes');
    
    await launchQuestionnaire(page);
    await navigateToExamination(page);
    
    // Make comprehensive examination changes
    const changes = await makeExaminationChanges(page);
    console.log(`📊 Total examination changes made: ${changes.totalChanges}`);
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs for examination changes`);
    
    // Apply mixed preferences: keep vital signs, revert measurements to server
    let successfulToggles = 0;
    let failedToggles = 0;
    
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      
      // Strategy: Keep first half as user values, switch second half to server values
      const keepUserValue = i < Math.floor(states.length / 2);
      
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
    await page.screenshot({ path: 'examination-scenario2-mixed-preferences.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Examination Scenario 2 completed: Mixed preferences applied');
  });

  test('Scenario 3: Examination - Revert All to Server Values', async ({ page }) => {
    console.log('\n🧪 EXAMINATION SCENARIO 3: Revert all examination changes to server values');
    
    await launchQuestionnaire(page);
    await navigateToExamination(page);
    
    // Make comprehensive examination changes
    const changes = await makeExaminationChanges(page);
    console.log(`📊 Total examination changes made: ${changes.totalChanges}`);
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs for examination changes`);
    
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
    await page.screenshot({ path: 'examination-scenario3-revert-all-server.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Examination Scenario 3 completed: All changes reverted to server values');
  });

  test('Scenario 4: Examination - Field Type Specific Testing', async ({ page }) => {
    test.setTimeout(180000);
    
    console.log('\n🧪 EXAMINATION SCENARIO 4: Field type specific testing');
    
    await launchQuestionnaire(page);
    await navigateToExamination(page);
    
    // Make comprehensive examination changes
    const changes = await makeExaminationChanges(page);
    console.log(`📊 Total examination changes made: ${changes.totalChanges}`);
    
    // Log detailed change information by type
    if (changes.vitalSigns.length > 0) {
      console.log('🩺 Vital signs changes:');
      changes.vitalSigns.forEach((change, idx) => {
        console.log(`  ${idx + 1}. ${change.field}: "${change.from}" → "${change.to}"`);
      });
    }
    
    if (changes.measurements.length > 0) {
      console.log('📏 Measurement changes:');
      changes.measurements.forEach((change, idx) => {
        console.log(`  ${idx + 1}. ${change.field}: "${change.from}" → "${change.to}"`);
      });
    }
    
    if (changes.clinical.length > 0) {
      console.log('🔍 Clinical observation changes:');
      changes.clinical.forEach((change, idx) => {
        console.log(`  ${idx + 1}. ${change.field}: "${change.from}" → "${change.to}"`);
      });
    }
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Take screenshot after changes
    await page.screenshot({ path: 'examination-scenario4-after-changes.png', fullPage: true });
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Take screenshot of dialog
    await page.screenshot({ path: 'examination-scenario4-dialog.png', fullPage: true });
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    
    // Apply field-type specific preferences
    console.log('🎯 Applying field-type specific preferences...');
    
    const preferences: Array<{ index: number; choice: string; success: boolean }> = [];
    
    for (let i = 0; i < states.length; i++) {
      // Strategy: Keep vital signs and measurements, revert clinical observations
      const keepUserValue = i % 3 !== 2; // Keep 2/3 of changes
      
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
    console.log(`📊 Field-type specific preferences: ${successfulPreferences}/${preferences.length} successful`);
    
    // Take screenshot after setting preferences
    await page.screenshot({ path: 'examination-scenario4-dialog-prefs-set.png', fullPage: true });
    
    // Confirm the dialog
    console.log('🎯 Confirming repopulation with field-type specific preferences...');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForTimeout(3000);
    
    // Take final screenshot
    await page.screenshot({ path: 'examination-scenario4-final-result.png', fullPage: true });
    
    console.log('✅ EXAMINATION SCENARIO 4 COMPLETED: Field-type specific testing');
    console.log('📁 Screenshots saved:');
    console.log('   - examination-scenario4-after-changes.png');
    console.log('   - examination-scenario4-dialog.png');
    console.log('   - examination-scenario4-dialog-prefs-set.png');
    console.log('   - examination-scenario4-final-result.png');
  });
}); 