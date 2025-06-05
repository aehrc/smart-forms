import { Button, Stack, TextField, Typography } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import type { StateStore } from './StoreStateViewer.tsx';

interface PlaygroundAdvancedPropsMenuProps {
  selectedStore: StateStore;
  statePropNameFilter: string;
  onSetView: (view: 'editor' | 'storeState') => void;
  onSetSelectedStore: (selectedStore: StateStore) => void;
  onSetstatePropNameFilter: (filterString: string) => void;
}

function PlaygroundAdvancedPropsMenu(props: PlaygroundAdvancedPropsMenuProps) {
  const {
    selectedStore,
    statePropNameFilter,
    onSetView,
    onSetSelectedStore,
    onSetstatePropNameFilter
  } = props;

  return (
    <Stack direction="row" alignItems="center" gap={0.55}>
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
          onSetstatePropNameFilter('');
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
      <TextField
        value={statePropNameFilter}
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
          onSetstatePropNameFilter(e.target.value);
        }}
      />
    </Stack>
  );
}

export default PlaygroundAdvancedPropsMenu;
