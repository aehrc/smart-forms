import { List, ListItemText } from '@mui/material';
import React from 'react';
import { StyledNavItem, StyledNavItemIcon } from './NavSection.styles';
import FaceIcon from '@mui/icons-material/Face';
import SyncIcon from '@mui/icons-material/Sync';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

interface DataProps {
  title: string;
  icon: JSX.Element;
}

const data: DataProps[] = [
  {
    title: 'Refresh Questionnaires',
    icon: <SyncIcon />
  },
  {
    title: 'Change Questionnaire',
    icon: <AssignmentReturnIcon />
  },
  {
    title: 'product',
    icon: <FaceIcon />
  },
  {
    title: 'blog',
    icon: <FaceIcon />
  },
  {
    title: 'login',
    icon: <FaceIcon />
  },
  {
    title: 'Not found',
    icon: <FaceIcon />
  }
];

function NavSection() {
  return (
    <List disablePadding sx={{ px: 1 }}>
      {data.map((item) => (
        <NavItem key={item.title} title={item.title} icon={item.icon} />
      ))}
    </List>
  );
}

export default NavSection;

function NavItem(props: DataProps) {
  const { title, icon } = props;

  return (
    <StyledNavItem>
      <StyledNavItemIcon sx={{ ml: -1 }}>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </StyledNavItem>
  );
}
