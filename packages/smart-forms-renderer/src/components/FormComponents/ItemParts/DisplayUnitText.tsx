import React from 'react';
import Typography from '@mui/material/Typography';
import { useRendererStylingStore } from '../../../stores';

interface DisplayUnitTextProps {
  readOnly: boolean;
  children: string;
}

function DisplayUnitText(props: DisplayUnitTextProps) {
  const { readOnly, children } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();

  const readOnlyTextColor = readOnlyVisualStyle === 'disabled' ? 'text.disabled' : 'text.secondary';

  return (
    <Typography
      component="span"
      color={readOnly ? readOnlyTextColor : 'text.secondary'}
      sx={{ px: 0.5 }}>
      {children}
    </Typography>
  );
}

export default DisplayUnitText;
