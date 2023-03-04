import { forwardRef } from 'react';
import { Icon } from '@iconify/react';
import type { SxProps, Theme } from '@mui/material';
import { Box } from '@mui/material';

interface Props {
  icon: string;
  width?: number;
  height?: number;
  sx?: SxProps<Theme>;
}

const Iconify = forwardRef((props: Props, ref) => {
  const { icon, width = 20, height = 20, sx } = props;
  return <Box ref={ref} component={Icon} icon={icon} sx={{ width, height, ...sx }} />;
});

Iconify.displayName = 'Iconify';

export default Iconify;
