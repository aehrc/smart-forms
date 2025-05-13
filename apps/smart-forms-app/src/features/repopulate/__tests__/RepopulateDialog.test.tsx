import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import RepopulateSelectDialog from '../components/RepopulateSelectDialog';

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
      oldQRItem: {
        linkId: singleDateFieldItem.linkId,
        text: singleDateFieldItem.text,
        answer: [{ valueDate: '2023-01-01' }]
      },
      newQRItem: {
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
    // Reset the state of itemsToRepopulate by deep cloning if it's modified directly by the component
    // For this test, we'll assume RepopulateSelectDialog doesn't directly mutate the passed prop,
    // but if it did, we'd need a fresh copy for each test.
  });

  it('Scenario 1: Select field, choose OLD value, and confirm', async () => {
    const { container } = renderDialog(mockSingleDateItemToRepopulate);

    // 1. Check the main item checkbox
    const mainCheckbox = screen.getByRole('checkbox', { name: /Single Date Field/i });
    fireEvent.click(mainCheckbox);

    // 2. Select the "OLD VALUE" radio button
    // Radio buttons are best found by their label or value if name is shared
    // We assume radio buttons have distinct values "old" and "new" for their group
    // And the radio group is associated with the item's text
    
    // Find the radio buttons within the context of "Single Date Field"
    const listItem = screen.getByText('Single Date Field').closest('li');
    expect(listItem).not.toBeNull();

    if (listItem) {
        const oldValueRadio = within(listItem).getByLabelText(/OLD VALUE/i) as HTMLInputElement;
        fireEvent.click(oldValueRadio);
        expect(oldValueRadio.checked).toBe(true);
    }
    
    // 3. Click Confirm
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    // 4. Verify repopulateResponse is called with the OLD value
    await waitFor(() => {
      const repopulateFn = require('@aehrc/smart-forms-renderer').repopulateResponse;
      expect(repopulateFn).toHaveBeenCalled();
      const calledWithItems = repopulateFn.mock.calls[0][0];
      expect(calledWithItems[singleDateFieldItem.linkId].newQRItem.answer[0].valueDate).toBe('2023-01-01');
    });

    expect(mockOnCloseDialog).toHaveBeenCalled();
    expect(mockOnSpinnerChange).toHaveBeenCalledTimes(2); // Once for starting, once for stopping
  });

  it('Scenario 2: Select field, choose NEW value, and confirm', async () => {
    const { container } = renderDialog(mockSingleDateItemToRepopulate);

    // 1. Check the main item checkbox
    const mainCheckbox = screen.getByRole('checkbox', { name: /Single Date Field/i });
    fireEvent.click(mainCheckbox);
    
    // 2. Select the "NEW VALUE" radio button
    const listItem = screen.getByText('Single Date Field').closest('li');
    expect(listItem).not.toBeNull();

    if (listItem) {
        const newValueRadio = within(listItem).getByLabelText(/NEW VALUE/i) as HTMLInputElement;
        fireEvent.click(newValueRadio);
        expect(newValueRadio.checked).toBe(true);
    }

    // 3. Click Confirm
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    // 4. Verify repopulateResponse is called with the NEW value
    await waitFor(() => {
      const repopulateFn = require('@aehrc/smart-forms-renderer').repopulateResponse;
      expect(repopulateFn).toHaveBeenCalled();
      const calledWithItems = repopulateFn.mock.calls[0][0];
      // The newQRItem should remain as is or be explicitly set to the new value
      expect(calledWithItems[singleDateFieldItem.linkId].newQRItem.answer[0].valueDate).toBe('2023-01-15');
    });
    expect(mockOnCloseDialog).toHaveBeenCalled();
    expect(mockOnSpinnerChange).toHaveBeenCalledTimes(2);
  });

  it('Scenario 3: Do NOT select field (main checkbox unticked), and confirm', async () => {
    renderDialog(mockSingleDateItemToRepopulate);

    // 1. Main item checkbox remains UNCHECKED
    const mainCheckbox = screen.getByRole('checkbox', { name: /Single Date Field/i }) as HTMLInputElement;
    expect(mainCheckbox.checked).toBe(false); // Default state should be unchecked as per typical dialog behavior

    // 2. Click Confirm
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    // 3. Verify repopulateResponse is called with an empty object or without this item
    await waitFor(() => {
      const repopulateFn = require('@aehrc/smart-forms-renderer').repopulateResponse;
      expect(repopulateFn).toHaveBeenCalled();
      const calledWithItems = repopulateFn.mock.calls[0][0];
      expect(calledWithItems[singleDateFieldItem.linkId]).toBeUndefined();
      // Or, if it must be called with an empty object when nothing is selected:
      // expect(Object.keys(calledWithItems).length).toBe(0); 
    });
    expect(mockOnCloseDialog).toHaveBeenCalled();
    // Spinner might still change if the operation proceeds with no items
    expect(mockOnSpinnerChange).toHaveBeenCalledTimes(2); 
  });
}); 