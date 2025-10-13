import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GridOnIcon from '@mui/icons-material/GridOn';
import DebugResponseView from '../../../renderer/components/RendererDebugFooter/DebugResponseView.tsx';
import type { ReactNode } from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

interface StorePropertyViewerProps {
  selectedPropKey: string;
  selectedPropVal: any;
  viewMode: 'text' | 'jsonTree' | 'table';
  onViewModeChange: (newViewMode: 'text' | 'jsonTree' | 'table') => void;
  showTableView?: boolean; // Only for ExtractDebuggerViewer "templateExtractDebugInfo" property
  children?: ReactNode;
}

function StorePropertyViewer(props: StorePropertyViewerProps) {
  const { selectedPropKey, selectedPropVal, viewMode, onViewModeChange, showTableView, children } =
    props;

  if (selectedPropKey === null) {
    return (
      <Typography variant="h5" px={0.5}>
        No property selected
      </Typography>
    );
  }

  return (
    <Stack sx={{ height: 'calc(100% - 68px)' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        px={0.5}
        sx={{
          position: 'sticky',
          top: 43,
          backgroundColor: 'white',
          zIndex: 5,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h5">{selectedPropKey}</Typography>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={viewMode}
            exclusive
            sx={{ mx: 0.5, height: 32 }}
            onChange={(_, newViewMode) => {
              onViewModeChange(newViewMode);
            }}
            aria-label="Switch view modes">
            <ToggleButton value="text" aria-label="text">
              <NotesIcon />
            </ToggleButton>
            <ToggleButton value="jsonTree" aria-label="jsonTree">
              <AccountTreeIcon />
            </ToggleButton>
            {showTableView ? (
              <ToggleButton value="table" aria-label="table">
                <GridOnIcon />
              </ToggleButton>
            ) : null}
          </ToggleButtonGroup>
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard
                  .writeText(JSON.stringify(selectedPropVal, null, 2))
                  .then(() => alert(`${selectedPropKey} copied to clipboard`))
                  .catch(() =>
                    alert(
                      'The copy operation doesnt work within an iframe (CMS-launched app in this case)\n:('
                    )
                  );
              }}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Box display="flex" columnGap={1} />

      <Box p={0.5} pb={30} sx={{ overflow: 'auto' }}>
        <Typography color="text.secondary" pb={1}>
          {viewMode === 'text' ? 'Text view is good for fast Ctrl+F debugging.' : null}
          {viewMode === 'jsonTree'
            ? 'JSON Tree is good for selective debugging. For more detailed debugging, copy tree nodes to a text editor.'
            : null}
          {viewMode === 'table'
            ? 'Table view is good for a visual view of contexts and values within a template. Only available for "templateExtractDebugInfo".  '
            : null}
        </Typography>
        <DebugResponseView displayObject={selectedPropVal} viewMode={viewMode} />
        {children}
      </Box>
    </Stack>
  );
}

export default StorePropertyViewer;
