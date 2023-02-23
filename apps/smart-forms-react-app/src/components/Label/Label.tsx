import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, SxProps, Theme } from '@mui/material';
import { StyledLabel } from './Label.styles';
import { QuestionnaireListItem } from '../../interfaces/Interfaces';

interface Props {
  color: QuestionnaireListItem['status'];
  children: React.ReactNode;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const Label = forwardRef((props: Props, ref) => {
  const { color, startIcon, endIcon, children, sx, ...other } = props;

  const theme = useTheme();

  const iconStyle = {
    width: 16,
    height: 16,
    '& svg, img': { width: 1, height: 1, objectFit: 'cover' }
  };

  return (
    <StyledLabel
      ref={ref}
      component="span"
      color={color}
      sx={{
        ...(startIcon && { pl: 0.75 }),
        ...(endIcon && { pr: 0.75 }),
        ...sx
      }}
      theme={theme}
      {...other}>
      {startIcon && <Box sx={{ mr: 0.75, ...iconStyle }}> {startIcon} </Box>}

      {children}

      {endIcon && <Box sx={{ ml: 0.75, ...iconStyle }}> {endIcon} </Box>}
    </StyledLabel>
  );
});

Label.displayName = 'Label';

export default Label;
