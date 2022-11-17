import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { Operation } from '../../../interfaces/Enums';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

interface Props {
  buttonOrChip: Operation;
  togglePreviewMode: () => unknown;
}

function ViewFormPreviewButton(props: Props) {
  const { buttonOrChip, togglePreviewMode } = props;

  function handleClick() {
    togglePreviewMode();
  }

  const renderButtonOrChip =
    buttonOrChip === Operation.Button ? (
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
