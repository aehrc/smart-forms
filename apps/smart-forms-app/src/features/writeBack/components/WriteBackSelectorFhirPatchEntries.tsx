import { Box, Typography } from '@mui/material';
import type { FhirResource } from 'fhir/r4';
import { parametersIsFhirPatch } from '@aehrc/sdc-template-extract';
import {
  getFhirPatchOperationParts,
  getOperationEntryCounts
} from '../utils/extractedBundleSelector.ts';
import WriteBackSelectorFhirPatchEntry from './WriteBackSelectorFhirPatchEntry.tsx';

interface WriteBackSelectorFhirPatchItemProps {
  bundleEntryIndex: number;
  resource: FhirResource;
  selectedKeys: Set<string>;
  allValidKeys: Set<string>;
  isEntrySelected: (
    bundleEntryIndex: number,
    operationEntryIndex?: number
  ) => boolean | 'indeterminate';
  onToggleCheckbox: (bundleEntryIndex: number, operationEntryIndex?: number) => void;
}

function WriteBackSelectorFhirPatchEntries(props: WriteBackSelectorFhirPatchItemProps) {
  const {
    bundleEntryIndex,
    resource,
    selectedKeys,
    allValidKeys,
    isEntrySelected,
    onToggleCheckbox
  } = props;

  // Determine if resource is a FHIRPatch Parameters resource
  const resourceIsFhirPatch =
    resource.resourceType === 'Parameters' && parametersIsFhirPatch(resource);

  if (!resourceIsFhirPatch) {
    return (
      <Typography color="text.disabled">
        Parameters resource is not a FHIRPatch. Something might have went wrong.
      </Typography>
    );
  }

  // Get number of selected operations and valid operations
  const { numOfSelectedOperations, numOfValidOperations } = getOperationEntryCounts(
    bundleEntryIndex,
    selectedKeys,
    allValidKeys
  );

  return (
    <Box mt={1} ml={1}>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
        {numOfSelectedOperations} of {numOfValidOperations} valid entries selected
      </Typography>
      {resource.parameter.map((param, operationEntryIndex) => {
        const {
          type: operationType,
          path: operationPath,
          name: operationName,
          valuePart: operationValuePart,
          pathLabel: operationPathLabel
        } = getFhirPatchOperationParts(param);

        const operationEntrySelected = isEntrySelected(bundleEntryIndex, operationEntryIndex);

        return (
          <Box
            key={`${bundleEntryIndex}-${operationEntryIndex}`}
            sx={{
              ml: 0.5,
              mt: 1,
              px: 1,
              py: 0.5,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              borderLeft: 3,
              borderLeftColor: 'primary.main'
            }}>
            <WriteBackSelectorFhirPatchEntry
              operationType={operationType}
              operationPath={operationPath}
              operationValuePart={operationValuePart}
              operationName={operationName}
              operationPathLabel={operationPathLabel}
              bundleEntryIndex={bundleEntryIndex}
              operationEntryIndex={operationEntryIndex}
              operationEntrySelected={
                typeof operationEntrySelected === 'boolean' ? operationEntrySelected : false
              }
              onToggleCheckbox={onToggleCheckbox}
            />
          </Box>
        );
      })}
    </Box>
  );
}

export default WriteBackSelectorFhirPatchEntries;
