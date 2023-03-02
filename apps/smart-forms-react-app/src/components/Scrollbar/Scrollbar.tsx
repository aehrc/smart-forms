import React, { memo } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { StyledRootScrollbar, StyledScrollbar } from './Scrollbar.styles';

interface Props {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

function Scrollbar(props: Props) {
  const { children, sx, ...other } = props;

  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return (
      <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <StyledRootScrollbar>
      <StyledScrollbar clickOnTrack={false} sx={sx} {...other}>
        {children}
      </StyledScrollbar>
    </StyledRootScrollbar>
  );
}

export default memo(Scrollbar);
