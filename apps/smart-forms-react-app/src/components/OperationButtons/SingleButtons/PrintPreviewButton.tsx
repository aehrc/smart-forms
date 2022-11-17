import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Print } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { Operation } from '../../../interfaces/Enums';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

interface Props {
  buttonOrChip: Operation;
}

function PrintPreviewButton(props: Props) {
  const { buttonOrChip } = props;

  function handleClick() {
    window.print();
    // TODO print specific area of page
  }

  const renderButtonOrChip =
    buttonOrChip === Operation.Button ? (
      <ListItemButton onClick={handleClick}>
        <Print sx={{ mr: 2 }} />
        <ListItemText
          primary={
            <Typography fontSize={12} variant="h6">
              Print Preview
            </Typography>
          }
        />
      </ListItemButton>
    ) : (
      <OperationChip
        icon={<Print fontSize="small" />}
        label="Print Preview"
        clickable
        onClick={handleClick}
      />
    );

  return <>{renderButtonOrChip}</>;
}

export default PrintPreviewButton;
