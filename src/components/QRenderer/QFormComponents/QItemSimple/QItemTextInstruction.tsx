import React from 'react';
import { Box, Typography } from '@mui/material';
import { QuestionnaireItem } from 'fhir/r5';
import { isSpecificItemControl } from '../../../../functions/ItemControlFunctions';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemTextInstruction(props: Props) {
  const { qItem } = props;

  const renderQItemTextInstruction =
    qItem.type === 'display' && isSpecificItemControl(qItem, 'instruction') ? (
      <Box sx={{ color: 'text.secondary', textTransform: 'capitalize', mt: 0.5 }}>
        <Typography variant="caption">{qItem.text}</Typography>
      </Box>
    ) : (
      <Box sx={{ mb: 4 }} />
    );

  return <>{renderQItemTextInstruction}</>;
}

export default QItemTextInstruction;
