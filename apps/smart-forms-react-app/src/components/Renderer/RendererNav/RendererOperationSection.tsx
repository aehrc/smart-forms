import { Box, List, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import React from 'react';
import { StyledNavItemIcon } from '../../StyledComponents/NavSection.styles';
import RendererSaveAsDraft from './RendererSaveAsDraft';
import RendererSaveAsFinal from './RendererSaveAsFinal';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLocation, useNavigate } from 'react-router-dom';

export interface NavButton {
  title: string;
  icon: JSX.Element;
  disabled?: boolean;
  onClick: () => unknown;
}

function RendererOperationSection() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <Typography variant="overline">Operations</Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        {location.pathname === '/renderer/preview' ? (
          <OperationItem
            title={'Editor'}
            icon={<EditIcon />}
            onClick={() => {
              navigate('/renderer');
            }}
          />
        ) : (
          <OperationItem
            title={'Preview'}
            icon={<VisibilityIcon />}
            onClick={() => {
              navigate('/renderer/preview');
            }}
          />
        )}
        <RendererSaveAsDraft />
        <RendererSaveAsFinal />
      </List>
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

export default RendererOperationSection;
