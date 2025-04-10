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
      sx={{ m: 0 }} // Ensure no margin is applied, even if external apps add margin to their <p>'s
      color={readOnly ? readOnlyTextColor : 'text.secondary'}>
      {children}
    </Typography>
  );
}

export default DisplayUnitText;
