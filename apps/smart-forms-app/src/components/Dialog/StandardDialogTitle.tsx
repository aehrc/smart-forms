import { Box, DialogTitle, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface StandardDialogTitleProps {
  children: ReactNode;
  onCloseDialog: () => void;
}

function StandardDialogTitle(props: StandardDialogTitleProps) {
  const { children, onCloseDialog } = props;

  return (
    <DialogTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography component="div" variant="h6">
          {children}
        </Typography>
        <IconButton onClick={onCloseDialog} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </DialogTitle>
  );
}

export default StandardDialogTitle;
