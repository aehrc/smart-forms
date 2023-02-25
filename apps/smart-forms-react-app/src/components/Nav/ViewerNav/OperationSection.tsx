import { Box, List, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { StyledNavItemIcon } from '../NavSection.styles';
import SaveAsDraftOperation from '../../../Operations/SaveAsDraftOperation';
import SaveAsFinalOperation from '../../../Operations/SaveAsFinalOperation';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import { StyledErrorAlert } from '../../../layouts/Nav.styles';

export interface NavButton {
  title: string;
  icon: JSX.Element;
  disabled?: boolean;
  onClick: () => unknown;
}

function OperationSection() {
  const { fhirClient } = useContext(LaunchContext);

  return fhirClient ? (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <Typography variant="overline">Operations</Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        <SaveAsDraftOperation />
        <SaveAsFinalOperation />
      </List>
    </Box>
  ) : (
    <Box sx={{ px: 2.5 }}>
      <StyledErrorAlert>
        <Box>
          <Typography variant="subtitle2">
            Save operations are disabled when app is not connected to a FHIR server
          </Typography>
        </Box>
      </StyledErrorAlert>
    </Box>
  );
}

export function OperationItem(props: NavButton) {
  const { title, icon, disabled, onClick } = props;
  const theme = useTheme();

  return (
    <ListItemButton
      disableGutters
      onClick={onClick}
      disabled={disabled}
      sx={{
        ...theme.typography.subtitle2,
        height: 48,
        textTransform: 'capitalize',
        color: theme.palette.text.secondary,
        borderRadius: Number(theme.shape.borderRadius) * 0.2
      }}>
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </ListItemButton>
  );
}

export default OperationSection;
