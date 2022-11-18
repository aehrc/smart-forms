import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Print } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

interface Props {
  handlePrint: () => unknown;
  isChip?: boolean;
}

function PrintPreviewButton(props: Props) {
  const { handlePrint, isChip } = props;

  const renderButtonOrChip = !isChip ? (
    <ListItemButton onClick={handlePrint}>
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
      onClick={handlePrint}
    />
  );

  return <>{renderButtonOrChip}</>;
}

export default PrintPreviewButton;
