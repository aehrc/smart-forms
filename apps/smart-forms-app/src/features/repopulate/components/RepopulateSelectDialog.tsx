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
  // For complex fields, we also track granular preferences like "linkId:fieldId" or "linkId-row0:fieldId"
  const [userPrefersTheirCurrentFormValue, setUserPrefersTheirCurrentFormValue] = useState<Record<string, boolean | undefined>>(() => {
    const initialPrefs: Record<string, boolean | undefined> = {};
    Object.keys(itemsToRepopulate).forEach(linkId => {
      initialPrefs[linkId] = true; // Default to user preferring THEIR CURRENT FORM VALUE
    });
    return initialPrefs;
  });
  
  // Track granular preferences for complex fields (e.g., medical history table fields)
  const [granularPreferences, setGranularPreferences] = useState<Record<string, boolean | undefined>>({});
  
  const { enqueueSnackbar } = useSnackbar();

  // This callback is triggered by SimplifiedRepopulateItemSwitcher
  // iPrefersTheirFormVal: true if user ticked "YOUR CURRENT VALUE" checkbox
  function handleValuePreferenceChange(linkId: string, iPreferMyCurrentFormValue: boolean | undefined) {
    console.log(`🔧 DIALOG FIX: Preference for ${linkId} - User Prefers THEIR CURRENT FORM Value = ${iPreferMyCurrentFormValue}`);
    
    // Check if this is a granular preference (contains special characters indicating sub-field)
    const isGranularPreference = linkId.includes(':') || linkId.includes('-row');
    
    if (isGranularPreference) {
      // Store granular preference
      console.log(`  📝 Storing granular preference: ${linkId} = ${iPreferMyCurrentFormValue}`);
      setGranularPreferences(prev => {
        const updated = {
          ...prev,
          [linkId]: iPreferMyCurrentFormValue 
        };
        console.log(`  📝 Updated granular preferences:`, updated);
        return updated;
      });
      
      // Extract the main linkId from the granular preference
      const mainLinkId = linkId.split(':')[0].split('-row')[0];
      console.log(`  Granular preference for ${linkId}, main linkId: ${mainLinkId}`);
      
      // Don't update the main preference here - we'll aggregate later
    } else {
      // Regular top-level preference
      console.log(`  📝 Storing regular preference: ${linkId} = ${iPreferMyCurrentFormValue}`);
      setUserPrefersTheirCurrentFormValue(prev => {
        const updated = {
          ...prev,
          [linkId]: iPreferMyCurrentFormValue 
        };
        console.log(`  📝 Updated regular preferences:`, updated);
        return updated;
      });
    }
  }

  async function handleConfirmRepopulate() {
    console.log("🔧 REPOPULATE FIX: Starting handleConfirmRepopulate with granular preference support");
    console.log("🔧 FINAL STATE CHECK - Regular preferences:", userPrefersTheirCurrentFormValue);
    console.log("🔧 FINAL STATE CHECK - Granular preferences:", granularPreferences);
    
    // Include items from both regular preferences and items that have granular preferences
    const linkIdsFromRegularPrefs = Object.keys(userPrefersTheirCurrentFormValue).filter(linkId => userPrefersTheirCurrentFormValue[linkId] !== undefined);
    const linkIdsFromGranularPrefs = Object.keys(granularPreferences)
      .map(granularKey => granularKey.split(':')[0].split('-row')[0]) // Extract main linkId
      .filter((linkId, index, array) => array.indexOf(linkId) === index); // Remove duplicates
    
    const allLinkIdsToRepopulate = [...new Set([...linkIdsFromRegularPrefs, ...linkIdsFromGranularPrefs])];
    console.log("🔧 REPOPULATE FIX: linkIdsFromRegularPrefs:", linkIdsFromRegularPrefs);
    console.log("🔧 REPOPULATE FIX: linkIdsFromGranularPrefs:", linkIdsFromGranularPrefs);
    console.log("🔧 REPOPULATE FIX: allLinkIdsToRepopulate:", allLinkIdsToRepopulate);
    
    const itemsToActuallyRepopulate: Record<string, ItemToRepopulate> = {};
    allLinkIdsToRepopulate.forEach(linkId => {
      if (itemsToRepopulate[linkId]) {
        itemsToActuallyRepopulate[linkId] = JSON.parse(JSON.stringify(itemsToRepopulate[linkId]));
      }
    });

    console.log("Final items considered for repopulation:", JSON.stringify(itemsToActuallyRepopulate, null, 2));
    console.log("Final preference state (userPrefersTheirCurrentFormValue map):", userPrefersTheirCurrentFormValue);
    console.log("Granular preferences:", granularPreferences);

    for (const [linkId, item] of Object.entries(itemsToActuallyRepopulate)) {
      const userWantsTheirCurrentValue = userPrefersTheirCurrentFormValue[linkId]; 
      
      console.log(`Repopulating ${linkId}: User preference is to use THEIR CURRENT FORM VALUE = ${userWantsTheirCurrentValue}`);

      // Check if this item has granular preferences
      const granularPrefsForThisItem = Object.keys(granularPreferences).filter(key => 
        key.startsWith(linkId + ':') || key.startsWith(linkId + '-row')
      );
      
      if (granularPrefsForThisItem.length > 0) {
        console.log(`  Item ${linkId} has granular preferences:`, granularPrefsForThisItem);
        console.log(`  All granular preferences for debugging:`, granularPreferences);
        
        // Let's also check what granular preferences exist for this specific linkId
        const allGranularKeysForThisItem = Object.keys(granularPreferences).filter(key => 
          key.startsWith(linkId)
        );
        console.log(`  All granular keys starting with ${linkId}:`, allGranularKeysForThisItem);
        
        // Handle complex field with granular preferences
        const userCurrentData = item.oldQRItem;    
        const serverSuggestedData = item.newQRItem;  
        const userCurrentItemsData = item.oldQRItems;  
        const serverSuggestedItemsData = item.newQRItems; 

        // For complex fields, we need to selectively apply preferences
        if (item.newQRItems && item.oldQRItems) {
          // Handle repeating groups (like medical history table)
          console.log(`  Processing repeating group with ${item.newQRItems.length} server rows and ${item.oldQRItems.length} user rows`);
          
          const processedRows = [...item.newQRItems]; // Start with server data
          
          // When we have granular preferences, we need to ensure ALL fields are handled correctly
          // Fields with explicit granular preferences will be processed below
          // Fields without explicit granular preferences should keep server data (which they already have)
          
          granularPrefsForThisItem.forEach(granularKey => {
            const preference = granularPreferences[granularKey];
            console.log(`    Processing granular preference ${granularKey} = ${preference}`);
            
            if (preference === true) { // User wants their current value
              // Parse the granular key to extract row and field info
              // Key format: "mainLinkId-row0:fieldLinkId" or "mainLinkId:fieldLinkId"
              console.log(`      Parsing granular key: ${granularKey}`);
              
              const keyWithoutMainLinkId = granularKey.substring(linkId.length);
              console.log(`      Key without main linkId: ${keyWithoutMainLinkId}`);
              
              let rowIndex: number | null = null;
              let fieldLinkId: string | null = null;
              
              if (keyWithoutMainLinkId.startsWith('-row')) {
                // Format: "-row0:fieldLinkId"
                const rowMatch = keyWithoutMainLinkId.match(/^-row(\d+):(.+)$/);
                if (rowMatch) {
                  rowIndex = parseInt(rowMatch[1]);
                  fieldLinkId = rowMatch[2];
                }
              } else if (keyWithoutMainLinkId.startsWith(':')) {
                // Format: ":fieldLinkId" (no row, single item)
                fieldLinkId = keyWithoutMainLinkId.substring(1);
              }
              
              console.log(`      Parsed rowIndex: ${rowIndex}, fieldLinkId: ${fieldLinkId}`);
              
              if (rowIndex !== null && fieldLinkId && item.oldQRItems) {
                console.log(`      Applying user preference for row ${rowIndex}, field ${fieldLinkId}`);
                console.log(`      Available oldQRItems rows: ${item.oldQRItems.length}`);
                console.log(`      Available processedRows: ${processedRows.length}`);
                
                if (rowIndex < item.oldQRItems.length && rowIndex < processedRows.length) {
                  const userRowData = item.oldQRItems[rowIndex];
                  console.log(`      User row data for row ${rowIndex}:`, JSON.stringify(userRowData, null, 2));
                  
                  const userFieldData = userRowData?.item?.find(i => i.linkId === fieldLinkId);
                  console.log(`      User field data for ${fieldLinkId}:`, JSON.stringify(userFieldData, null, 2));
                  
                  if (userFieldData && processedRows[rowIndex]?.item) {
                    console.log(`      Server row data before replacement:`, JSON.stringify(processedRows[rowIndex], null, 2));
                    
                    // Replace the specific field in the server row with user data
                    const fieldIndex = processedRows[rowIndex].item!.findIndex(i => i.linkId === fieldLinkId);
                    console.log(`      Field index for ${fieldLinkId}: ${fieldIndex}`);
                    
                    if (fieldIndex >= 0) {
                      const originalServerFieldData = JSON.parse(JSON.stringify(processedRows[rowIndex].item![fieldIndex]));
                      processedRows[rowIndex].item![fieldIndex] = JSON.parse(JSON.stringify(userFieldData));
                      console.log(`        ✅ REPLACED field ${fieldLinkId} in row ${rowIndex}`);
                      console.log(`        Original server data:`, JSON.stringify(originalServerFieldData, null, 2));
                      console.log(`        New user data:`, JSON.stringify(processedRows[rowIndex].item![fieldIndex], null, 2));
                    } else {
                      console.log(`        ❌ Field ${fieldLinkId} not found in server row ${rowIndex}`);
                    }
                  } else {
                    console.log(`        ❌ User field data not found or server row missing items`);
                    console.log(`        userFieldData exists: ${!!userFieldData}`);
                    console.log(`        processedRows[${rowIndex}]?.item exists: ${!!processedRows[rowIndex]?.item}`);
                  }
                } else {
                  console.log(`        ❌ Row index ${rowIndex} out of bounds (oldQRItems: ${item.oldQRItems.length}, processedRows: ${processedRows.length})`);
                }
              } else {
                console.log(`        ❌ Invalid parsing result - rowIndex: ${rowIndex}, fieldLinkId: ${fieldLinkId}, oldQRItems exists: ${!!item.oldQRItems}`);
              }
            } else if (preference === false) {
              console.log(`      Keeping server data for ${granularKey} (user chose server value)`);
              // No action needed - server data is already in processedRows
            } else {
              console.log(`      Undefined preference for ${granularKey}, defaulting to server data`);
              // No action needed - server data is already in processedRows
            }
          });
          
          console.log(`  Final processed rows for ${linkId}:`, JSON.stringify(processedRows, null, 2));
          item.newQRItems = processedRows;
        } else if (item.newQRItem && item.oldQRItem) {
          // Handle single complex items
          console.log(`  Processing single complex item`);
          // Similar logic could be applied for non-repeating complex fields if needed
        }
      } else {
        // No granular preferences, use the original logic
        const userCurrentData = item.oldQRItem;    
        const serverSuggestedData = item.newQRItem;  
        const userCurrentItemsData = item.oldQRItems;  
        const serverSuggestedItemsData = item.newQRItems; 

        console.log(`  For ${linkId} - User Current Data (from renderer oldQRItem/Items):`, JSON.stringify(userCurrentData || userCurrentItemsData, null, 2));
        console.log(`  For ${linkId} - Server Suggested Data (from renderer newQRItem/Items):`, JSON.stringify(serverSuggestedData || serverSuggestedItemsData, null, 2));

        if (userWantsTheirCurrentValue === true) { 
          console.log(`  ACTION: Applying USER'S CURRENT FORM value for ${linkId}`);
          // User wants their current value, so replace server suggestion with user's current data
          if (userCurrentData && item.newQRItem) {
            item.newQRItem = JSON.parse(JSON.stringify(userCurrentData));
          }
          if (userCurrentItemsData && item.newQRItems) { 
            item.newQRItems = JSON.parse(JSON.stringify(userCurrentItemsData));
          }
        } else if (userWantsTheirCurrentValue === false) { 
          console.log(`  ACTION: Applying SERVER SUGGESTED value for ${linkId}`);
          // User wants server's suggested value, so keep newQRItem/newQRItems as they are (they already contain server data)
          // No action needed - newQRItem and newQRItems already contain the server's suggested data
        } else {
          console.warn(`Item ${linkId} had UNDEFINED preference. Defaulting to USER'S CURRENT FORM value.`);
          if (userCurrentData && item.newQRItem) {
              item.newQRItem = JSON.parse(JSON.stringify(userCurrentData));
          }
          if (userCurrentItemsData && item.newQRItems) {
              item.newQRItems = JSON.parse(JSON.stringify(userCurrentItemsData));
          }
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
