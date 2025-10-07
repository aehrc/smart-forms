/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import { repopulateForm, repopulateResponse } from '@aehrc/smart-forms-renderer';
import { useMemo, useState } from 'react';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import StandardDialogTitle from '../../../components/Dialog/StandardDialogTitle.tsx';
import {
  createSelectionKey,
  getFilteredItemsToRepopulate,
  getItemsToRepopulateValidKeys,
  getRepopulatedItemTuplesByHeadingsMap
} from '../utils/itemsToRepopulateSelector.ts';
import RepopulateSelectorItem from './RepopulateSelectorItem.tsx';
import { useSnackbar } from 'notistack';
import { flushSync } from 'react-dom';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';

interface RepopulateSelectDialogProps {
  itemsToRepopulate: Record<string, ItemToRepopulate>;
  repopulatedContext: Record<string, any>;
  onCloseDialog: () => void;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RepopulateSelectDialog(props: RepopulateSelectDialogProps) {
  const { itemsToRepopulate, repopulatedContext, onCloseDialog, onSpinnerChange } = props;

  // Categorise itemsToRepopulate by headings for visual grouping in the UI
  const itemsToRepopulateTuplesByHeadingsMap = useMemo(
    () => getRepopulatedItemTuplesByHeadingsMap(itemsToRepopulate),
    [itemsToRepopulate]
  );

  // Exclude items with this criterion:
  // 1. A child item's current and server values are the same
  const allValidKeys: Set<string> = useMemo(
    () => getItemsToRepopulateValidKeys(itemsToRepopulateTuplesByHeadingsMap),
    [itemsToRepopulateTuplesByHeadingsMap]
  );

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(allValidKeys);

  const { enqueueSnackbar } = useSnackbar();

  function isEntrySelected(
    headingIndex: number,
    parentItemIndex: number,
    childItemIndex?: number
  ): boolean | 'indeterminate' {
    const key = createSelectionKey(headingIndex, parentItemIndex, childItemIndex);

    // 1: Specific child item
    if (childItemIndex !== undefined) {
      return selectedKeys.has(key);
    }

    // Get all child keys for the provided parent item
    const childKeys = Array.from(allValidKeys).filter((k) =>
      k.startsWith(`heading-${headingIndex}-parent-${parentItemIndex}-child-`)
    );

    // 2: Parent with children — selected only if all its children are selected
    if (childKeys.length > 0) {
      const numOfSelectedChildItems = childKeys.filter((k) => selectedKeys.has(k)).length;
      if (numOfSelectedChildItems === childKeys.length) {
        return true; // All children selected
      }
      if (numOfSelectedChildItems === 0) {
        return false;
      }
      if (numOfSelectedChildItems < childKeys.length) {
        return 'indeterminate';
      }
    }

    // 3: Standalone parent item — check direct selection
    return selectedKeys.has(key);
  }

  function handleToggleCheckbox(
    headingIndex: number,
    parentItemIndex: number,
    childItemIndex?: number
  ) {
    const key = createSelectionKey(headingIndex, parentItemIndex, childItemIndex);
    setSelectedKeys((prev) => {
      const next = new Set(prev);

      // Get all child keys for the provided parent item
      const childKeys: string[] = Array.from(allValidKeys).filter((k) =>
        k.startsWith(`heading-${headingIndex}-parent-${parentItemIndex}-child-`)
      );

      // 1. Parent item doesn't have children — toggle just the parent item
      if (childKeys.length === 0 && allValidKeys.has(key)) {
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      }

      // 2. Parent item has children but childItemIndex not provided — toggle all children
      if (childItemIndex === undefined) {
        // If all children are selected, unselect all; otherwise, select all
        const allSelected = childKeys.every((k) => next.has(k));
        childKeys.forEach((k) => (allSelected ? next.delete(k) : next.add(k)));
        return next;
      }

      // 3. Parent item has children and childItemIndex provided — toggle just the child item
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handleSelectAll() {
    setSelectedKeys(allValidKeys);
  }

  function handleUnselectAll() {
    setSelectedKeys(new Set());
  }

  async function handleRepopulateIntoResponse() {
    const filteredItemsToRepopulate = getFilteredItemsToRepopulate(
      itemsToRepopulateTuplesByHeadingsMap,
      selectedKeys,
      itemsToRepopulate
    );

    // Prevent state batching for this spinner https://react.dev/reference/react-dom/flushSync
    flushSync(() => {
      onSpinnerChange({
        isSpinning: true,
        status: 'repopulate-write',
        message: 'Re-populating form...'
      });
    });

    // Re-populate filtered items into the QR
    const repopulatedResponse = repopulateResponse(filteredItemsToRepopulate);

    // Re-run buildForm with the new populatedResponse and repopulatedContext from the $populate operation
    repopulateForm({
      questionnaireResponse: repopulatedResponse,
      additionalVariables: repopulatedContext
    });

    onCloseDialog();
    enqueueSnackbar('Form re-populated', {
      preventDuplicate: true,
      action: <CloseSnackbar />
    });
    onSpinnerChange({ isSpinning: false, status: 'repopulated', message: '' });
  }

  const allSelectorKeysSelected = selectedKeys.size === allValidKeys.size;

  return (
    <Dialog open={true} onClose={onCloseDialog} maxWidth="md" fullWidth>
      <StandardDialogTitle onCloseDialog={onCloseDialog}>
        Select items to re-populate into the form
      </StandardDialogTitle>

      <DialogContent dividers>
        <Button
          onClick={allSelectorKeysSelected ? handleUnselectAll : handleSelectAll}
          variant="outlined"
          size="small">
          {allSelectorKeysSelected ? 'Unselect All' : 'Select All'}
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
          {Array.from(itemsToRepopulateTuplesByHeadingsMap.entries()).map(
            ([heading, tuples], headingIndex) => (
              <Box key={headingIndex} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {heading || 'Other'}
                </Typography>
                {tuples.map(([, itemToRepopulate], parentItemIndex) => (
                  <Box key={parentItemIndex} mb={2}>
                    <RepopulateSelectorItem
                      itemToRepopulate={itemToRepopulate}
                      headingIndex={headingIndex}
                      parentItemIndex={parentItemIndex}
                      selectedKeys={selectedKeys}
                      allValidKeys={allValidKeys}
                      isEntrySelected={isEntrySelected}
                      onToggleCheckbox={handleToggleCheckbox}
                    />
                  </Box>
                ))}
              </Box>
            )
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pl: 1
          }}>
          <Typography component="div" variant="body2" color="text.secondary">
            {selectedKeys.size} of {allValidKeys.size} items selected
          </Typography>

          <Box display="flex" gap={1}>
            <Button onClick={onCloseDialog}>Cancel</Button>
            <Button
              disabled={selectedKeys.size === 0}
              onClick={async () => {
                await handleRepopulateIntoResponse();
              }}>
              Re-populate form ({selectedKeys.size} {selectedKeys.size === 1 ? 'item' : 'items'})
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default RepopulateSelectDialog;
