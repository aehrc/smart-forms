import React from 'react';
import { QuestionnaireItem } from 'fhir/r5';
import { getXHtmlString } from '../../../../functions/ItemControlFunctions';
import { QItemTypography } from '../../../StyledComponents/Item.styles';
import parse from 'html-react-parser';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemLabel(props: Props) {
  const { qItem } = props;

  const xHtmlString = getXHtmlString(qItem);

  if (xHtmlString) {
    return <>{parse(xHtmlString)}</>;
  } else {
    return (
      <>
        <QItemTypography>{qItem.text}</QItemTypography>
      </>
    );
  }
}

export default QItemLabel;
