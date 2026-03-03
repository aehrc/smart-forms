import { useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import type { Bundle, BundleEntry } from 'fhir/r4';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import {
  createSelectionKey,
  getEntriesValidKeys,
  getFilteredBundleEntries,
  getPopulatedResourceMap
} from '../utils/extractedBundleSelector.ts';
import WriteBackBundleSelectorItem from './WriteBackBundleSelectorItem.tsx';
import type { SavingWriteBackMode } from '../../renderer/utils/extract.ts';
import StandardDialogTitle from '../../../components/Dialog/StandardDialogTitle.tsx';

interface WriteBackBundleSelectorProps {
  viewMode: 'renderer' | 'playground';
  dialogOpen: boolean;
  isSaving: SavingWriteBackMode;
  isAmendment?: boolean;
  extractedBundle: Bundle;
  onCloseDialog: () => void;
  onWriteBackBundle: (bundleToWriteBack: Bundle, savingWriteBackMode: SavingWriteBackMode) => void;
  onDialogExited?: () => void;
}

function WriteBackBundleSelectorDialog(props: WriteBackBundleSelectorProps) {
  const {
    dialogOpen,
    isSaving,
    isAmendment,
    extractedBundle,
    onCloseDialog,
    onWriteBackBundle,
    onDialogExited
  } = props;

  const additionalContext = useQuestionnaireStore.use.additionalContext();

  // Get a map of populated resources so we can link FHIRPatch Parameters to their actual resource names
  const populatedResourceMap = useMemo(
    () => getPopulatedResourceMap(additionalContext),
    [additionalContext]
  );

  const allBundleEntries: BundleEntry[] = useMemo(
    () => extractedBundle.entry ?? [],
    [extractedBundle.entry]
  );

  // Exclude entries with these three criteria:
  // 1. BundleEntry no resource or request
  // 2. BundleEntry resource is a Parameters resource but is not a valid FHIRPatch
  // 3. BundleEntry resource is a FHIRPatch but has no "type", "path" or "value" in the operation parts
  const allValidKeys: Set<string> = useMemo(
    () => getEntriesValidKeys(allBundleEntries),
    [allBundleEntries]
  );

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(allValidKeys);

  function isEntrySelected(
    bundleEntryIndex: number,
    operationEntryIndex?: number
  ): boolean | 'indeterminate' {
    const key = createSelectionKey(bundleEntryIndex, operationEntryIndex);

    // 1: Specific operation entry
    if (operationEntryIndex !== undefined) {
      return selectedKeys.has(key);
    }

    // Get all operation keys for provided bundleEntry
    const operationKeys = Array.from(allValidKeys).filter((k) =>
      k.startsWith(`bundle-${bundleEntryIndex}-operation-`)
    );

    // 2: bundle with operations — selected only if all its operations are selected
    if (operationKeys.length > 0) {
      const numOfSelectedOperations = operationKeys.filter((k) => selectedKeys.has(k)).length;
      if (numOfSelectedOperations === operationKeys.length) {
        return true; // All operations selected
      }

      if (numOfSelectedOperations === 0) {
        return false;
      }

      if (numOfSelectedOperations < operationKeys.length) {
        return 'indeterminate';
      }
    }

    // 3: standalone bundle — check direct selection
    return selectedKeys.has(key);
  }

  function handleToggleCheckbox(bundleEntryIndex: number, operationEntryIndex?: number) {
    const key = createSelectionKey(bundleEntryIndex, operationEntryIndex);
    setSelectedKeys((prev) => {
      const next = new Set(prev);

      // Get all operation keys for provided bundleEntry
      const operationKeys: string[] = Array.from(allValidKeys).filter((k) =>
        k.startsWith(`bundle-${bundleEntryIndex}-operation-`)
      );

      // 1. BundleEntry doesn't have operations — toggle just the bundleEntry
      if (operationKeys.length === 0 && allValidKeys.has(key)) {
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }

        return next;
      }

      // 2. BundleEntry has operations but operationEntryIndex not provided — toggle all operations
      if (operationEntryIndex === undefined) {
        // If all operations are selected, unselect all; otherwise, select all
        const allSelected = operationKeys.every((k) => next.has(k));
        operationKeys.forEach((k) => (allSelected ? next.delete(k) : next.add(k)));

        return next;
      }

      // 3. BundleEntry has operations and operationEntryIndex provided — toggle just the operation
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

  // Write back FHIR Bundle based on selected entries
  function handleWriteBack(savingWriteBackMode: SavingWriteBackMode) {
    const filteredEntries = getFilteredBundleEntries(selectedKeys, allBundleEntries);
    onWriteBackBundle(
      {
        ...extractedBundle,
        entry: filteredEntries
      },
      savingWriteBackMode
    );
  }

  const allValidKeysSelected = selectedKeys.size === allValidKeys.size;

  // Button texts based on if view mode is in renderer or playground
  const writeBackButtonText =
    props.viewMode === 'renderer'
      ? `Save as ${isAmendment ? 'amendment' : 'final'} and write back`
      : 'Write Back';
  const showSaveOnlyButton = props.viewMode === 'renderer';

  return (
    <Dialog
      open={dialogOpen}
      onClose={onCloseDialog}
      maxWidth="md"
      fullWidth
      slotProps={{
        transition: {
          onExited: onDialogExited
        }
      }}>
      <StandardDialogTitle onCloseDialog={onCloseDialog}>
        Select items to write back to patient record
      </StandardDialogTitle>

      <DialogContent dividers>
        <Button
          onClick={allValidKeysSelected ? handleUnselectAll : handleSelectAll}
          variant="outlined"
          size="small">
          {allValidKeysSelected ? 'Unselect All' : 'Select All'}
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {allBundleEntries.map((bundleEntry, bundleEntryIndex) => {
            return (
              <WriteBackBundleSelectorItem
                key={bundleEntryIndex}
                bundleEntry={bundleEntry}
                bundleEntryIndex={bundleEntryIndex}
                selectedKeys={selectedKeys}
                allValidKeys={allValidKeys}
                populatedResourceMap={populatedResourceMap}
                isEntrySelected={isEntrySelected}
                onToggleCheckbox={handleToggleCheckbox}
              />
            );
          })}
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
            {selectedKeys.size} of {allValidKeys.size} valid entries selected
          </Typography>

          <Box display="flex" gap={1}>
            <Button onClick={onCloseDialog} disabled={!!isSaving}>
              Cancel
            </Button>
            {showSaveOnlyButton ? (
              <Button
                loading={isSaving === 'saving-only'}
                onClick={() => {
                  handleWriteBack('saving-only');
                }}
                disabled={isSaving === 'saving-write-back'}>
                Save as {isAmendment ? 'amendment' : 'final'} only
              </Button>
            ) : null}
            <Button
              loading={isSaving === 'saving-write-back'}
              onClick={() => {
                handleWriteBack('saving-write-back');
              }}
              disabled={selectedKeys.size === 0 || isSaving === 'saving-only'}>
              {writeBackButtonText} ({selectedKeys.size}{' '}
              {selectedKeys.size === 1 ? 'entry' : 'entries'})
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default WriteBackBundleSelectorDialog;
