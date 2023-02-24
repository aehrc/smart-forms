import { List, ListItemButton, ListItemText, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { StyledNavItemIcon } from '../NavSection.styles';
import { SourceContext } from '../../../Router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SaveIcon from '@mui/icons-material/Save';

export interface NavButton {
  title: string;
  icon: JSX.Element;
  disabled?: boolean;
  onClick: () => unknown;
}

function OperationSection() {
  const { source } = useContext(SourceContext);

  return (
    <List disablePadding sx={{ px: 1 }}>
      <OperationItem
        title={'Go back'}
        icon={<ArrowBackIcon />}
        onClick={() => {
          console.log('go back');
        }}
      />
      <OperationItem
        title={'View Preview'}
        icon={<VisibilityIcon />}
        disabled={source === 'local'}
        onClick={() => {
          console.log('go back');
        }}
      />
      <OperationItem
        title={'Save as Draft'}
        icon={<SaveIcon />}
        disabled={source === 'local'}
        onClick={() => {
          console.log('go back');
        }}
      />
      <OperationItem
        title={'Save as Final'}
        icon={<TaskAltIcon />}
        disabled={source === 'local'}
        onClick={() => {
          console.log('go back');
        }}
      />
    </List>
  );
}

function OperationItem(props: NavButton) {
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
