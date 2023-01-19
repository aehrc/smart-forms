import React from 'react';
import { QuestionnaireItem } from 'fhir/r5';
import { getXHtmlString } from '../../../../functions/ItemControlFunctions';
import { QItemTypography } from '../../../StyledComponents/Item.styles';
import parse from 'html-react-parser';
import { Box } from '@mui/material';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemLabel(props: Props) {
  const { qItem } = props;

  const xHtmlString = getXHtmlString(qItem);

  if (xHtmlString) {
    return <Box sx={{ mt: 0.5 }}>{parse(xHtmlString)}</Box>;
  } else {
    if (qItem.type === 'group') {
      return <>{qItem.text}</>;
    } else {
      return <QItemTypography>{qItem.text}</QItemTypography>;
    }
  }
}

export default QItemLabel;
