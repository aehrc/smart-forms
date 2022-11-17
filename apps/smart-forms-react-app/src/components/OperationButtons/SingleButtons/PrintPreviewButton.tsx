import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Print } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

interface Props {
  isChip: boolean;
}

function PrintPreviewButton(props: Props) {
  const { isChip } = props;

  function handleClick() {
    window.print();
    // TODO print specific area of page
  }

  const renderButtonOrChip = !isChip ? (
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
