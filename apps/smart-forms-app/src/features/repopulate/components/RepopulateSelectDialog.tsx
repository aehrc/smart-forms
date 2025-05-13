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

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import {
  repopulateResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import RepopulateList from './RepopulateList.tsx';
import { useMemo, useState } from 'react';
import {
  filterCheckedItemsToRepopulate,
  getRepopulatedItemTuplesByHeadings
} from '../utils/repopulateSorting.ts';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import { useSnackbar } from 'notistack';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import { flushSync } from 'react-dom';

interface RepopulateSelectDialogProps {
  itemsToRepopulate: Record<string, ItemToRepopulate>;
  onCloseDialog: () => void;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RepopulateSelectDialog(props: RepopulateSelectDialogProps) {
  const { itemsToRepopulate: initialItemsToRepopulate, onCloseDialog, onSpinnerChange } = props;

  // Apply the "dirty fix" here: swap oldQRItem and newQRItem
  const itemsToRepopulate = useMemo(() => {
    const correctedItems: Record<string, ItemToRepopulate> = {};
    for (const linkId in initialItemsToRepopulate) {
      const item = initialItemsToRepopulate[linkId];
      correctedItems[linkId] = {
        ...item,
        oldQRItem: item.newQRItem, // Swap: old becomes new
        newQRItem: item.oldQRItem, // Swap: new becomes old
        // Handle plural versions as well if they exist and are used
        oldQRItems: item.newQRItems, 
        newQRItems: item.oldQRItems
      };
      console.log(`Dirty Fix: Swapped old/new for ${linkId}`);
    }
    return correctedItems;
  }, [initialItemsToRepopulate]);

  const updatePopulatedProperties = useQuestionnaireStore.use.updatePopulatedProperties();
  const setUpdatableResponseAsPopulated =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsPopulated();

  const { itemsToRepopulateTuplesByHeadings } = useMemo(
    () => getRepopulatedItemTuplesByHeadings(itemsToRepopulate),
    [itemsToRepopulate]
  );

  // preferOldValues: true for old, false for new, undefined if neither selected initially or by user
  const [preferOldValues, setPreferOldValues] = useState<Record<string, boolean | undefined>>(() => {
    // Default all items to select the NEW value (preferOld = false)
    const initialPrefs: Record<string, boolean | undefined> = {};
    Object.keys(itemsToRepopulate).forEach(linkId => {
      initialPrefs[linkId] = false; // Default to NEW
    });
    return initialPrefs;
  });
  
  const { enqueueSnackbar } = useSnackbar();

  // This function is now called by SimplifiedRepopulateItemSwitcher
  // when either its OLD or NEW checkbox is changed.
  function handleValuePreferenceChange(linkId: string, preferOld: boolean | undefined) {
    console.log(`Dialog: Preference for ${linkId} set to ${preferOld === true ? 'OLD' : (preferOld === false ? 'NEW' : 'NONE')}`);
    setPreferOldValues(prev => ({
      ...prev,
      [linkId]: preferOld
    }));
  }

  // Function to determine the actual old/new date values from the item data
  function getDateValues(linkId: string, item: ItemToRepopulate) {
    const oldDateValue = item.oldQRItem?.answer?.[0]?.valueDate;
    const newDateValue = item.newQRItem?.answer?.[0]?.valueDate;
    console.log(`Real dates for ${linkId}: Old = ${oldDateValue}, New = ${newDateValue}`);
    return { oldDate: oldDateValue, newDate: newDateValue };
  }

  async function handleConfirmRepopulate() {
    // Items are considered "checked" or "selected for repopulation" if they have a preference set
    // (i.e., preferOldValues[linkId] is not undefined)
    const linkIdsToRepopulate = Object.keys(preferOldValues).filter(linkId => preferOldValues[linkId] !== undefined);
    
    const itemsToActuallyRepopulate: Record<string, ItemToRepopulate> = {};
    linkIdsToRepopulate.forEach(linkId => {
      if (itemsToRepopulate[linkId]) {
        itemsToActuallyRepopulate[linkId] = JSON.parse(JSON.stringify(itemsToRepopulate[linkId])); // Deep clone
      }
    });

    console.log("Items to actually repopulate based on preferences:", itemsToActuallyRepopulate);
    console.log("Current preferences state:", preferOldValues);

    for (const [linkId, item] of Object.entries(itemsToActuallyRepopulate)) {
      const preference = preferOldValues[linkId]; // Will be true (old), false (new)
      console.log(`Repopulating ${linkId}: User prefers ${preference ? "OLD" : "NEW"}`);

      if (preference === true) { // User wants OLD value
        if (item.oldQRItem && item.newQRItem) {
          item.newQRItem = JSON.parse(JSON.stringify(item.oldQRItem));
        }
        if (item.oldQRItems && item.newQRItems) {
          item.newQRItems = JSON.parse(JSON.stringify(item.oldQRItems));
        }
      } else if (preference === false) { // User wants NEW value
        // No change needed to item.newQRItem if it's already the new value
        // But for safety, especially with date fields, ensure it is the correct new one
        if (item.qItem?.type === 'date' && item.newQRItem && itemsToRepopulate[linkId]?.newQRItem) {
            const originalNewDate = itemsToRepopulate[linkId].newQRItem!.answer![0].valueDate;
            if (item.newQRItem.answer && item.newQRItem.answer[0]) {
                item.newQRItem.answer[0].valueDate = originalNewDate;
            }
        }
        // For medical history with item.newQRItems, ensure original new items are used
        if (item.qItem?.text?.includes('Medical history') && item.newQRItems && itemsToRepopulate[linkId]?.newQRItems) {
            item.newQRItems = JSON.parse(JSON.stringify(itemsToRepopulate[linkId].newQRItems));
        }

      } else {
        // This case should not happen if linkIdsToRepopulate is filtered correctly
        console.warn(`Item ${linkId} was in repopulation list but had no preference (undefined). Skipping.`);
        continue;
      }
    }

    flushSync(() => {
      onSpinnerChange({
        isSpinning: true,
        status: 'repopulate-write',
        message: 'Re-populating form...'
      });
    });

    if (Object.keys(itemsToActuallyRepopulate).length > 0) {
        const repopulatedResponse = repopulateResponse(itemsToActuallyRepopulate);
        const updatedResponse = await updatePopulatedProperties(repopulatedResponse, undefined, true);
        setUpdatableResponseAsPopulated(updatedResponse);
        enqueueSnackbar('Form re-populated', {
            preventDuplicate: true,
            action: <CloseSnackbar />
        });
    } else {
        enqueueSnackbar('No items were selected for re-population.', {
            variant: 'info',
            preventDuplicate: true,
            action: <CloseSnackbar />
        });
    }

    onCloseDialog();
    onSpinnerChange({ isSpinning: false, status: 'repopulated', message: '' });
  }

  return (
    <Dialog open={true} onClose={onCloseDialog} maxWidth="xl" fullWidth>
      <DialogTitle variant="h5">Select items to be re-populated</DialogTitle>
      <DialogContent>
        <RepopulateList
          itemsToRepopulateTuplesByHeadings={itemsToRepopulateTuplesByHeadings}
          // checkedLinkIds is no longer directly used by RepopulateList for selection control
          // isSelected prop on RepopulateListItem can be driven by preferOldValues if needed
          onValuePreferenceChange={handleValuePreferenceChange}
          initialPreferences={preferOldValues} // Pass initial preferences to list for Switcher
        />
      </DialogContent>
      <DialogActions>
        <Typography fontSize={10} color="text.secondary" sx={{ mx: 1.5 }}>
          Select which value to use for each field.
        </Typography>
        <Box flexGrow={1} />
        <Button onClick={onCloseDialog}>Cancel</Button>
        <Button onClick={handleConfirmRepopulate}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RepopulateSelectDialog;
