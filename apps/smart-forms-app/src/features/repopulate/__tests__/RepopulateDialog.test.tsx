import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import RepopulateSelectDialog from '../components/RepopulateSelectDialog';
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

describe('Vitest Setup Verification', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should be able to mock functions', () => {
    const mockFn = vi.fn().mockReturnValue('mocked value');
    expect(mockFn()).toBe('mocked value');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

// New test suite for Single Date Field Repopulation Scenarios
describe('RepopulateSelectDialog Single Date Field Scenarios', () => {
  // Mock data for a single date field
  const singleDateFieldItem = {
    linkId: 'single-date-field',
    text: 'Single Date Field',
    type: 'date' as const // Ensure type is correctly narrowed
  };

  const mockSingleDateItemToRepopulate = {
    [singleDateFieldItem.linkId]: {
      qItem: singleDateFieldItem,
      heading: 'Test Section',
      currentQRItem: {
        linkId: singleDateFieldItem.linkId,
        text: singleDateFieldItem.text,
        answer: [{ valueDate: '2023-01-01' }]
      },
      serverQRItem: {
        linkId: singleDateFieldItem.linkId,
        text: singleDateFieldItem.text,
        answer: [{ valueDate: '2023-01-15' }]
      }
    }
  };

  const mockOnCloseDialog = vi.fn();
  const mockOnSpinnerChange = vi.fn();

  // Helper to render the dialog with necessary providers
  const renderDialog = (itemsToRepopulate: any) => {
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
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('Scenario 1: Choose user current value and confirm', async () => {
    const user = userEvent.setup();
    renderDialog(mockSingleDateItemToRepopulate);

    // Find the field section and select user current value
    const fieldSection = screen.getByText('Single Date Field').closest('div');
    expect(fieldSection).not.toBeNull();

    if (fieldSection) {
      const userCheckbox = within(fieldSection).getByLabelText(/YOUR CURRENT VALUE/i);
      await user.click(userCheckbox);
    }

    // Click Confirm
    await user.click(screen.getByRole('button', { name: /Confirm/i }));

    // Verify repopulateResponse is called with the user's current value
    await waitFor(() => {
      expect(mockedRepopulateResponse).toHaveBeenCalled();
      const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
      // When user prefers their current value, the system should replace server data with user data
      expect(calledWithItems[singleDateFieldItem.linkId].serverQRItem.answer[0].valueDate).toBe(
        '2023-01-01'
      );
    });

    expect(mockOnCloseDialog).toHaveBeenCalled();
    expect(mockOnSpinnerChange).toHaveBeenCalledTimes(2); // Once for starting, once for stopping
  });

  it('Scenario 2: Choose server suggested value and confirm', async () => {
    const user = userEvent.setup();
    renderDialog(mockSingleDateItemToRepopulate);

    // Find the field section and select server suggested value
    const fieldSection = screen.getByText('Single Date Field').closest('div');
    expect(fieldSection).not.toBeNull();

    if (fieldSection) {
      const serverCheckbox = within(fieldSection).getByLabelText(/SUGGESTED \(SERVER\)/i);
      await user.click(serverCheckbox);
    }

    // Click Confirm
    await user.click(screen.getByRole('button', { name: /Confirm/i }));

    // Verify repopulateResponse is called with the server suggested value
    await waitFor(() => {
      expect(mockedRepopulateResponse).toHaveBeenCalled();
      const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
      // The serverQRItem should remain as is with the server value
      expect(calledWithItems[singleDateFieldItem.linkId].serverQRItem.answer[0].valueDate).toBe(
        '2023-01-15'
      );
    });
    expect(mockOnCloseDialog).toHaveBeenCalled();
    expect(mockOnSpinnerChange).toHaveBeenCalledTimes(2);
  });

  it('Scenario 3: Default state (user value selected) and confirm', async () => {
    const user = userEvent.setup();
    renderDialog(mockSingleDateItemToRepopulate);

    // Verify that user current value is selected by default
    const fieldSection = screen.getByText('Single Date Field').closest('div');
    expect(fieldSection).not.toBeNull();

    if (fieldSection) {
      const userCheckbox = within(fieldSection).getByLabelText(
        /YOUR CURRENT VALUE/i
      ) as HTMLInputElement;
      const serverCheckbox = within(fieldSection).getByLabelText(
        /SUGGESTED \(SERVER\)/i
      ) as HTMLInputElement;

      // By default, user current value should be checked
      expect(userCheckbox.checked).toBe(true);
      expect(serverCheckbox.checked).toBe(false);
    }

    // Click Confirm without changing anything
    await user.click(screen.getByRole('button', { name: /Confirm/i }));

    // Verify repopulateResponse is called with the user's current value (default selection)
    await waitFor(() => {
      expect(mockedRepopulateResponse).toHaveBeenCalled();
      const calledWithItems = mockedRepopulateResponse.mock.calls[0][0];
      expect(calledWithItems[singleDateFieldItem.linkId].serverQRItem.answer[0].valueDate).toBe(
        '2023-01-01'
      );
    });
    expect(mockOnCloseDialog).toHaveBeenCalled();
    expect(mockOnSpinnerChange).toHaveBeenCalledTimes(2);
  });
});
