import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { Operation } from '../../interfaces/Enums';
import { OperationChip } from '../ChipBar/ChipBar.styles';

interface Props {
  buttonOrChip: Operation;
  togglePreviewMode: () => unknown;
}

function ContinueEditingButton(props: Props) {
  const { buttonOrChip, togglePreviewMode } = props;

  function handleClick() {
    togglePreviewMode();
  }

  const renderButtonOrChip =
    buttonOrChip === Operation.Button ? (
      <ListItemButton onClick={handleClick}>
        <ArrowBack sx={{ mr: 2 }} />
        <ListItemText
          primary={
            <Typography fontSize={12} variant="h6">
              Continue Editing
            </Typography>
          }
        />
      </ListItemButton>
    ) : (
      <OperationChip
        icon={<ArrowBack fontSize="small" />}
        label="Continue Editing"
        clickable
        onClick={handleClick}
      />
    );

  return <>{renderButtonOrChip}</>;
}

export default ContinueEditingButton;
