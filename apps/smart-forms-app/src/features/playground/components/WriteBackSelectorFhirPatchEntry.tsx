import { Box, Checkbox, Chip, Collapse, IconButton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getFhirPatchOperationPathDisplay } from '../utils/extractedBundleSelector.ts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface WriteBackSelectorFhirPatchEntryProps {
  operationType: string | undefined;
  operationPath: string | undefined;
  operationValuePart: { [key: string]: any } | undefined;
  operationName: string | undefined;
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
    bundleEntryIndex,
    operationEntryIndex,
    operationEntrySelected,
    onToggleCheckbox
  } = props;

  const [payloadShown, setPayloadShown] = useState(false);

  const theme = useTheme();

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography fontWeight={600}>
            {getFhirPatchOperationPathDisplay(operationPath, operationName)}
          </Typography>

          {/* Show request.method label */}
          <Chip label={operationType} size="small" sx={{ height: '20px' }} />

          {/* Show button to show/hide payload */}
          <Tooltip title={`${payloadShown ? 'Hide' : 'Show'} payload`} placement="right">
            <IconButton
              size="small"
              onClick={() => setPayloadShown(!payloadShown)}
              sx={{
                transform: payloadShown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}>
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Render payload */}
        <Collapse in={payloadShown}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {typeof operationValuePart === 'object' ? (
              <SyntaxHighlighter
                language="json"
                customStyle={{
                  backgroundColor: theme.palette.grey.A100,
                  borderRadius: '8px'
                }}>
                {JSON.stringify(operationValuePart, null, 2)}
              </SyntaxHighlighter>
            ) : null}
          </Typography>
        </Collapse>
      </Box>
    </Box>
  );
}

export default WriteBackSelectorFhirPatchEntry;
