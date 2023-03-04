import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material';
import { Box } from '@mui/material';
import { QuestionnaireStyledLabel } from './QuestionnaireLabel.styles';
import type { QuestionnaireListItem } from '../../../interfaces/Interfaces';

interface Props {
  color: QuestionnaireListItem['status'];
  children: React.ReactNode;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const QuestionnaireLabel = forwardRef((props: Props, ref) => {
  const { color, startIcon, endIcon, children, sx, ...other } = props;

  const theme = useTheme();

  const iconStyle = {
    width: 16,
    height: 16,
    '& svg, img': { width: 1, height: 1, objectFit: 'cover' }
  };

  return (
    <QuestionnaireStyledLabel
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
    </QuestionnaireStyledLabel>
  );
});

QuestionnaireLabel.displayName = 'QuestionnaireLabel';

export default QuestionnaireLabel;
