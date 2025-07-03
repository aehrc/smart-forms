import { Box, Checkbox, Chip, Typography } from '@mui/material';
import {
  getFhirPatchOperationPathDisplay,
  getFhirPatchOperationValueDisplay
} from '../utils/extractedBundleSelector.ts';

interface WriteBackSelectorFhirPatchEntryProps {
  operationType: string | undefined;
  operationPath: string | undefined;
  operationValuePart: { [key: string]: any } | undefined;
  operationName: string | undefined;
  operationPathLabel: string | undefined;
  bundleEntryIndex: number;
  operationEntryIndex: number;
  operationEntrySelected: boolean;
  onToggleCheckbox: (bundleEntryIndex: number, operationEntryIndex?: number) => void;
}

function WriteBackSelectorFhirPatchEntry(props: WriteBackSelectorFhirPatchEntryProps) {
  const {
    operationType,
    operationPath,
    operationName,
    operationValuePart,
    operationPathLabel,
    bundleEntryIndex,
    operationEntryIndex,
    operationEntrySelected,
    onToggleCheckbox
  } = props;

  if (!operationType || !operationPath || !operationValuePart) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ cursor: 'not-allowed' }}>
          <Checkbox checked={operationEntrySelected} disabled={true} size="small" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography color="text.disabled">
            {`FHIRPatch operation entry does not contain a "type", "path" or "value". Something might have went
              wrong.`}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Checkbox
        checked={operationEntrySelected}
        onChange={() => onToggleCheckbox(bundleEntryIndex, operationEntryIndex)}
        size="small"
      />
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mr: 1,
            my: 0.5
          }}>
          <Box>
            <Typography fontWeight={600} sx={{ mb: 0.5 }}>
              {operationPathLabel ?? getFhirPatchOperationPathDisplay(operationPath, operationName)}
            </Typography>

            <Box>
              <Typography component="span" color="text.secondary">
                New value:
              </Typography>{' '}
              <Typography component="span" textTransform="capitalize">
                {getFhirPatchOperationValueDisplay(operationValuePart)}
              </Typography>
            </Box>
          </Box>

          {/* Show request.method label */}
          <Chip label={operationType} size="small" sx={{ height: '20px' }} />
        </Box>
      </Box>
    </Box>
  );
}

export default WriteBackSelectorFhirPatchEntry;
