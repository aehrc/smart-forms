import React, { memo, useContext } from 'react';
import {
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Iconify from '../../Misc/Iconify';
import { CurrentTabIndexContext } from '../../Renderer/RendererLayout';

interface Props {
  selected: boolean;
  tabText: string;
  listIndex: number;
  markedAsComplete: boolean;
}

function FormBodySingleTab(props: Props) {
  const { selected, tabText, listIndex, markedAsComplete } = props;

  const { setCurrentTabIndex } = useContext(CurrentTabIndexContext);

  return (
    <ListItemButton
      selected={selected}
      sx={{ my: 0.5, py: 0.6 }}
      onClick={() => setCurrentTabIndex(listIndex)}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        {markedAsComplete ? (
          <Tooltip title="Completed">
            <CheckCircleIcon fontSize="small" color="secondary" />
          </Tooltip>
        ) : (
          <Tooltip title="In progress">
            <Box display="flex">
              <Iconify icon={'carbon:in-progress'} />
            </Box>
          </Tooltip>
        )}
      </ListItemIcon>
      <ListItemText primary={<Typography variant="subtitle2">{tabText}</Typography>} />
    </ListItemButton>
  );
}

export default memo(FormBodySingleTab);
