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
  selectedEntries: Set<string>;
  allValidEntries: Set<string>;
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
    selectedEntries,
    allValidEntries,
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
          // Check why this isnt working
          <Checkbox
            checked={checkboxIsChecked}
            indeterminate={checkboxIsIndeterminate}
            onChange={() => onToggleCheckbox(bundleEntryIndex)}
          />
        )}

        {/* Show resource display name (e.g. Condition code.display) and resourceType */}
        <Box
          sx={{
            width: '250px'
          }}>
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
        <Box
          display="flex"
          justifyContent="center"
          sx={{
            width: '60px'
          }}>
          <Chip label={chipLabel} color={chipColorVariant} size="small" />
        </Box>

        {/* If request.method is an update, show details to update */}
        {bundleEntryRequest.method === 'PUT' || bundleEntryRequest.method === 'PATCH' ? (
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Resource ID:
            </Typography>
            <Typography>{bundleEntryRequest.url}</Typography>
          </Box>
        ) : null}
      </Box>

      {/* Render FhirPatchEntries */}
      {resource.resourceType === 'Parameters' ? (
        <Box mt={1} ml={1}>
          <WriteBackSelectorFhirPatchEntries
            bundleEntryIndex={bundleEntryIndex}
            resource={resource}
            selectedEntries={selectedEntries}
            allValidEntries={allValidEntries}
            isEntrySelected={isEntrySelected}
            onToggleCheckbox={onToggleCheckbox}
          />
        </Box>
      ) : null}
    </Box>
  );
}

export default WriteBackBundleSelectorItem;
