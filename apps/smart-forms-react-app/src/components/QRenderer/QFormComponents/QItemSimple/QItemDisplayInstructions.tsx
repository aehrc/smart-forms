import React from 'react';
import { Box, Typography } from '@mui/material';
import { QuestionnaireItem } from 'fhir/r5';
import { getTextDisplayInstructions } from '../../../../functions/QItemFunctions';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplayInstructions(props: Props) {
  const { qItem } = props;

  const displayInstructions = getTextDisplayInstructions(qItem);

  const renderQItemDisplayInstructions = displayInstructions ? (
    <Box sx={{ color: 'text.secondary', textTransform: 'capitalize', mb: 2 }}>
      <Typography variant="caption" fontSize={10.5}>
        {displayInstructions}
      </Typography>
    </Box>
  ) : null;

  return <>{renderQItemDisplayInstructions}</>;
}

export default QItemDisplayInstructions;
