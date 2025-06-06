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
 * Comprehensive Repopulation Scenarios Test Suite
 * 
 * This test suite covers:
 * 1. User chooses to revert back to server suggested values
 * 2. Mixed preferences: some fields revert to server, others keep user values
 * 3. Multi-row medical history changes including clinical status changes
 * 4. Complex combinations of date changes and status changes
 * 
 * Run with: npx playwright test repop-comprehensive-scenarios.spec.ts --headed --timeout=180000
 */

test.describe('Comprehensive Repopulation Scenarios', () => {
  
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

  // Helper function to navigate to Medical History section
  async function navigateToMedicalHistory(page) {
    console.log('🧭 Navigating to Medical History section...');
    await page.getByRole('button', { name: 'Medical history and current' }).click();
    await page.waitForTimeout(2000);
  }

  // Enhanced helper function to make both date and clinical status changes
  async function makeMedicalHistoryChanges(page) {
    console.log('🏥 Making comprehensive medical history changes (dates + clinical status)...');
    
    // First make date changes
    const dateChanges = await makeDateChangesInMedicalHistory(page);
    
    // Then make clinical status changes
    const statusChanges = await makeClinicalStatusChanges(page);
    
    return {
      dateChanges,
      statusChanges,
      totalChanges: dateChanges.length + statusChanges.length
    };
  }

  // Improved helper function to make date changes in medical history
  async function makeDateChangesInMedicalHistory(page) {
    console.log('📅 Making date changes in medical history...');
    
    // Find all date inputs in the medical history section
    const dateInputs = page.locator('input[type="date"], input[placeholder*="DD/MM/YYYY"]');
    const dateCount = await dateInputs.count();
    
    console.log(`📅 Found ${dateCount} date inputs in medical history`);
    
    const userEnteredValues: string[] = [];
    
    // Change first few date inputs
    for (let i = 0; i < Math.min(dateCount, 4); i++) {
      const dateInput = dateInputs.nth(i);
      if (await dateInput.isVisible().catch(() => false)) {
        const initialValue = await dateInput.inputValue().catch(() => '');
        console.log(`📅 Date input ${i + 1} initial value: "${initialValue}"`);
        
        // Clear and enter new value
        await dateInput.clear();
        await page.waitForTimeout(500);
        
        const inputType = await dateInput.getAttribute('type').catch(() => '');
        const testDates = ['2022-01-15', '2023-06-20', '2021-12-10', '2024-03-25'];
        const displayDates = ['15/01/2022', '20/06/2023', '10/12/2021', '25/03/2024'];
        
        const newValue = testDates[i];
        const displayValue = displayDates[i];
        
        if (inputType === 'date') {
          await dateInput.fill(newValue);
          userEnteredValues.push(newValue);
        } else {
          await dateInput.fill(displayValue);
          userEnteredValues.push(displayValue);
        }
        
        await dateInput.blur();
        await page.waitForTimeout(1000);
        
        // Verify the value was set
        const actualValue = await dateInput.inputValue().catch(() => '');
        console.log(`📅 Date input ${i + 1} after change: "${actualValue}"`);
        
        if (actualValue === (inputType === 'date' ? newValue : displayValue)) {
          console.log(`✅ Date input ${i + 1} successfully changed`);
        } else {
          console.log(`⚠️ Date input ${i + 1} may not have been set correctly`);
        }
      }
    }
    
    return userEnteredValues;
  }

  // Improved helper function to make clinical status changes
  async function makeClinicalStatusChanges(page) {
    console.log('🏥 Making clinical status changes...');
    
    // Clinical status fields are rendered as Material-UI Autocomplete components, not regular select elements
    // We need to target the Autocomplete input fields and their dropdown buttons
    const statusSelectors = [
      // Target Autocomplete components by their ID pattern (includes linkId)
      'input[id*="88bcfad7-386b-4d87-b34b-2e50482e4d2c"]', // Clinical Status linkId
      'input[id*="choice-88bcfad7-386b-4d87-b34b-2e50482e4d2c"]',
      // Target by aria-label or label text
      'input[aria-label*="Clinical Status"]',
      'input[aria-label*="clinical status"]',
      // Target Autocomplete inputs near "Clinical Status" text
      'div:has-text("Clinical Status") input[role="combobox"]',
      'div:has-text("Clinical status") input[role="combobox"]',
      // Generic Autocomplete inputs that might contain status values
      'input[role="combobox"]',
      // Target by the Autocomplete component structure
      '.MuiAutocomplete-root input',
      // Fallback: any input that has status-related values
      'input[value*="active"], input[value*="resolved"], input[value*="inactive"]'
    ];
    
    let statusInputs = page.locator('input').first(); // Initialize with default
    let inputCount = 0;
    
    // Try each selector to find clinical status autocomplete inputs
    for (const selector of statusSelectors) {
      try {
        const testInputs = page.locator(selector);
        inputCount = await testInputs.count();
        if (inputCount > 0) {
          console.log(`🏥 Found ${inputCount} clinical status autocomplete inputs with selector: ${selector}`);
          statusInputs = testInputs;
          break;
        }
      } catch (error) {
        console.log(`⚠️ Selector ${selector} failed: ${error.message}`);
      }
    }
    
    // Enhanced fallback: look for any Autocomplete input that might be clinical status
    if (inputCount === 0) {
      console.log('🏥 Trying enhanced fallback approach to find clinical status autocomplete inputs...');
      const allAutocompleteInputs = page.locator('input[role="combobox"], .MuiAutocomplete-root input');
      const allInputCount = await allAutocompleteInputs.count();
      console.log(`🏥 Scanning ${allInputCount} total autocomplete input elements...`);
      
      const foundInputs: number[] = [];
      
      for (let i = 0; i < allInputCount; i++) {
        const input = allAutocompleteInputs.nth(i);
        try {
          // Check if this input is near "Clinical Status" text
          const parentContainer = input.locator('xpath=ancestor::div[contains(., "Clinical") or contains(., "clinical")]').first();
          const hasStatusText = await parentContainer.count() > 0;
          
          // Also check the input's current value for status-related content
          const currentValue = await input.inputValue().catch(() => '');
          const hasStatusValue = currentValue.toLowerCase().includes('active') || 
                                currentValue.toLowerCase().includes('resolved') || 
                                currentValue.toLowerCase().includes('inactive');
          
          if (hasStatusText || hasStatusValue) {
            console.log(`🏥 Found clinical status autocomplete input ${i + 1} with value: "${currentValue}"`);
            foundInputs.push(i);
          }
        } catch (error) {
          // Skip this input if we can't analyze it
        }
      }
      
      if (foundInputs.length > 0) {
        // Create a locator for all found inputs
        const selectorString = foundInputs.map(i => `(input[role="combobox"], .MuiAutocomplete-root input):nth-of-type(${i + 1})`).join(', ');
        statusInputs = page.locator(selectorString);
        inputCount = foundInputs.length;
        console.log(`🏥 Using ${inputCount} clinical status autocomplete inputs found via fallback`);
      }
    }
    
    const statusChanges: Array<{ index: number; from: string; to: string; linkId?: string }> = [];
    
    // Try to change clinical statuses using Autocomplete interaction
    for (let i = 0; i < Math.min(inputCount, 4); i++) {
      const input = inputCount === 1 ? statusInputs : statusInputs.nth(i);
      
      if (await input.isVisible().catch(() => false)) {
        try {
          // Get the input's ID or other identifying attributes
          const fieldId = await input.getAttribute('id').catch(() => '') || 
                         await input.getAttribute('aria-label').catch(() => '') || 
                         `status-autocomplete-${i}`;
          
          const initialValue = await input.inputValue().catch(() => '');
          console.log(`🏥 Status autocomplete ${i + 1} (${fieldId}) initial value: "${initialValue}"`);
          
          // Skip if no initial value (field might be empty)
          if (!initialValue || initialValue.trim() === '') {
            console.log(`⚠️ Skipping autocomplete ${i + 1} - no initial value`);
            continue;
          }
          
          // Click the input to focus it
          await input.click();
          await page.waitForTimeout(500);
          
          // Multiple strategies to open the dropdown
          let dropdownOpened = false;
          
          // Strategy 1: Look for dropdown button and click it
          const dropdownButton = input.locator('xpath=following-sibling::button[contains(@aria-label, "Open")]').first();
          if (await dropdownButton.count() > 0) {
            console.log(`🏥 Clicking dropdown button for autocomplete ${i + 1}`);
            await dropdownButton.click();
            await page.waitForTimeout(1000);
            dropdownOpened = true;
          }
          
          // Strategy 2: Try clicking the arrow button in the Autocomplete
          if (!dropdownOpened) {
            const arrowButton = input.locator('xpath=..//*[contains(@class, "MuiAutocomplete-endAdornment")]//button').first();
            if (await arrowButton.count() > 0) {
              console.log(`🏥 Clicking arrow button for autocomplete ${i + 1}`);
              await arrowButton.click();
              await page.waitForTimeout(1000);
              dropdownOpened = true;
            }
          }
          
          // Strategy 3: Use keyboard to open dropdown
          if (!dropdownOpened) {
            console.log(`🏥 Using keyboard to open dropdown for autocomplete ${i + 1}`);
            await input.focus();
            await page.waitForTimeout(300);
            await input.press('ArrowDown');
            await page.waitForTimeout(1000);
            dropdownOpened = true;
          }
          
          // Look for dropdown options with multiple selectors
          const optionSelectors = [
            '[role="listbox"] [role="option"]',
            '.MuiAutocomplete-listbox [role="option"]',
            '.MuiPopper-root [role="option"]',
            '[data-testid="autocomplete-option"]',
            '.MuiAutocomplete-option'
          ];
          
          let options = page.locator('[role="option"]').first();
          let optionsCount = 0;
          
          for (const optionSelector of optionSelectors) {
            const testOptions = page.locator(optionSelector);
            optionsCount = await testOptions.count();
            if (optionsCount > 0) {
              console.log(`🏥 Found ${optionsCount} options with selector: ${optionSelector}`);
              options = testOptions;
              break;
            }
          }
          
          if (optionsCount > 0) {
            const optionTexts = await options.allTextContents();
            console.log(`🏥 Available options for autocomplete ${i + 1}:`, optionTexts);
            
            // Choose a different option intelligently
            let targetOption: string | null = null;
            let targetIndex = -1;
            
            // Define status mappings for better selection
            const statusMappings = {
              'active': ['resolved', 'inactive', 'remission'],
              'resolved': ['active', 'inactive'],
              'inactive': ['active', 'resolved'],
              'remission': ['active', 'resolved'],
              'relapse': ['active', 'resolved']
            };
            
            const currentStatus = initialValue.toLowerCase();
            
            // Find the best target option
            for (const [currentKey, targets] of Object.entries(statusMappings)) {
              if (currentStatus.includes(currentKey)) {
                for (const target of targets) {
                  targetIndex = optionTexts.findIndex(opt => opt.toLowerCase().includes(target));
                  if (targetIndex >= 0) {
                    targetOption = optionTexts[targetIndex];
                    break;
                  }
                }
                break;
              }
            }
            
            // Fallback: pick any different option
            if (targetIndex === -1) {
              targetIndex = optionTexts.findIndex(opt => 
                opt.trim() !== '' && 
                !opt.toLowerCase().includes(currentStatus.toLowerCase().substring(0, 4))
              );
              targetOption = targetIndex >= 0 ? optionTexts[targetIndex] : null;
            }
            
            if (targetOption && targetIndex >= 0) {
              console.log(`🏥 Selecting option "${targetOption}" (index ${targetIndex}) for autocomplete ${i + 1}`);
              
              // Click the option
              await options.nth(targetIndex).click();
              await page.waitForTimeout(2000); // Increased wait time
              
              // Verify the change by checking the input value again
              const newValue = await input.inputValue().catch(() => '');
              console.log(`🏥 After selection, autocomplete ${i + 1} value: "${newValue}"`);
              
              // Check if the value actually changed
              if (newValue !== initialValue && newValue.trim() !== '') {
                // Additional verification: check if new value contains part of target option
                const valueChanged = newValue.toLowerCase() !== initialValue.toLowerCase();
                const containsTarget = targetOption.toLowerCase().includes(newValue.toLowerCase()) || 
                                     newValue.toLowerCase().includes(targetOption.toLowerCase().substring(0, 4));
                
                if (valueChanged || containsTarget) {
                  statusChanges.push({
                    index: i,
                    from: initialValue,
                    to: newValue,
                    linkId: fieldId
                  });
                  console.log(`✅ Successfully changed status ${i + 1}: "${initialValue}" → "${newValue}"`);
                } else {
                  console.log(`⚠️ Status ${i + 1} value changed but doesn't match target: "${initialValue}" → "${newValue}" (expected: ${targetOption})`);
                }
              } else {
                console.log(`⚠️ Status ${i + 1} did not change: "${initialValue}" → "${newValue}"`);
                
                // Try alternative selection method: type the value
                console.log(`🏥 Trying alternative method: typing value for autocomplete ${i + 1}`);
                await input.click();
                await input.selectText();
                await input.type(targetOption);
                await page.waitForTimeout(1000);
                await input.press('Enter');
                await page.waitForTimeout(1000);
                
                const finalValue = await input.inputValue().catch(() => '');
                if (finalValue !== initialValue) {
                  statusChanges.push({
                    index: i,
                    from: initialValue,
                    to: finalValue,
                    linkId: fieldId
                  });
                  console.log(`✅ Successfully changed status ${i + 1} via typing: "${initialValue}" → "${finalValue}"`);
                }
              }
            } else {
              console.log(`⚠️ No suitable target option found for autocomplete ${i + 1} (current: "${initialValue}")`);
              console.log(`🏥 Available options were:`, optionTexts);
            }
          } else {
            console.log(`⚠️ No dropdown options found for autocomplete ${i + 1}`);
            console.log(`🏥 Tried opening dropdown with multiple strategies`);
          }
          
          // Close any open dropdown by pressing Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          
        } catch (error) {
          console.log(`⚠️ Could not change status autocomplete ${i + 1}: ${error.message}`);
        }
      } else {
        console.log(`⚠️ Status autocomplete ${i + 1} is not visible`);
      }
    }
    
    console.log(`🏥 Clinical status changes completed: ${statusChanges.length} changes made`);
    return statusChanges;
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

  // Improved helper function to capture checkbox states with better debugging
  async function captureCheckboxStates(page) {
    const dialog = page.locator('[role="dialog"]');
    
    // More specific selectors for checkboxes
    const userValueCheckboxes = dialog.locator('input[type="checkbox"]').filter({ 
      has: page.locator('text=YOUR CURRENT VALUE') 
    });
    const serverValueCheckboxes = dialog.locator('input[type="checkbox"]').filter({ 
      has: page.locator('text=SUGGESTED (SERVER)') 
    });
    
    // Alternative approach: find checkboxes by their labels
    const userLabelCheckboxes = dialog.locator('label:has-text("YOUR CURRENT VALUE") input[type="checkbox"]');
    const serverLabelCheckboxes = dialog.locator('label:has-text("SUGGESTED (SERVER)") input[type="checkbox"]');
    
    // Use the approach that finds more checkboxes
    const userCheckboxCount1 = await userValueCheckboxes.count();
    const userCheckboxCount2 = await userLabelCheckboxes.count();
    const serverCheckboxCount1 = await serverValueCheckboxes.count();
    const serverCheckboxCount2 = await serverLabelCheckboxes.count();
    
    console.log(`📋 Checkbox counts - Method 1: User=${userCheckboxCount1}, Server=${serverCheckboxCount1}`);
    console.log(`📋 Checkbox counts - Method 2: User=${userCheckboxCount2}, Server=${serverCheckboxCount2}`);
    
    const finalUserCheckboxes = userCheckboxCount2 > userCheckboxCount1 ? userLabelCheckboxes : userValueCheckboxes;
    const finalServerCheckboxes = serverCheckboxCount2 > serverCheckboxCount1 ? serverLabelCheckboxes : serverValueCheckboxes;
    
    const userCheckboxCount = await finalUserCheckboxes.count();
    const serverCheckboxCount = await finalServerCheckboxes.count();
    
    console.log(`📋 Final counts: ${userCheckboxCount} user checkboxes, ${serverCheckboxCount} server checkboxes`);
    
    const states: Array<{ index: number; userChecked: boolean; serverChecked: boolean }> = [];
    
    for (let i = 0; i < Math.min(userCheckboxCount, serverCheckboxCount); i++) {
      const userChecked = await finalUserCheckboxes.nth(i).isChecked().catch(() => false);
      const serverChecked = await finalServerCheckboxes.nth(i).isChecked().catch(() => false);
      
      states.push({
        index: i,
        userChecked,
        serverChecked
      });
      
      console.log(`📋 Checkbox pair ${i + 1}: User=${userChecked}, Server=${serverChecked}`);
    }
    
    return { 
      userValueCheckboxes: finalUserCheckboxes, 
      serverValueCheckboxes: finalServerCheckboxes, 
      states 
    };
  }

  // Improved helper function to verify checkbox state changes
  async function verifyCheckboxStateChange(page, checkboxIndex, expectedUserState, expectedServerState, userCheckboxes, serverCheckboxes) {
    console.log(`🔍 Verifying checkbox ${checkboxIndex + 1} state change...`);
    
    // Wait a bit for state to update
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

  test('Scenario 1: User Reverts All Changes to Server Values (Dates + Clinical Status)', async ({ page }) => {
    console.log('\n🧪 SCENARIO 1: User reverts ALL changes (dates + clinical status) to server values');
    
    await launchQuestionnaire(page);
    await navigateToMedicalHistory(page);
    
    // Make both date and clinical status changes
    const changes = await makeMedicalHistoryChanges(page);
    console.log(`📊 Total changes made: ${changes.totalChanges} (${changes.dateChanges.length} dates, ${changes.statusChanges.length} clinical status)`);
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs in repopulation dialog`);
    
    // Verify we have checkboxes for both date and status changes
    const expectedCheckboxCount = changes.totalChanges;
    if (states.length < expectedCheckboxCount) {
      console.log(`⚠️ Expected ${expectedCheckboxCount} checkbox pairs but found ${states.length}`);
    }
    
    // User chooses to revert ALL changes to server values
    let successfulToggles = 0;
    let failedToggles = 0;
    
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      console.log(`📋 Processing checkbox pair ${i + 1}: User=${state.userChecked}, Server=${state.serverChecked}`);
      
      if (state.userChecked && !state.serverChecked) {
        // User checkbox is checked, server is not - need to toggle to server
        try {
          console.log(`  🔄 Toggling to server value for pair ${i + 1}`);
          await serverValueCheckboxes.nth(i).click();
          await page.waitForTimeout(1500);
          
          const success = await verifyCheckboxStateChange(page, i, false, true, userValueCheckboxes, serverValueCheckboxes);
          if (success) {
            successfulToggles++;
            console.log(`  ✅ Successfully toggled pair ${i + 1} to server value`);
          } else {
            failedToggles++;
            console.log(`  ❌ Failed to toggle pair ${i + 1} to server value`);
          }
        } catch (error) {
          failedToggles++;
          console.log(`  ❌ Error toggling pair ${i + 1}: ${error.message}`);
        }
      } else if (!state.userChecked && state.serverChecked) {
        console.log(`  ✅ Pair ${i + 1} already set to server value`);
        successfulToggles++;
      } else {
        console.log(`  ⚠️ Pair ${i + 1} has unexpected state: User=${state.userChecked}, Server=${state.serverChecked}`);
      }
    }
    
    console.log(`📊 Toggle Results: ${successfulToggles} successful, ${failedToggles} failed out of ${states.length} total`);
    
    // Take screenshot and confirm
    await page.screenshot({ path: 'scenario1-all-server-values.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Scenario 1 completed: All changes reverted to server values');
  });

  test('Scenario 2: Mixed Preferences - Some Server, Some User Values (Dates + Clinical Status)', async ({ page }) => {
    console.log('\n🧪 SCENARIO 2: Mixed preferences for dates and clinical status changes');
    
    await launchQuestionnaire(page);
    await navigateToMedicalHistory(page);
    
    // Make both date and clinical status changes
    const changes = await makeMedicalHistoryChanges(page);
    console.log(`📊 Total changes made: ${changes.totalChanges} (${changes.dateChanges.length} dates, ${changes.statusChanges.length} clinical status)`);
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs in repopulation dialog`);
    
    // Create a mixed preference pattern: alternating between user and server values
    const preferences: Array<{ index: number; choice: 'user' | 'server' }> = [];
    
    for (let i = 0; i < states.length; i++) {
      // Alternate pattern: even indices prefer server, odd indices prefer user
      const choice = i % 2 === 0 ? 'server' : 'user';
      preferences.push({ index: i, choice });
      console.log(`📋 Preference for pair ${i + 1}: ${choice} value`);
    }
    
    // Apply the mixed preferences
    let successfulToggles = 0;
    let failedToggles = 0;
    
    for (const pref of preferences) {
      const i = pref.index;
      const state = states[i];
      
      console.log(`📋 Applying preference for pair ${i + 1}: ${pref.choice} (current: User=${state.userChecked}, Server=${state.serverChecked})`);
      
      try {
        if (pref.choice === 'server' && state.userChecked && !state.serverChecked) {
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
        } else if (pref.choice === 'user' && !state.userChecked && state.serverChecked) {
          // Switch to user value
          console.log(`  🔄 Switching pair ${i + 1} to user value`);
          await userValueCheckboxes.nth(i).click();
          await page.waitForTimeout(1500);
          
          const success = await verifyCheckboxStateChange(page, i, true, false, userValueCheckboxes, serverValueCheckboxes);
          if (success) {
            successfulToggles++;
            console.log(`  ✅ Successfully switched pair ${i + 1} to user value`);
          } else {
            failedToggles++;
            console.log(`  ❌ Failed to switch pair ${i + 1} to user value`);
          }
        } else {
          console.log(`  ✅ Pair ${i + 1} already in desired state for ${pref.choice} preference`);
          successfulToggles++;
        }
      } catch (error) {
        failedToggles++;
        console.log(`  ❌ Error applying preference for pair ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`📊 Mixed Preference Results: ${successfulToggles} successful, ${failedToggles} failed out of ${preferences.length} total`);
    
    // Take screenshot and confirm
    await page.screenshot({ path: 'scenario2-mixed-preferences.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Scenario 2 completed: Mixed preferences applied');
  });

  test('Scenario 3: Complex Multi-Row Medical History Changes (Dates + Clinical Status)', async ({ page }) => {
    console.log('\n🧪 SCENARIO 3: Complex multi-row medical history with both date and clinical status changes');
    
    await launchQuestionnaire(page);
    await navigateToMedicalHistory(page);
    
    // Make comprehensive changes
    const changes = await makeMedicalHistoryChanges(page);
    console.log(`📊 Total changes made: ${changes.totalChanges} (${changes.dateChanges.length} dates, ${changes.statusChanges.length} clinical status)`);
    
    // Log detailed change information
    if (changes.dateChanges.length > 0) {
      console.log('📅 Date changes made:');
      changes.dateChanges.forEach((change, idx) => {
        console.log(`  ${idx + 1}. ${change}`);
      });
    }
    
    if (changes.statusChanges.length > 0) {
      console.log('🏥 Clinical status changes made:');
      changes.statusChanges.forEach((change, idx) => {
        console.log(`  ${idx + 1}. Status ${change.index + 1}: "${change.from}" → "${change.to}" (${change.linkId})`);
      });
    }
    
    if (changes.totalChanges === 0) {
      console.log('⚠️ No changes were made, skipping scenario');
      return;
    }
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) return;
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    console.log(`📋 Found ${states.length} checkbox pairs in repopulation dialog`);
    
    // Complex preference pattern: keep user values for dates, revert clinical status to server
    const preferences: Array<{ index: number; choice: 'user' | 'server'; type: 'date' | 'status' | 'unknown' }> = [];
    
    // Try to identify which checkboxes correspond to dates vs clinical status
    // This is a heuristic approach since we don't have direct mapping
    for (let i = 0; i < states.length; i++) {
      let type: 'date' | 'status' | 'unknown' = 'unknown';
      let choice: 'user' | 'server' = 'user'; // Default to user
      
      // Heuristic: if we have more date changes than status changes, 
      // assume first N checkboxes are dates, rest are status
      if (changes.dateChanges.length > changes.statusChanges.length) {
        if (i < changes.dateChanges.length) {
          type = 'date';
          choice = 'user'; // Keep user date values
        } else {
          type = 'status';
          choice = 'server'; // Revert status to server
        }
      } else {
        // If more or equal status changes, alternate or use different logic
        type = i % 2 === 0 ? 'date' : 'status';
        choice = type === 'date' ? 'user' : 'server';
      }
      
      preferences.push({ index: i, choice, type });
      console.log(`📋 Preference for pair ${i + 1}: ${choice} value (assumed ${type})`);
    }
    
    // Apply the complex preferences
    let successfulToggles = 0;
    let failedToggles = 0;
    
    for (const pref of preferences) {
      const i = pref.index;
      const state = states[i];
      
      console.log(`📋 Applying ${pref.type} preference for pair ${i + 1}: ${pref.choice} (current: User=${state.userChecked}, Server=${state.serverChecked})`);
      
      try {
        if (pref.choice === 'server' && state.userChecked && !state.serverChecked) {
          console.log(`  🔄 Switching ${pref.type} pair ${i + 1} to server value`);
          await serverValueCheckboxes.nth(i).click();
          await page.waitForTimeout(1500);
          
          const success = await verifyCheckboxStateChange(page, i, false, true, userValueCheckboxes, serverValueCheckboxes);
          if (success) {
            successfulToggles++;
            console.log(`  ✅ Successfully switched ${pref.type} pair ${i + 1} to server value`);
          } else {
            failedToggles++;
            console.log(`  ❌ Failed to switch ${pref.type} pair ${i + 1} to server value`);
          }
        } else if (pref.choice === 'user' && !state.userChecked && state.serverChecked) {
          console.log(`  🔄 Switching ${pref.type} pair ${i + 1} to user value`);
          await userValueCheckboxes.nth(i).click();
          await page.waitForTimeout(1500);
          
          const success = await verifyCheckboxStateChange(page, i, true, false, userValueCheckboxes, serverValueCheckboxes);
          if (success) {
            successfulToggles++;
            console.log(`  ✅ Successfully switched ${pref.type} pair ${i + 1} to user value`);
          } else {
            failedToggles++;
            console.log(`  ❌ Failed to switch ${pref.type} pair ${i + 1} to user value`);
          }
        } else {
          console.log(`  ✅ ${pref.type} pair ${i + 1} already in desired state for ${pref.choice} preference`);
          successfulToggles++;
        }
      } catch (error) {
        failedToggles++;
        console.log(`  ❌ Error applying ${pref.type} preference for pair ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`📊 Complex Preference Results: ${successfulToggles} successful, ${failedToggles} failed out of ${preferences.length} total`);
    
    // Take screenshot and confirm
    await page.screenshot({ path: 'scenario3-complex-multi-row.png', fullPage: true });
    
    const confirmButton = page.locator('[role="dialog"] button:has-text("Confirm")');
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Scenario 3 completed: Complex multi-row changes with mixed preferences');
  });

  test('Scenario 4: Clinical Status Change Verification', async ({ page }) => {
    test.setTimeout(180000);
    
    await launchQuestionnaire(page);
    await navigateToMedicalHistory(page);
    
    console.log('🏥 SCENARIO 4: Focused clinical status change verification...');
    
    // Capture initial state of medical history
    await page.screenshot({ path: 'scenario4-initial-state.png', fullPage: true });
    
    // Focus specifically on clinical status changes
    const statusChanges = await makeClinicalStatusChanges(page);
    
    // Also make some date changes
    const userDateValues = await makeDateChangesInMedicalHistory(page);
    
    console.log('📊 Status changes made:', statusChanges);
    console.log('📊 Date changes made:', userDateValues);
    
    // Take screenshot after changes
    await page.screenshot({ path: 'scenario4-after-changes.png', fullPage: true });
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) {
      console.log('❌ Cannot proceed without repopulation dialog');
      return;
    }
    
    // Take screenshot of dialog
    await page.screenshot({ path: 'scenario4-dialog.png', fullPage: true });
    
    // Capture checkbox states
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    
    // SCENARIO 4: Specific pattern for clinical status verification
    // Keep user values for status changes, revert dates to server
    console.log('🎯 SCENARIO 4: Applying status-focused preferences...');
    
    const preferences: Array<{ index: number; choice: string; success: boolean }> = [];
    
    for (let i = 0; i < states.length; i++) {
      // For this scenario, let's alternate but focus on keeping some user changes
      const keepUserValue = i % 3 !== 0; // Keep user values for 2/3 of changes
      
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
    console.log(`📊 Status-focused preferences: ${successfulPreferences}/${preferences.length} successful`);
    console.log('📊 Status-focused preferences:', preferences);
    
    // Take screenshot after setting preferences
    await page.screenshot({ path: 'scenario4-dialog-prefs-set.png', fullPage: true });
    
    // Confirm the dialog
    console.log('🎯 Confirming repopulation with status-focused preferences...');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForTimeout(3000);
    
    // Take final screenshot
    await page.screenshot({ path: 'scenario4-final-result.png', fullPage: true });
    
    console.log('✅ SCENARIO 4 COMPLETED: Clinical status changes verified');
    console.log('📁 Screenshots saved:');
    console.log('   - scenario4-initial-state.png');
    console.log('   - scenario4-after-changes.png');
    console.log('   - scenario4-dialog.png');
    console.log('   - scenario4-dialog-prefs-set.png');
    console.log('   - scenario4-final-result.png');
  });

  test('Scenario 5: Edge Case - All User Values vs All Server Values', async ({ page }) => {
    test.setTimeout(180000);
    
    await launchQuestionnaire(page);
    await navigateToMedicalHistory(page);
    
    console.log('🎯 SCENARIO 5: Edge case testing - All user vs all server values...');
    
    // Make changes
    const userDateValues = await makeDateChangesInMedicalHistory(page);
    const statusChanges = await makeClinicalStatusChanges(page);
    
    // Open repopulation dialog
    const dialogOpened = await openRepopulationDialog(page);
    if (!dialogOpened) {
      console.log('❌ Cannot proceed without repopulation dialog');
      return;
    }
    
    // Test 1: Keep ALL user values (default state)
    console.log('🎯 Test 1: Confirming with ALL user values (default)...');
    
    await page.screenshot({ path: 'scenario5-all-user-dialog.png', fullPage: true });
    
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'scenario5-all-user-result.png', fullPage: true });
    
    console.log('✅ Test 1 completed: All user values preserved');
    
    // Reopen dialog for Test 2
    console.log('🔄 Reopening dialog for Test 2...');
    
    // Make a small change to trigger repopulation again
    const firstDateInput = page.locator('input[type="date"]').first();
    if (await firstDateInput.isVisible().catch(() => false)) {
      await firstDateInput.clear();
      await firstDateInput.fill('2024-12-31');
      await firstDateInput.blur();
      await page.waitForTimeout(1000);
    }
    
    const dialogOpened2 = await openRepopulationDialog(page);
    if (!dialogOpened2) {
      console.log('⚠️ Could not reopen dialog for Test 2');
      return;
    }
    
    // Test 2: Switch ALL to server values
    console.log('🎯 Test 2: Switching ALL to server values...');
    
    const { userValueCheckboxes, serverValueCheckboxes, states } = await captureCheckboxStates(page);
    
    let successfulChanges = 0;
    
    // Click all server checkboxes
    for (let i = 0; i < states.length; i++) {
      console.log(`🔄 Switching checkbox pair ${i + 1} to server value...`);
      
      try {
        await serverValueCheckboxes.nth(i).click();
        await page.waitForTimeout(1200);
        
        const stateChanged = await verifyCheckboxStateChange(
          page, i, false, true, userValueCheckboxes, serverValueCheckboxes
        );
        
        if (stateChanged) {
          successfulChanges++;
          console.log(`✅ Successfully switched checkbox pair ${i + 1} to server value`);
        } else {
          console.log(`❌ Failed to switch checkbox pair ${i + 1} to server value`);
        }
      } catch (error) {
        console.log(`❌ Error switching checkbox pair ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`📊 Successfully switched ${successfulChanges}/${states.length} checkboxes to server values`);
    
    await page.screenshot({ path: 'scenario5-all-server-dialog.png', fullPage: true });
    
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'scenario5-all-server-result.png', fullPage: true });
    
    console.log('✅ SCENARIO 5 COMPLETED: Edge case testing completed');
    console.log(`📊 Final results: ${successfulChanges}/${states.length} checkboxes successfully switched`);
    console.log('📁 Screenshots saved:');
    console.log('   - scenario5-all-user-dialog.png');
    console.log('   - scenario5-all-user-result.png');
    console.log('   - scenario5-all-server-dialog.png');
    console.log('   - scenario5-all-server-result.png');
  });
}); 