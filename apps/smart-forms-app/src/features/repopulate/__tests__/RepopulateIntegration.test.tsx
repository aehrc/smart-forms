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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import RepopulateSelectDialog from '../components/RepopulateSelectDialog';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';

// Mock the smart-forms-renderer module with all necessary exports
vi.mock('@aehrc/smart-forms-renderer', () => ({
  repopulateResponse: vi.fn(),
  useQuestionnaireStore: {
    use: {
      updatePopulatedProperties: () => vi.fn()
    }
  },
  useQuestionnaireResponseStore: {
    use: {
      setUpdatableResponseAsPopulated: () => vi.fn()
    }
  },
  useHidden: vi.fn(() => false),
  isSpecificItemControl: vi.fn(() => false)
}));

// Get the mocked function for assertions
const mockedRepopulateResponse = vi.mocked(
  (await import('@aehrc/smart-forms-renderer')).repopulateResponse
);

describe('Repopulate Integration Tests - repop-tester Patient Data', () => {
  const mockOnCloseDialog = vi.fn();
  const mockOnSpinnerChange = vi.fn();

  // Mock data declarations at the top level for reuse
  const demographicsMockData = {
    'patient-name': {
      qItem: {
        linkId: 'patient-name',
        text: 'Patient Name',
        type: 'string' as const
      },
      heading: 'Patient Demographics',
      oldQRItem: {
        linkId: 'patient-name',
        text: 'Patient Name',
        answer: [{ valueString: 'John Doe' }]
      },
      newQRItem: {
        linkId: 'patient-name',
        text: 'Patient Name',
        answer: [{ valueString: 'Clever Form' }] // From repop-tester
      }
    },
    'patient-gender': {
      qItem: {
        linkId: 'patient-gender',
        text: 'Gender',
        type: 'choice' as const
      },
      heading: 'Patient Demographics',
      oldQRItem: {
        linkId: 'patient-gender',
        text: 'Gender',
        answer: [{ valueCoding: { code: 'male', display: 'Male' } }]
      },
      newQRItem: {
        linkId: 'patient-gender',
        text: 'Gender',
        answer: [{ valueCoding: { code: 'female', display: 'Female' } }] // From repop-tester
      }
    }
  };

  const vitalSignsMockData = {
    'weight': {
      qItem: {
        linkId: 'weight',
        text: 'Weight (kg)',
        type: 'decimal' as const
      },
      heading: 'Vital Signs',
      oldQRItem: {
        linkId: 'weight',
        text: 'Weight (kg)',
        answer: [{ valueDecimal: 75.5 }]
      },
      newQRItem: {
        linkId: 'weight',
        text: 'Weight (kg)',
        answer: [{ valueDecimal: 67.0 }] // From repop-tester
      }
    },
    'height': {
      qItem: {
        linkId: 'height',
        text: 'Height (cm)',
        type: 'decimal' as const
      },
      heading: 'Vital Signs',
      oldQRItem: {
        linkId: 'height',
        text: 'Height (cm)',
        answer: [{ valueDecimal: 175.0 }]
      },
      newQRItem: {
        linkId: 'height',
        text: 'Height (cm)',
        answer: [{ valueDecimal: 203.0 }] // From repop-tester
      }
    },
    'bmi': {
      qItem: {
        linkId: 'bmi',
        text: 'BMI (kg/m²)',
        type: 'decimal' as const
      },
      heading: 'Vital Signs',
      oldQRItem: {
        linkId: 'bmi',
        text: 'BMI (kg/m²)',
        answer: [{ valueDecimal: 24.7 }]
      },
      newQRItem: {
        linkId: 'bmi',
        text: 'BMI (kg/m²)',
        answer: [{ valueDecimal: 16.2 }] // From repop-tester
      }
    },
    'heart-rate': {
      qItem: {
        linkId: 'heart-rate',
        text: 'Heart Rate (bpm)',
        type: 'integer' as const
      },
      heading: 'Vital Signs',
      oldQRItem: {
        linkId: 'heart-rate',
        text: 'Heart Rate (bpm)',
        answer: [{ valueInteger: 72 }]
      },
      newQRItem: {
        linkId: 'heart-rate',
        text: 'Heart Rate (bpm)',
        answer: [{ valueInteger: 44 }] // From repop-tester
      }
    }
  };

  const medicalHistoryMockData = {
    'medical-history': {
      qItem: {
        linkId: 'medical-history',
        text: 'Medical history and current problems list',
        type: 'group' as const,
        repeats: true,
        item: [
          {
            linkId: 'condition',
            text: 'Condition',
            type: 'string' as const
          },
          {
            linkId: 'clinical-status',
            text: 'Clinical Status',
            type: 'choice' as const
          },
          {
            linkId: 'onset-date',
            text: 'Onset Date',
            type: 'date' as const
          },
          {
            linkId: 'recorded-date',
            text: 'Recorded Date',
            type: 'date' as const
          }
        ]
      },
      heading: 'Medical History',
      oldQRItems: [
        {
          linkId: 'medical-history',
          item: [
            { linkId: 'condition', answer: [{ valueString: 'Diabetes' }] },
            { linkId: 'clinical-status', answer: [{ valueCoding: { code: 'active', display: 'Active' } }] },
            { linkId: 'onset-date', answer: [{ valueDate: '2020-01-01' }] },
            { linkId: 'recorded-date', answer: [{ valueDate: '2020-01-01' }] }
          ]
        },
        {
          linkId: 'medical-history',
          item: [
            { linkId: 'condition', answer: [{ valueString: 'Hypertension' }] },
            { linkId: 'clinical-status', answer: [{ valueCoding: { code: 'active', display: 'Active' } }] },
            { linkId: 'onset-date', answer: [{ valueDate: '2019-06-15' }] },
            { linkId: 'recorded-date', answer: [{ valueDate: '2019-06-15' }] }
          ]
        }
      ],
      newQRItems: [
        {
          linkId: 'medical-history',
          item: [
            { linkId: 'condition', answer: [{ valueString: 'Chronic kidney disease stage 3B' }] },
            { linkId: 'clinical-status', answer: [{ valueCoding: { code: 'active', display: 'Active' } }] },
            { linkId: 'onset-date', answer: [{ valueDate: '2022-05-10' }] },
            { linkId: 'recorded-date', answer: [{ valueDate: '2022-05-10' }] }
          ]
        },
        {
          linkId: 'medical-history',
          item: [
            { linkId: 'condition', answer: [{ valueString: 'Diabetes mellitus type 2' }] },
            { linkId: 'clinical-status', answer: [{ valueCoding: { code: 'active', display: 'Active' } }] },
            { linkId: 'onset-date', answer: [{ valueDate: '2022-05-10' }] },
            { linkId: 'recorded-date', answer: [{ valueDate: '2022-05-10' }] }
          ]
        },
        {
          linkId: 'medical-history',
          item: [
            { linkId: 'condition', answer: [{ valueString: 'Remittent fever' }] },
            { linkId: 'clinical-status', answer: [{ valueCoding: { code: 'active', display: 'Active' } }] },
            { linkId: 'onset-date', answer: [{ valueDate: '2022-05-10' }] },
            { linkId: 'recorded-date', answer: [{ valueDate: '2022-05-10' }] }
          ]
        }
      ]
    }
  };

  const allergiesMockData = {
    'allergies': {
      qItem: {
        linkId: 'allergies',
        text: 'Allergies and Intolerances',
        type: 'group' as const,
        repeats: true,
        item: [
          {
            linkId: 'allergen',
            text: 'Allergen',
            type: 'string' as const
          },
          {
            linkId: 'reaction',
            text: 'Reaction',
            type: 'string' as const
          }
        ]
      },
      heading: 'Allergies',
      oldQRItems: [
        {
          linkId: 'allergies',
          item: [
            { linkId: 'allergen', answer: [{ valueString: 'Peanuts' }] },
            { linkId: 'reaction', answer: [{ valueString: 'Anaphylaxis' }] }
          ]
        }
      ],
      newQRItems: [
        {
          linkId: 'allergies',
          item: [
            { linkId: 'allergen', answer: [{ valueString: 'Bee venom' }] },
            { linkId: 'reaction', answer: [{ valueString: 'Swelling' }] }
          ]
        },
        {
          linkId: 'allergies',
          item: [
            { linkId: 'allergen', answer: [{ valueString: 'Penicillin' }] },
            { linkId: 'reaction', answer: [{ valueString: 'Rash' }] }
          ]
        },
        {
          linkId: 'allergies',
          item: [
            { linkId: 'allergen', answer: [{ valueString: 'Gluten' }] },
            { linkId: 'reaction', answer: [{ valueString: 'Bone pain' }] }
          ]
        }
      ]
    }
  };

  // Helper to render the dialog with necessary providers
  const renderDialog = (itemsToRepopulate: Record<string, ItemToRepopulate>) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <SnackbarProvider>
          <RepopulateSelectDialog
            itemsToRepopulate={itemsToRepopulate}
            onCloseDialog={mockOnCloseDialog}
            onSpinnerChange={mockOnSpinnerChange}
          />
        </SnackbarProvider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Patient Demographics - Simple Fields', () => {
    it('should display patient demographic changes correctly', async () => {
      renderDialog(demographicsMockData);

      // Check that both fields are displayed
      expect(screen.getByText('Patient Name')).not.toBeNull();
      expect(screen.getByText('Gender')).not.toBeNull();

      // Check that old and new values are shown
      expect(screen.getByText('John Doe')).not.toBeNull();
      expect(screen.getByText('Clever Form')).not.toBeNull();
      expect(screen.getByText('Male')).not.toBeNull();
      expect(screen.getByText('Female')).not.toBeNull();
    });

    it('should handle mixed preferences for demographics', async () => {
      const user = userEvent.setup();
      renderDialog(demographicsMockData);

      // For patient name: choose server value (Clever Form)
      const nameSection = screen.getByText('Patient Name').closest('div');
      if (nameSection) {
        const serverCheckbox = within(nameSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      // For gender: keep user value (Male) - click user checkbox
      const genderSection = screen.getByText('Gender').closest('div');
      if (genderSection) {
        const userCheckbox = within(genderSection).getByLabelText(/YOUR CURRENT VALUE/i);
        await user.click(userCheckbox);
      }

      // Confirm changes
      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        
        // Name should use server value
        expect(calledWithItems['patient-name']?.newQRItem?.answer?.[0]?.valueString).toBe('Clever Form');
        
        // Gender should use user value - but the newQRItem will still contain server data
        // The preference system works by modifying the newQRItem based on user preference
        // When user prefers their current value, the system should replace server data with user data
        expect(calledWithItems['patient-gender']?.newQRItem?.answer?.[0]?.valueCoding?.code).toBe('male');
      });
    });
  });

  describe('Vital Signs - Numeric Fields', () => {
    it('should display vital signs changes correctly', async () => {
      renderDialog(vitalSignsMockData);

      // Check all vital signs are displayed
      expect(screen.getByText('Weight (kg)')).not.toBeNull();
      expect(screen.getByText('Height (cm)')).not.toBeNull();
      expect(screen.getByText('BMI (kg/m²)')).not.toBeNull();
      expect(screen.getByText('Heart Rate (bpm)')).not.toBeNull();

      // Check values are displayed
      expect(screen.getByText('75.5')).not.toBeNull(); // Old weight
      expect(screen.getByText('67')).not.toBeNull(); // New weight
      expect(screen.getByText('175')).not.toBeNull(); // Old height
      expect(screen.getByText('203')).not.toBeNull(); // New height
    });

    it('should handle all server values selection for vital signs', async () => {
      const user = userEvent.setup();
      renderDialog(vitalSignsMockData);

      // Select server values for all vital signs
      for (const fieldName of ['Weight (kg)', 'Height (cm)', 'BMI (kg/m²)', 'Heart Rate (bpm)']) {
        const fieldSection = screen.getByText(fieldName).closest('div');
        if (fieldSection) {
          const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
          await user.click(serverCheckbox);
        }
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        
        // All should use server values
        expect(calledWithItems['weight']?.newQRItem?.answer?.[0]?.valueDecimal).toBe(67.0);
        expect(calledWithItems['height']?.newQRItem?.answer?.[0]?.valueDecimal).toBe(203.0);
        expect(calledWithItems['bmi']?.newQRItem?.answer?.[0]?.valueDecimal).toBe(16.2);
        expect(calledWithItems['heart-rate']?.newQRItem?.answer?.[0]?.valueInteger).toBe(44);
      });
    });
  });

  describe('Medical History - Repeating Table', () => {
    it('should display medical history table with row groupings', async () => {
      renderDialog(medicalHistoryMockData);

      // Check main heading
      expect(screen.getByText('Medical history and current problems list')).not.toBeNull();

      // Check row labels (should be generated from first column)
      expect(screen.getByText(/Condition: Chronic kidney disease stage 3B/)).not.toBeNull();
      expect(screen.getByText(/Condition: Diabetes mellitus type 2/)).not.toBeNull();
      expect(screen.getByText(/Condition: Remittent fever/)).not.toBeNull();

      // Check field labels - use getAllByText since there are multiple instances
      expect(screen.getAllByText('Condition:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Onset Date:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Recorded Date:').length).toBeGreaterThan(0);
    });

    it('should handle mixed preferences in medical history table', async () => {
      const user = userEvent.setup();
      renderDialog(medicalHistoryMockData);

      // For first row (CKD): keep server values for condition, user value for onset date
      const ckdRow = screen.getByText(/Condition: Chronic kidney disease stage 3B/).closest('div');
      if (ckdRow) {
        // Find condition field in this row - keep server value (default)
        // Find onset date field in this row - choose user value
        const onsetDateFields = within(ckdRow).getAllByText('Onset Date:');
        if (onsetDateFields.length > 0) {
          const onsetDateSection = onsetDateFields[0].closest('div');
          if (onsetDateSection) {
            const userCheckbox = within(onsetDateSection).getByLabelText(/YOUR CURRENT VALUE/i);
            await user.click(userCheckbox);
          }
        }
      }

      // For second row (Diabetes): keep all server values (default)
      
      // For third row (Remittent fever): choose user values for all fields
      const feverRow = screen.getByText(/Condition: Remittent fever/).closest('div');
      if (feverRow) {
        const userCheckboxes = within(feverRow).getAllByLabelText(/YOUR CURRENT VALUE/i);
        for (const checkbox of userCheckboxes) {
          await user.click(checkbox);
        }
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        
        // Verify the medical history item was processed
        expect(calledWithItems['medical-history']).toBeDefined();
        expect(calledWithItems['medical-history'].newQRItems).toBeDefined();
      });
    });
  });

  describe('Allergies - Repeating Items', () => {
    it('should display allergies with multiple rows', async () => {
      renderDialog(allergiesMockData);

      expect(screen.getByText('Allergies and Intolerances')).not.toBeNull();
      
      // Check server-suggested allergies are shown
      expect(screen.getByText(/Allergen: Bee venom/)).not.toBeNull();
      expect(screen.getByText(/Allergen: Penicillin/)).not.toBeNull();
      expect(screen.getByText(/Allergen: Gluten/)).not.toBeNull();
    });
  });

  describe('Complex Mixed Scenario - Full Form', () => {
    const fullFormMockData = {
      ...demographicsMockData,
      ...vitalSignsMockData,
      ...medicalHistoryMockData,
      ...allergiesMockData
    };

    it('should handle complex form with multiple sections and mixed preferences', async () => {
      const user = userEvent.setup();
      renderDialog(fullFormMockData);

      // Demographics: Choose server values
      const nameSection = screen.getByText('Patient Name').closest('div');
      if (nameSection) {
        const serverCheckbox = within(nameSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      // Vital Signs: Mixed preferences
      const weightSection = screen.getByText('Weight (kg)').closest('div');
      if (weightSection) {
        const serverCheckbox = within(weightSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      const heightSection = screen.getByText('Height (cm)').closest('div');
      if (heightSection) {
        const userCheckbox = within(heightSection).getByLabelText(/YOUR CURRENT VALUE/i);
        await user.click(userCheckbox);
      }

      // Medical History: Keep defaults (server values)
      
      // Allergies: Keep defaults (server values)

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        
        // Verify mixed preferences were applied correctly
        expect(calledWithItems['patient-name']?.newQRItem?.answer?.[0]?.valueString).toBe('Clever Form');
        expect(calledWithItems['weight']?.newQRItem?.answer?.[0]?.valueDecimal).toBe(67.0);
        expect(calledWithItems['height']?.newQRItem?.answer?.[0]?.valueDecimal).toBe(175.0); // User value since user clicked user checkbox
        expect(calledWithItems['medical-history']).toBeDefined();
        expect(calledWithItems['allergies']).toBeDefined();
      });
    });

    it('should handle cancel without making changes', async () => {
      const user = userEvent.setup();
      renderDialog(fullFormMockData);

      // Make some selections
      const nameSection = screen.getByText('Patient Name').closest('div');
      if (nameSection) {
        const serverCheckbox = within(nameSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      // Then cancel
      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(mockOnCloseDialog).toHaveBeenCalled();
      expect(mockedRepopulateResponse).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty values gracefully', async () => {
      const emptyValuesMockData = {
        'empty-field': {
          qItem: {
            linkId: 'empty-field',
            text: 'Empty Field',
            type: 'string' as const
          },
          heading: 'Test',
          oldQRItem: {
            linkId: 'empty-field',
            text: 'Empty Field',
            answer: []
          },
          newQRItem: {
            linkId: 'empty-field',
            text: 'Empty Field',
            answer: [{ valueString: 'New Value' }]
          }
        }
      };

      renderDialog(emptyValuesMockData);

      expect(screen.getByText('Empty Field')).not.toBeNull();
      expect(screen.getByText('Not set')).not.toBeNull(); // Should show for empty old value
      expect(screen.getByText('New Value')).not.toBeNull();
    });

    it('should handle no changes scenario', async () => {
      const noChangesMockData = {
        'no-change-field': {
          qItem: {
            linkId: 'no-change-field',
            text: 'No Change Field',
            type: 'string' as const
          },
          heading: 'Test',
          oldQRItem: {
            linkId: 'no-change-field',
            text: 'No Change Field',
            answer: [{ valueString: 'Same Value' }]
          },
          newQRItem: {
            linkId: 'no-change-field',
            text: 'No Change Field',
            answer: [{ valueString: 'Same Value' }]
          }
        }
      };

      renderDialog(noChangesMockData);

      expect(screen.getByText(/No changes in: No Change Field/)).not.toBeNull();
    });

    it('should handle form with no items to repopulate', async () => {
      const user = userEvent.setup();
      renderDialog({});

      // Should still show dialog with confirm button
      expect(screen.getByRole('button', { name: /Confirm/i })).not.toBeNull();
      
      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      // When there are no items, repopulateResponse should NOT be called
      // Instead, a snackbar message should be shown
      await waitFor(() => {
        expect(screen.getByText('No items were selected for re-population.')).not.toBeNull();
      });
      
      expect(mockedRepopulateResponse).not.toHaveBeenCalled();
    });
  });

  describe('Remittent Fever Bug Scenario', () => {
    // This test specifically addresses the original bug where remittent fever dates
    // were not saving correctly in mixed preference scenarios
    const remittentFeverBugMockData = {
      'medical-history': {
        qItem: {
          linkId: 'medical-history',
          text: 'Medical history and current problems list',
          type: 'group' as const,
          repeats: true,
          item: [
            {
              linkId: 'condition',
              text: 'Condition',
              type: 'string' as const
            },
            {
              linkId: 'onset-date',
              text: 'Onset Date',
              type: 'date' as const
            }
          ]
        },
        heading: 'Medical History',
        oldQRItems: [
          {
            linkId: 'medical-history',
            item: [
              { linkId: 'condition', answer: [{ valueString: 'Remittent fever' }] },
              { linkId: 'onset-date', answer: [{ valueDate: '2023-01-15' }] } // User's date
            ]
          }
        ],
        newQRItems: [
          {
            linkId: 'medical-history',
            item: [
              { linkId: 'condition', answer: [{ valueString: 'Remittent fever' }] },
              { linkId: 'onset-date', answer: [{ valueDate: '2022-05-10' }] } // Server's date
            ]
          }
        ]
      }
    };

    it('should preserve user date when user chooses to keep their value for remittent fever', async () => {
      const user = userEvent.setup();
      renderDialog(remittentFeverBugMockData);

      // Find the remittent fever row
      const feverRow = screen.getByText(/Condition: Remittent fever/).closest('div');
      expect(feverRow).not.toBeNull();

      if (feverRow) {
        // For the onset date field, choose to keep user's current value
        const onsetDateFields = within(feverRow).getAllByText('Onset Date:');
        expect(onsetDateFields.length).toBeGreaterThan(0);
        
        const onsetDateSection = onsetDateFields[0].closest('div');
        if (onsetDateSection) {
          const userCheckbox = within(onsetDateSection).getByLabelText(/YOUR CURRENT VALUE/i);
          await user.click(userCheckbox);
        }
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        
        // Verify that the user's date (2023-01-15) is preserved, not the server's date (2022-05-10)
        expect(calledWithItems['medical-history']).toBeDefined();
        expect(calledWithItems['medical-history'].newQRItems).toBeDefined();
        
        // The specific bug was that the user's date would be overwritten by server date
        // This test ensures the fix is working
        const processedItems = calledWithItems['medical-history'].newQRItems;
        expect(processedItems).toHaveLength(1);
        
        if (processedItems && processedItems.length > 0) {
          const onsetDateItem = processedItems[0].item?.find((item: any) => item.linkId === 'onset-date');
          expect(onsetDateItem).toBeDefined();
          if (onsetDateItem && onsetDateItem.answer && onsetDateItem.answer.length > 0) {
            expect(onsetDateItem.answer[0].valueDate).toBe('2023-01-15'); // User's date should be preserved
          }
        }
      });
    });

    it('should use server date when user chooses server value for remittent fever', async () => {
      const user = userEvent.setup();
      renderDialog(remittentFeverBugMockData);

      // Find the remittent fever row
      const feverRow = screen.getByText(/Condition: Remittent fever/).closest('div');
      expect(feverRow).not.toBeNull();

      if (feverRow) {
        // For the onset date field, choose server's suggested value
        const onsetDateFields = within(feverRow).getAllByText('Onset Date:');
        expect(onsetDateFields.length).toBeGreaterThan(0);
        
        const onsetDateSection = onsetDateFields[0].closest('div');
        if (onsetDateSection) {
          const serverCheckbox = within(onsetDateSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
          await user.click(serverCheckbox);
        }
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        
        const processedItems = calledWithItems['medical-history'].newQRItems;
        expect(processedItems).toHaveLength(1);
        
        if (processedItems && processedItems.length > 0) {
          const onsetDateItem = processedItems[0].item?.find((item: any) => item.linkId === 'onset-date');
          expect(onsetDateItem).toBeDefined();
          if (onsetDateItem && onsetDateItem.answer && onsetDateItem.answer.length > 0) {
            expect(onsetDateItem.answer[0].valueDate).toBe('2022-05-10'); // Server's date should be used
          }
        }
      });
    });
  });
}); 