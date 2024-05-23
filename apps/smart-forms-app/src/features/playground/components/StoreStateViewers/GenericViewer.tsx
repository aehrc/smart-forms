import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DebugResponseView from '../../../renderer/components/RendererDebugFooter/DebugResponseView.tsx';

interface GenericViewerProps {
  propertyName: string;
  propertyObject: any;
  showJsonTree: boolean;
  onToggleShowJsonTree: (toggleShowJsonTree: boolean) => void;
}

function GenericViewer(props: GenericViewerProps) {
  const { propertyName, propertyObject, showJsonTree, onToggleShowJsonTree } = props;

  if (propertyName === null) {
    return <Typography variant="h5">No property selected</Typography>;
  }

  return (
    <Stack px={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center">
          <Typography variant="h5">{propertyName}</Typography>
          <Tooltip title={showJsonTree ? 'Toggle text view' : 'Toggle JSON tree view'}>
            <IconButton
              onClick={() => {
                onToggleShowJsonTree(!showJsonTree);
              }}>
              {showJsonTree ? <NotesIcon /> : <AccountTreeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy to clipboard">
            <IconButton
              onClick={() => {
                navigator.clipboard
                  .writeText(JSON.stringify(propertyObject, null, 2))
                  .then(() => alert(`${propertyName} copied to clipboard`))
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
      <Box display="flex" columnGap={1}></Box>

      <Box p={1}>
        <Typography color="text.secondary" pb={1}>
          {showJsonTree
            ? 'Use JSON Tree for selective debugging. For more detailed debugging, copy tree nodes to a text editor.'
            : 'Use text view for fast Ctrl+F debugging.'}
        </Typography>
        <DebugResponseView displayObject={propertyObject} showJsonTree={showJsonTree} />
      </Box>
    </Stack>
  );
}

export default GenericViewer;
