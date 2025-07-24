import { Box, Checkbox, Chip, Typography } from '@mui/material';
import {
  getChipMethodDetails,
  getFhirPatchResourceDisplay,
  getResourceDisplay
} from '../utils/extractedBundleSelector.ts';
import type { BundleEntry, FhirResource } from 'fhir/r4';
import { parametersIsFhirPatch } from '@aehrc/sdc-template-extract';
import WriteBackSelectorFhirPatchEntries from './WriteBackSelectorFhirPatchEntries.tsx';

interface WriteBackBundleSelectorItemProps {
  bundleEntry: BundleEntry;
  bundleEntryIndex: number;
  selectedKeys: Set<string>;
  allValidKeys: Set<string>;
  populatedResourceMap: Map<string, FhirResource>;
  isEntrySelected: (
    bundleEntryIndex: number,
    operationEntryIndex?: number
  ) => boolean | 'indeterminate';
  onToggleCheckbox: (bundleEntryIndex: number) => void;
}

function WriteBackBundleSelectorItem(props: WriteBackBundleSelectorItemProps) {
  const {
    bundleEntry,
    bundleEntryIndex,
    selectedKeys,
    allValidKeys,
    isEntrySelected,
    populatedResourceMap,
    onToggleCheckbox
  } = props;

  const resource = bundleEntry.resource;
  const bundleEntryRequest = bundleEntry.request;
  const bundleEntrySelected = isEntrySelected(bundleEntryIndex);

  const checkboxIsChecked = typeof bundleEntrySelected === 'boolean' ? bundleEntrySelected : false;
  const checkboxIsIndeterminate = typeof bundleEntrySelected !== 'boolean';

  if (!resource || !resource.resourceType || !bundleEntryRequest) {
    return (
      <Box
        sx={{
          border: 1,
          borderColor: 'grey.300',
          borderRadius: 1,
          p: 2
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ cursor: 'not-allowed' }}>
            <Checkbox checked={checkboxIsChecked} disabled={true} />
          </Box>
          <Typography color="text.disabled">
            {`Bundle entry does not contain a FHIR resource or a request field. Something might have went
              wrong.`}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Get resourceType
  let resourceType = resource.resourceType;
  if (resource.resourceType === 'Parameters' && parametersIsFhirPatch(resource)) {
    resourceType = bundleEntryRequest.url.split('/')[0] as FhirResource['resourceType'];
  }

  // Get resource name from populatedResourceMap (if applicable)
  let resourceDisplay = getResourceDisplay(resource);
  if (resource.resourceType === 'Parameters' && parametersIsFhirPatch(resource)) {
    resourceDisplay = getFhirPatchResourceDisplay(bundleEntryRequest, populatedResourceMap);
  }

  // Get method chip labels and color variants
  const { label: chipLabel, colorVariant: chipColorVariant } = getChipMethodDetails(
    bundleEntryRequest.method
  );

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'grey.300',
        borderRadius: 1,
        p: 2
      }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* If resource is Parameters but is not a FHIRPatch, grey out the checkbox */}
        {resource.resourceType === 'Parameters' && !parametersIsFhirPatch(resource) ? (
          <Box sx={{ cursor: 'not-allowed' }}>
            <Checkbox
              checked={checkboxIsChecked}
              indeterminate={checkboxIsIndeterminate}
              disabled={true}
            />
          </Box>
        ) : (
          <Checkbox
            checked={checkboxIsChecked}
            indeterminate={checkboxIsIndeterminate}
            onChange={() => onToggleCheckbox(bundleEntryIndex)}
          />
        )}

        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
          {/* Show resource display name (e.g. Condition code.display) and resourceType */}
          <Box>
            <Typography
              variant="h6"
              component="span"
              sx={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}>
              {resourceDisplay}
            </Typography>
            <Typography color="text.secondary">{resourceType}</Typography>
          </Box>

          {/* Show request.method label */}
          <Chip label={chipLabel} color={chipColorVariant} size="small" />
        </Box>
      </Box>

      {/* Render FhirPatchEntries */}
      {resource.resourceType === 'Parameters' ? (
        <Box mt={1} ml={1}>
          <WriteBackSelectorFhirPatchEntries
            bundleEntryIndex={bundleEntryIndex}
            resource={resource}
            selectedKeys={selectedKeys}
            allValidKeys={allValidKeys}
            isEntrySelected={isEntrySelected}
            onToggleCheckbox={onToggleCheckbox}
          />
        </Box>
      ) : null}
    </Box>
  );
}

export default WriteBackBundleSelectorItem;
