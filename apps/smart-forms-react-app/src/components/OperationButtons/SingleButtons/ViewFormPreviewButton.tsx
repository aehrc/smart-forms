import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

interface Props {
  isChip: boolean;
  togglePreviewMode: () => unknown;
}

function ViewFormPreviewButton(props: Props) {
  const { isChip, togglePreviewMode } = props;

  function handleClick() {
    togglePreviewMode();
  }

  const renderButtonOrChip = !isChip ? (
    <ListItemButton onClick={handleClick}>
      <Visibility sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            View Preview
          </Typography>
        }
      />
    </ListItemButton>
  ) : (
    <OperationChip
      icon={<Visibility fontSize="small" />}
      label="View Preview"
      clickable
      onClick={handleClick}
    />
  );

  return <>{renderButtonOrChip}</>;
}

export default ViewFormPreviewButton;
