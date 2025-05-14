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
  const { itemsToRepopulate, onCloseDialog, onSpinnerChange } = props;

  const updatePopulatedProperties = useQuestionnaireStore.use.updatePopulatedProperties();
  const setUpdatableResponseAsPopulated =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsPopulated();

  const { itemsToRepopulateTuplesByHeadings } = useMemo(
    () => getRepopulatedItemTuplesByHeadings(itemsToRepopulate),
    [itemsToRepopulate]
  );

  // userPrefersTheirCurrentFormValue[linkId]:
  // true = user wants THEIR CURRENT FORM value (from itemsToRepopulate[linkId].oldQRItem)
  // false = user wants the SERVER'S SUGGESTED value (from itemsToRepopulate[linkId].newQRItem)
  const [userPrefersTheirCurrentFormValue, setUserPrefersTheirCurrentFormValue] = useState<Record<string, boolean | undefined>>(() => {
    const initialPrefs: Record<string, boolean | undefined> = {};
    Object.keys(itemsToRepopulate).forEach(linkId => {
      initialPrefs[linkId] = true; // Default to user preferring THEIR CURRENT FORM VALUE
    });
    return initialPrefs;
  });
  
  const { enqueueSnackbar } = useSnackbar();

  // This callback is triggered by SimplifiedRepopulateItemSwitcher
  // iPrefersTheirFormVal: true if user ticked "YOUR CURRENT VALUE" checkbox
  function handleValuePreferenceChange(linkId: string, iPreferMyCurrentFormValue: boolean | undefined) {
    console.log(`Dialog: Preference for ${linkId} - User Prefers THEIR CURRENT FORM Value = ${iPreferMyCurrentFormValue}`);
    setUserPrefersTheirCurrentFormValue(prev => ({
      ...prev,
      [linkId]: iPreferMyCurrentFormValue 
    }));
  }

  async function handleConfirmRepopulate() {
    const linkIdsToRepopulate = Object.keys(userPrefersTheirCurrentFormValue).filter(linkId => userPrefersTheirCurrentFormValue[linkId] !== undefined);
    
    const itemsToActuallyRepopulate: Record<string, ItemToRepopulate> = {};
    linkIdsToRepopulate.forEach(linkId => {
      if (itemsToRepopulate[linkId]) {
        itemsToActuallyRepopulate[linkId] = JSON.parse(JSON.stringify(itemsToRepopulate[linkId]));
      }
    });

    console.log("Final items considered for repopulation:", JSON.stringify(itemsToActuallyRepopulate, null, 2));
    console.log("Final preference state (userPrefersTheirCurrentFormValue map):", userPrefersTheirCurrentFormValue);

    for (const [linkId, item] of Object.entries(itemsToActuallyRepopulate)) {
      const userWantsTheirCurrentValue = userPrefersTheirCurrentFormValue[linkId]; 
      
      console.log(`Repopulating ${linkId}: User preference is to use THEIR CURRENT FORM VALUE = ${userWantsTheirCurrentValue}`);

      // Based on senior dev: item.oldQRItem IS USER'S CURRENT, item.newQRItem IS SERVER'S SUGGESTION
      const userCurrentData = item.oldQRItem;    
      const serverSuggestedData = item.newQRItem;  
      const userCurrentItemsData = item.oldQRItems;  
      const serverSuggestedItemsData = item.newQRItems; 

      console.log(`  For ${linkId} - User Current Data (from renderer oldQRItem/Items):`, JSON.stringify(userCurrentData || userCurrentItemsData, null, 2));
      console.log(`  For ${linkId} - Server Suggested Data (from renderer newQRItem/Items):`, JSON.stringify(serverSuggestedData || serverSuggestedItemsData, null, 2));

      if (userWantsTheirCurrentValue === true) { 
        console.log(`  ACTION: Applying USER'S CURRENT FORM value for ${linkId}`);
        if (userCurrentData && item.newQRItem) { // item.newQRItem will be used for the new response, so populate it with user's current data
          item.newQRItem = JSON.parse(JSON.stringify(userCurrentData));
        }
        if (userCurrentItemsData && item.newQRItems) { 
          item.newQRItems = JSON.parse(JSON.stringify(userCurrentItemsData));
        }
      } else if (userWantsTheirCurrentValue === false) { // User wants SERVER'S SUGGESTED value
        console.log(`  ACTION: Applying SERVER SUGGESTED value for ${linkId}`);
        if (serverSuggestedData && item.newQRItem) {
            item.newQRItem = JSON.parse(JSON.stringify(serverSuggestedData));
        }
        if (serverSuggestedItemsData && item.newQRItems) {
            item.newQRItems = JSON.parse(JSON.stringify(serverSuggestedItemsData));
        }
      } else {
        console.warn(`Item ${linkId} had UNDEFINED preference. Defaulting to USER'S CURRENT FORM value.`);
        if (userCurrentData && item.newQRItem) {
            item.newQRItem = JSON.parse(JSON.stringify(userCurrentData));
        }
        if (userCurrentItemsData && item.newQRItems) {
            item.newQRItems = JSON.parse(JSON.stringify(userCurrentItemsData));
        }
      }
      console.log(`  For ${linkId}, after applying preference, item.newQRItem/Items that will be used for repopulateResponse:`, 
        JSON.stringify(item.newQRItem, null, 2), 
        JSON.stringify(item.newQRItems, null, 2)
      );
    }

    console.log("FINAL itemsToActuallyRepopulate being sent to repopulateResponse:", 
      JSON.stringify(itemsToActuallyRepopulate, null, 2)
    );

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
          onValuePreferenceChange={handleValuePreferenceChange}
          initialPreferences={userPrefersTheirCurrentFormValue}
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
