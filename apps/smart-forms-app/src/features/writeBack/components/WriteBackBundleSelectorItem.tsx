import { useState } from 'react';
import { Box, Button, Checkbox, Chip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  getChipMethodDetails,
  getFhirPatchResourceDisplay,
  getResourceDisplay
} from '../utils/extractedBundleSelector.ts';
import type { BundleEntry, FhirResource, OperationOutcomeIssue } from 'fhir/r4';
import { parametersIsFhirPatch } from '@aehrc/sdc-template-extract';
import WriteBackSelectorFhirPatchEntries from './WriteBackSelectorFhirPatchEntries.tsx';

interface WriteBackBundleSelectorItemProps {
  bundleEntry: BundleEntry;
  bundleEntryIndex: number;
  selectedKeys: Set<string>;
  allValidKeys: Set<string>;
  populatedResourceMap: Map<string, FhirResource>;
  // Error/fatal issues from $validate; an entry that has any can't be selected
  validationIssues?: OperationOutcomeIssue[];
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
    validationIssues,
    onToggleCheckbox
  } = props;

  const isInvalid = !!validationIssues && validationIssues.length > 0;

  const [resourceCopied, setResourceCopied] = useState(false);

  function handleCopyResource() {
    navigator.clipboard
      .writeText(JSON.stringify(bundleEntry.resource, null, 2))
      .then(() => setResourceCopied(true))
      .catch(() => console.warn('Failed to copy the resource to the clipboard'));
  }

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
        borderColor: isInvalid ? 'error.main' : 'grey.300',
        borderRadius: 1,
        p: 2
      }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Disable checkbox when entry failed $validate, or when Parameters is not a valid FHIRPatch */}
        {isInvalid ||
        (resource.resourceType === 'Parameters' && !parametersIsFhirPatch(resource)) ? (
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

      {/* Show why the entry failed $validate */}
      {isInvalid ? (
        <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
          {validationIssues.map((issue, issueIndex) => (
            <Box component="li" key={issueIndex} sx={{ color: 'error.main', mt: 0.5 }}>
              <Typography variant="body2" color="error" sx={{ overflowWrap: 'anywhere' }}>
                {issue.diagnostics ?? issue.details?.text ?? issue.code}
              </Typography>
              {issue.expression && issue.expression.length > 0 ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
                  {issue.expression.join(', ')}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Box>
      ) : null}

      {/* Lets the user take the failing resource to a validator */}
      {isInvalid ? (
        <Button
          onClick={handleCopyResource}
          size="small"
          startIcon={<ContentCopyIcon />}
          sx={{ mt: 1, ml: 1 }}>
          {resourceCopied ? 'Copied to clipboard' : 'Copy JSON'}
        </Button>
      ) : null}

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
