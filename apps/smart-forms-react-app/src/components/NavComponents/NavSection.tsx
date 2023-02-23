import { List, ListItemButton, ListItemText, useTheme } from '@mui/material';
import React, { memo } from 'react';
import { navConfig } from './NavConfig';
import { NavLink } from 'react-router-dom';
import { StyledNavItemIcon } from './NavSection.styles';

export interface NavButton {
  title: string;
  path: string;
  icon: JSX.Element;
}

function NavSection() {
  return (
    <List disablePadding sx={{ px: 1 }}>
      {navConfig.map((item) => (
        <NavItem key={item.title} title={item.title} path={item.path} icon={item.icon} />
      ))}
    </List>
  );
}

function NavItem(props: NavButton) {
  const { title, path, icon } = props;
  const theme = useTheme();

  return (
    <ListItemButton
      component={NavLink}
      to={path}
      disableGutters
      sx={{
        ...theme.typography.subtitle2,
        height: 48,
        textTransform: 'capitalize',
        color: theme.palette.text.secondary,
        borderRadius: Number(theme.shape.borderRadius) * 0.2,

        '&.active': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.action.selected,
          fontWeight: theme.typography.fontWeightBold
        }
      }}>
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </ListItemButton>
  );
}

export default memo(NavSection);
