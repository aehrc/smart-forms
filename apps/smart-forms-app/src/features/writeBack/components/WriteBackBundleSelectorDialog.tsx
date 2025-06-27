import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Bundle, BundleEntry } from 'fhir/r4';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import {
  createSelectionKey,
  getFilteredBundleEntries,
  getPopulatedResourceMap,
  getValidEntries
} from '../utils/extractedBundleSelector.ts';
import WriteBackBundleSelectorItem from './WriteBackBundleSelectorItem.tsx';
import type { SavingWriteBackMode } from '../../renderer/utils/extract.ts';

interface WriteBackBundleSelectorProps {
  viewMode: 'renderer' | 'playground';
  dialogOpen: boolean;
  isSaving: SavingWriteBackMode;
  extractedBundle: Bundle;
  onCloseDialog: () => void;
  onWriteBackBundle: (bundleToWriteBack: Bundle, savingWriteBackMode: SavingWriteBackMode) => void;
  onDialogExited?: () => void;
}

function WriteBackBundleSelectorDialog(props: WriteBackBundleSelectorProps) {
  const {
    dialogOpen,
    isSaving,
    extractedBundle,
    onCloseDialog,
    onWriteBackBundle,
    onDialogExited
  } = props;

  const populatedContext = useQuestionnaireStore.use.populatedContext();

  // Get a map of populated resources so we can link FHIRPatch Parameters to their actual resource names
  const populatedResourceMap = useMemo(
    () => getPopulatedResourceMap(populatedContext),
    [populatedContext]
  );

  const allBundleEntries: BundleEntry[] = useMemo(
    () => extractedBundle.entry ?? [],
    [extractedBundle.entry]
  );

  // Exclude entries with these three criteria:
  // 1. BundleEntry no resource or request
  // 2. BundleEntry resource is a Parameters resource but is not a valid FHIRPatch
  // 3. BundleEntry resource is a FHIRPatch but has no "type", "path" or "value" in the operation parts
  const allValidEntries: Set<string> = useMemo(
    () => getValidEntries(allBundleEntries),
    [allBundleEntries]
  );

  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(allValidEntries);

  function isEntrySelected(
    bundleEntryIndex: number,
    operationEntryIndex?: number
  ): boolean | 'indeterminate' {
    const key = createSelectionKey(bundleEntryIndex, operationEntryIndex);

    // 1: Specific operation entry
    if (operationEntryIndex !== undefined) {
      return selectedEntries.has(key);
    }

    // Get all operation keys for provided bundleEntry
    const operationKeys = Array.from(allValidEntries).filter((k) =>
      k.startsWith(`bundle-${bundleEntryIndex}-operation-`)
    );

    // 2: bundle with operations — selected only if all its operations are selected
    if (operationKeys.length > 0) {
      const numOfSelectedOperations = operationKeys.filter((k) => selectedEntries.has(k)).length;
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
    return selectedEntries.has(key);
  }

  function handleToggleCheckbox(bundleEntryIndex: number, operationEntryIndex?: number) {
    const key = createSelectionKey(bundleEntryIndex, operationEntryIndex);
    setSelectedEntries((prev) => {
      const next = new Set(prev);

      // Get all operation keys for provided bundleEntry
      const operationKeys: string[] = Array.from(allValidEntries).filter((k) =>
        k.startsWith(`bundle-${bundleEntryIndex}-operation-`)
      );

      // 1. BundleEntry doesn't have operations — toggle just the bundleEntry
      if (operationKeys.length === 0 && allValidEntries.has(key)) {
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }

        return next;
      }

      // 2. BundleEntry has operations but operationEntryIndex not provided — toggle all operations
      if (operationEntryIndex === undefined) {
        // If all operations are selected, deselect all; otherwise, select all
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
    setSelectedEntries(allValidEntries);
  }

  function handleDeselectAll() {
    setSelectedEntries(new Set());
  }

  // Write back FHIR Bundle based on selected entries
  function handleWriteBack(savingWriteBackMode: SavingWriteBackMode) {
    const filteredEntries = getFilteredBundleEntries(selectedEntries, allBundleEntries);
    onWriteBackBundle(
      {
        ...extractedBundle,
        entry: filteredEntries
      },
      savingWriteBackMode
    );
  }

  const allValidEntriesSelected = selectedEntries.size === allValidEntries.size;

  // Button texts based on if view mode is in renderer or playground
  const writeBackButtonText =
    props.viewMode === 'renderer' ? 'Save as final and write back' : 'Write Back';
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
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select items to write back to patient record</Typography>
          <IconButton onClick={onCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Button
          onClick={allValidEntriesSelected ? handleDeselectAll : handleSelectAll}
          variant="outlined"
          size="small">
          {allValidEntriesSelected ? 'Deselect All' : 'Select All'}
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {allBundleEntries.map((bundleEntry, bundleEntryIndex) => {
            return (
              <WriteBackBundleSelectorItem
                key={bundleEntryIndex}
                bundleEntry={bundleEntry}
                bundleEntryIndex={bundleEntryIndex}
                selectedEntries={selectedEntries}
                allValidEntries={allValidEntries}
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
            {selectedEntries.size} of {allValidEntries.size} valid entries selected
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
                Save as final only
              </Button>
            ) : null}
            <Button
              loading={isSaving === 'saving-write-back'}
              onClick={() => {
                handleWriteBack('saving-write-back');
              }}
              disabled={selectedEntries.size === 0 || isSaving === 'saving-only'}>
              {writeBackButtonText} ({selectedEntries.size}{' '}
              {selectedEntries.size === 1 ? 'entry' : 'entries'})
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default WriteBackBundleSelectorDialog;
