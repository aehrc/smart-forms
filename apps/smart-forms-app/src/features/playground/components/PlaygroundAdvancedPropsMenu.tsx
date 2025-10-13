import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import type { StateStore } from './StoreStateViewer.tsx';

interface PlaygroundAdvancedPropsMenuProps {
  selectedStore: StateStore;
  propKeyFilter: string;
  onSetView: (view: 'editor' | 'storeState') => void;
  onSetSelectedStore: (selectedStore: StateStore) => void;
  onSetPropKeyFilter: (filterString: string) => void;
}

function PlaygroundAdvancedPropsMenu(props: PlaygroundAdvancedPropsMenuProps) {
  const { selectedStore, propKeyFilter, onSetView, onSetSelectedStore, onSetPropKeyFilter } = props;

  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <Button
        onClick={() => {
          onSetView('editor');
        }}>
        Show editor
      </Button>
      <ToggleButtonGroup
        size="small"
        color="primary"
        value={selectedStore}
        sx={{ height: 32 }}
        exclusive
        data-test="store-state-toggle-playground"
        onChange={(_, newSelectedStore) => {
          if (newSelectedStore === null) {
            return;
          }

          onSetSelectedStore(newSelectedStore);
          onSetPropKeyFilter('');
        }}>
        <ToggleButton value="questionnaireStore">
          <Typography fontSize={10} fontWeight="bold">
            Q
          </Typography>
        </ToggleButton>
        <ToggleButton value="questionnaireResponseStore">
          <Typography fontSize={10} fontWeight="bold">
            QR
          </Typography>
        </ToggleButton>
        <ToggleButton value="terminologyServerStore">
          <Typography fontSize={10} fontWeight="bold">
            Terminology
          </Typography>
        </ToggleButton>
        <ToggleButton value="extractDebugger">
          <Typography fontSize={10} fontWeight="bold">
            Extract
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
      <Box width="120px">
        <TextField
          value={propKeyFilter}
          placeholder="Filter properties"
          size="small"
          slotProps={{
            input: {
              style: {
                height: '24px',
                fontSize: '12px',
                width: '120px'
              }
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '24px',
              '& fieldset': {
                borderWidth: '1px',
                borderColor: 'rgba(0, 0, 0, 0.23)'
              }
            }
          }}
          onChange={(e) => {
            onSetPropKeyFilter(e.target.value);
          }}
        />
      </Box>
    </Stack>
  );
}

export default PlaygroundAdvancedPropsMenu;
