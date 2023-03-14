import { forwardRef } from 'react';
import type { SxProps, Theme } from '@mui/material';
import { Box, Typography } from '@mui/material';
import { ReactComponent as AppLogo } from '../../data/images/logo.svg';

interface Props {
  sx?: SxProps<Theme>;
}

const Logo = forwardRef((props: Props, ref) => {
  const { sx } = props;

  const logo = (
    <Box
      ref={ref}
      component="div"
      sx={{
        width: 40,
        height: 40,
        display: 'inline-flex',
        ...sx
      }}>
      <AppLogo />
    </Box>
  );

  return (
    <Box display="flex" alignItems="center">
      {logo}
      <Typography variant="h6" sx={{ ml: 1.5, color: 'common.black' }}>
        Smart Forms
      </Typography>
    </Box>
  );
});

Logo.displayName = 'Logo';

export default Logo;
