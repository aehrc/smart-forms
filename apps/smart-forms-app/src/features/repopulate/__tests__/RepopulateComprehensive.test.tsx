import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import RepopulateSelectDialog from '../components/RepopulateSelectDialog';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import { repopulateResponse } from '@aehrc/smart-forms-renderer';

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

// Get the mocked function with proper typing
const mockedRepopulateResponse = repopulateResponse as any;

/**
 * Comprehensive Repopulate Tests for "repop-tester" Patient Data
 *
 * This test suite covers all repopulate scenarios using the patient data
 * that was successfully created in the FHIR server with ID "repop-tester".
 *
 * Patient Data Summary:
 * - Patient: Clever Form (repop-tester)
 * - 1 Encounter (health check)
 * - 9 Observations (BMI, weight, height, waist, BP, heart rate, smoking)
 * - 12 Conditions (CKD, diabetes, hypertension, remittent fever, etc.)
 * - 10 AllergyIntolerances (bee venom, penicillin, aspirin, etc.)
 * - 3 Immunizations (2 COVID vaccines, 1 DTP vaccine)
 */
describe('Comprehensive Repopulate Tests - repop-tester Patient', () => {
  const mockOnCloseDialog = vi.fn();
  const mockOnSpinnerChange = vi.fn();

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

  describe('1. Simple Data Types (string/text)', () => {
    const stringFieldMockData = {
      'patient-name': {
        qItem: {
          linkId: 'patient-name',
          text: 'Patient Name',
          type: 'string' as const
        },
        heading: 'Patient Demographics',
        currentQRItem: {
          linkId: 'patient-name',
          text: 'Patient Name',
          answer: [{ valueString: 'John Doe' }]
        },
        serverQRItem: {
          linkId: 'patient-name',
          text: 'Patient Name',
          answer: [{ valueString: 'Clever Form' }]
        }
      }
    };

    it('should handle different string values correctly', async () => {
      const user = userEvent.setup();
      renderDialog(stringFieldMockData);

      // Find the field section and select server suggested value
      const fieldSection = screen.getByText('Patient Name').closest('div');
      expect(fieldSection).not.toBeNull();

      if (fieldSection) {
        // Should show both old and new values
        expect(within(fieldSection).queryByText(/John Doe/i)).not.toBeNull();
        expect(within(fieldSection).queryByText(/Clever Form/i)).not.toBeNull();

        // Select server suggested value
        const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['patient-name'].serverQRItem.answer[0].valueString).toBe(
          'Clever Form'
        );
      });
    });

    it('should handle same string values (no change scenario)', async () => {
      const noChangeData = {
        'patient-name': {
          ...stringFieldMockData['patient-name'],
          serverQRItem: {
            linkId: 'patient-name',
            text: 'Patient Name',
            answer: [{ valueString: 'John Doe' }] // Same as old value
          }
        }
      };

      renderDialog(noChangeData);

      // Should show "No changes" message when values are the same
      expect(screen.queryByText(/No changes in:/i)).not.toBeNull();
      // Use getAllByText to handle multiple elements with same text
      const patientNameElements = screen.getAllByText(/Patient Name/i);
      expect(patientNameElements.length).toBeGreaterThan(0);
    });
  });

  describe('2. Numeric Data Types (decimal/integer)', () => {
    const numericMockData = {
      weight: {
        qItem: {
          linkId: 'weight',
          text: 'Weight (kg)',
          type: 'decimal' as const
        },
        heading: 'Vital Signs',
        currentQRItem: {
          linkId: 'weight',
          text: 'Weight (kg)',
          answer: [{ valueDecimal: 75.5 }]
        },
        serverQRItem: {
          linkId: 'weight',
          text: 'Weight (kg)',
          answer: [{ valueDecimal: 77.3 }] // From repop-tester data
        }
      },
      'heart-rate': {
        qItem: {
          linkId: 'heart-rate',
          text: 'Heart Rate (bpm)',
          type: 'integer' as const
        },
        heading: 'Vital Signs',
        currentQRItem: {
          linkId: 'heart-rate',
          text: 'Heart Rate (bpm)',
          answer: [{ valueInteger: 72 }]
        },
        serverQRItem: {
          linkId: 'heart-rate',
          text: 'Heart Rate (bpm)',
          answer: [{ valueInteger: 88 }] // From repop-tester data
        }
      }
    };

    it('should handle decimal values correctly', async () => {
      const user = userEvent.setup();
      renderDialog({ weight: numericMockData.weight });

      const fieldSection = screen.getByText('Weight (kg)').closest('div');
      if (fieldSection) {
        // Should show both old and new decimal values
        expect(within(fieldSection).queryByText(/75\.5/)).not.toBeNull();
        expect(within(fieldSection).queryByText(/77\.3/)).not.toBeNull();

        const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['weight'].serverQRItem.answer[0].valueDecimal).toBe(77.3);
      });
    });

    it('should handle integer values correctly', async () => {
      const user = userEvent.setup();
      renderDialog({ 'heart-rate': numericMockData['heart-rate'] });

      const fieldSection = screen.getByText('Heart Rate (bpm)').closest('div');
      if (fieldSection) {
        const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['heart-rate'].serverQRItem.answer[0].valueInteger).toBe(88);
      });
    });
  });

  describe('3. Boolean Data Types', () => {
    const booleanMockData = {
      'current-smoker': {
        qItem: {
          linkId: 'current-smoker',
          text: 'Current Smoker',
          type: 'boolean' as const
        },
        heading: 'Lifestyle',
        currentQRItem: {
          linkId: 'current-smoker',
          text: 'Current Smoker',
          answer: [{ valueBoolean: false }]
        },
        serverQRItem: {
          linkId: 'current-smoker',
          text: 'Current Smoker',
          answer: [{ valueBoolean: true }] // From repop-tester data
        }
      }
    };

    it('should handle boolean values correctly', async () => {
      const user = userEvent.setup();
      renderDialog(booleanMockData);

      const fieldSection = screen.getByText('Current Smoker').closest('div');
      if (fieldSection) {
        const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['current-smoker'].serverQRItem.answer[0].valueBoolean).toBe(true);
      });
    });
  });

  describe('4. Date Data Types', () => {
    const dateMockData = {
      'remittent-fever-onset': {
        qItem: {
          linkId: 'remittent-fever-onset',
          text: 'Remittent Fever Onset Date',
          type: 'date' as const
        },
        heading: 'Medical History',
        currentQRItem: {
          linkId: 'remittent-fever-onset',
          text: 'Remittent Fever Onset Date',
          answer: [{ valueDate: '2022-01-01' }]
        },
        serverQRItem: {
          linkId: 'remittent-fever-onset',
          text: 'Remittent Fever Onset Date',
          answer: [{ valueDate: '2022-05-10' }] // From repop-tester data
        }
      }
    };

    it('should handle date values correctly', async () => {
      const user = userEvent.setup();
      renderDialog(dateMockData);

      const fieldSection = screen.getByText('Remittent Fever Onset Date').closest('div');
      if (fieldSection) {
        const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['remittent-fever-onset'].serverQRItem.answer[0].valueDate).toBe(
          '2022-05-10'
        );
      });
    });
  });

  describe('5. Coding Data Types', () => {
    const codingMockData = {
      'allergy-severity': {
        qItem: {
          linkId: 'allergy-severity',
          text: 'Allergy Severity',
          type: 'choice' as const
        },
        heading: 'Allergies',
        currentQRItem: {
          linkId: 'allergy-severity',
          text: 'Allergy Severity',
          answer: [{ valueCoding: { code: 'mild', display: 'Mild' } }]
        },
        serverQRItem: {
          linkId: 'allergy-severity',
          text: 'Allergy Severity',
          answer: [{ valueCoding: { code: 'severe', display: 'Severe' } }] // From repop-tester data
        }
      }
    };

    it('should handle coding values correctly', async () => {
      const user = userEvent.setup();
      renderDialog(codingMockData);

      const fieldSection = screen.getByText('Allergy Severity').closest('div');
      if (fieldSection) {
        const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['allergy-severity'].serverQRItem.answer[0].valueCoding.code).toBe(
          'severe'
        );
      });
    });
  });

  describe('6. Complex Data Types (Quantity)', () => {
    const quantityMockData = {
      'blood-pressure': {
        qItem: {
          linkId: 'blood-pressure',
          text: 'Blood Pressure',
          type: 'quantity' as const
        },
        heading: 'Vital Signs',
        currentQRItem: {
          linkId: 'blood-pressure',
          text: 'Blood Pressure',
          answer: [{ valueQuantity: { value: 120, unit: 'mmHg' } }]
        },
        serverQRItem: {
          linkId: 'blood-pressure',
          text: 'Blood Pressure',
          answer: [{ valueQuantity: { value: 140, unit: 'mmHg' } }] // From repop-tester data
        }
      }
    };

    it('should handle quantity values correctly', async () => {
      const user = userEvent.setup();
      renderDialog(quantityMockData);

      const fieldSection = screen.getByText('Blood Pressure').closest('div');
      if (fieldSection) {
        const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['blood-pressure'].serverQRItem.answer[0].valueQuantity.value).toBe(
          140
        );
      });
    });
  });

  describe('7. Repeating Items (Arrays)', () => {
    const arrayMockData = {
      'known-allergies': {
        qItem: {
          linkId: 'known-allergies',
          text: 'Known Allergies',
          type: 'string' as const,
          repeats: true
        },
        heading: 'Allergies',
        currentQRItems: [
          {
            linkId: 'known-allergies',
            text: 'Known Allergies',
            answer: [{ valueString: 'Peanuts' }]
          }
        ],
        serverQRItems: [
          {
            linkId: 'known-allergies',
            text: 'Known Allergies',
            answer: [{ valueString: 'Bee venom' }]
          },
          {
            linkId: 'known-allergies',
            text: 'Known Allergies',
            answer: [{ valueString: 'Penicillin' }]
          }
        ]
      }
    };

    it('should handle repeating items correctly', async () => {
      const user = userEvent.setup();
      renderDialog(arrayMockData);

      // For repeating items, we expect to see the field displayed
      expect(screen.getByText('Known Allergies')).not.toBeNull();

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['known-allergies']).toBeDefined();
      });
    });
  });

  describe('8. Group Items (Complex Structures)', () => {
    const groupMockData = {
      'medical-history': {
        qItem: {
          linkId: 'medical-history',
          text: 'Medical History',
          type: 'group' as const,
          repeats: true
        },
        heading: 'Medical History',
        currentQRItems: [
          {
            linkId: 'medical-history',
            item: [
              { linkId: 'condition', answer: [{ valueString: 'Diabetes' }] },
              { linkId: 'onset-date', answer: [{ valueDate: '2020-01-01' }] }
            ]
          }
        ],
        serverQRItems: [
          {
            linkId: 'medical-history',
            item: [
              { linkId: 'condition', answer: [{ valueString: 'Chronic kidney disease stage 3B' }] },
              { linkId: 'onset-date', answer: [{ valueDate: '2022-05-10' }] }
            ]
          }
        ]
      }
    };

    it('should handle group items correctly', async () => {
      const user = userEvent.setup();
      renderDialog(groupMockData);

      // For group items, the UI might show them differently
      // We'll look for the main field name - use getAllByText to handle multiple matches
      const medicalHistoryElements = screen.getAllByText('Medical History');
      expect(medicalHistoryElements.length).toBeGreaterThan(0);

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['medical-history']).toBeDefined();
      });
    });
  });

  describe('9. Mixed Preferences Scenario', () => {
    const mixedMockData = {
      weight: {
        qItem: {
          linkId: 'weight',
          text: 'Weight (kg)',
          type: 'decimal' as const
        },
        heading: 'Vital Signs',
        currentQRItem: {
          linkId: 'weight',
          text: 'Weight (kg)',
          answer: [{ valueDecimal: 75.5 }]
        },
        serverQRItem: {
          linkId: 'weight',
          text: 'Weight (kg)',
          answer: [{ valueDecimal: 77.3 }]
        }
      },
      height: {
        qItem: {
          linkId: 'height',
          text: 'Height (cm)',
          type: 'decimal' as const
        },
        heading: 'Vital Signs',
        currentQRItem: {
          linkId: 'height',
          text: 'Height (cm)',
          answer: [{ valueDecimal: 175.0 }]
        },
        serverQRItem: {
          linkId: 'height',
          text: 'Height (cm)',
          answer: [{ valueDecimal: 180.0 }]
        }
      }
    };

    it('should handle mixed preferences (some old, some new values)', async () => {
      const user = userEvent.setup();
      renderDialog(mixedMockData);

      // Select server value for weight
      const weightSection = screen.getByText('Weight (kg)').closest('div');
      if (weightSection) {
        const serverCheckbox = within(weightSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
        await user.click(serverCheckbox);
      }

      // Keep user value for height (default selection)
      const heightSection = screen.getByText('Height (cm)').closest('div');
      if (heightSection) {
        const userCheckbox = within(heightSection).getByLabelText(/YOUR CURRENT VALUE/i);
        await user.click(userCheckbox);
      }

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];

        // Weight should use server value
        expect(calledWithItems['weight'].serverQRItem.answer[0].valueDecimal).toBe(77.3);

        // Height should use user value
        expect(calledWithItems['height'].serverQRItem.answer[0].valueDecimal).toBe(175.0);
      });
    });
  });

  describe('10. Edge Cases and Error Scenarios', () => {
    const edgeCaseMockData = {
      'test-field': {
        qItem: {
          linkId: 'test-field',
          text: 'Test Field',
          type: 'string' as const
        },
        heading: 'Test',
        currentQRItem: {
          linkId: 'test-field',
          text: 'Test Field',
          answer: [{ valueString: 'old value' }]
        },
        serverQRItem: {
          linkId: 'test-field',
          text: 'Test Field',
          answer: [{ valueString: 'new value' }]
        }
      }
    };

    it('should handle no selections made before confirm', async () => {
      const user = userEvent.setup();
      renderDialog(edgeCaseMockData);

      // Don't make any selections, just confirm with defaults
      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        // With default selection (user current value), the field should still be included
        expect(calledWithItems['test-field']).toBeDefined();
      });
    });

    it('should handle cancel action', async () => {
      const user = userEvent.setup();
      renderDialog(edgeCaseMockData);

      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(mockOnCloseDialog).toHaveBeenCalled();
      expect(mockedRepopulateResponse).not.toHaveBeenCalled();
    });
  });

  describe('11. Integration with repop-tester Patient Data', () => {
    const realPatientData = {
      'patient-demographics': {
        qItem: {
          linkId: 'patient-demographics',
          text: 'Patient Demographics',
          type: 'group' as const
        },
        heading: 'Demographics',
        currentQRItem: {
          linkId: 'patient-demographics',
          item: [
            { linkId: 'family-name', answer: [{ valueString: 'Doe' }] },
            { linkId: 'given-name', answer: [{ valueString: 'John' }] }
          ]
        },
        serverQRItem: {
          linkId: 'patient-demographics',
          item: [
            { linkId: 'family-name', answer: [{ valueString: 'Form' }] },
            { linkId: 'given-name', answer: [{ valueString: 'Clever' }] }
          ]
        }
      }
    };

    it('should handle real patient data structure from FHIR server', async () => {
      const user = userEvent.setup();
      renderDialog(realPatientData);

      // For group items, we expect to see the field displayed
      expect(screen.getByText('Patient Demographics')).not.toBeNull();

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockedRepopulateResponse).toHaveBeenCalled();
        const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
        expect(calledWithItems['patient-demographics']).toBeDefined();
      });

      expect(mockOnCloseDialog).toHaveBeenCalled();
      expect(mockOnSpinnerChange).toHaveBeenCalledTimes(2);
    });
  });
});
