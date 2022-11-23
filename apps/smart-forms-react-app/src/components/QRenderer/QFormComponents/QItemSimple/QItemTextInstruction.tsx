import React from 'react';
import { Box, Typography } from '@mui/material';
import { Extension, QuestionnaireItem } from 'fhir/r5';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemTextInstruction(props: Props) {
  const { qItem } = props;

  const questionnaireInstruction = getQuestionnaireInstruction(qItem);

  const renderQItemTextInstruction = questionnaireInstruction ? (
    <Box sx={{ color: 'text.secondary', textTransform: 'capitalize', mt: -1, mb: 2 }}>
      <Typography variant="caption" fontSize={10.5}>
        {questionnaireInstruction}
      </Typography>
    </Box>
  ) : null;

  return <>{renderQItemTextInstruction}</>;
}

function getQuestionnaireInstruction(qItem: QuestionnaireItem): string | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-instruction'
  );
  if (itemControl) {
    if (itemControl.valueString) {
      return itemControl.valueString;
    }
  }
  return null;
}

export default QItemTextInstruction;
