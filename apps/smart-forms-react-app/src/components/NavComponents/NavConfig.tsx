import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import React from 'react';
import { NavButton } from './NavSection';

export const navConfig: NavButton[] = [
  {
    title: 'Questionnaires',
    path: '/questionnaires',
    icon: <AssignmentIcon />
  },
  {
    title: 'Responses',
    path: '/responses',
    icon: <AssignmentTurnedInIcon />
  }
];
