import React from 'react';
import { IconButton } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import useResponsive from '../../custom-hooks/useResponsive';

interface Props {
  navCollapsed: boolean;
  expandNav: () => void;
}

function NavExpandButton(props: Props) {
  const { navCollapsed, expandNav } = props;

  const isDesktop = useResponsive('up', 'lg');

  return navCollapsed && isDesktop ? (
    <IconButton onClick={expandNav} sx={{ position: 'fixed', bottom: 16, left: 16 }}>
      <KeyboardDoubleArrowRightIcon fontSize="small" />
    </IconButton>
  ) : null;
}

export default NavExpandButton;
