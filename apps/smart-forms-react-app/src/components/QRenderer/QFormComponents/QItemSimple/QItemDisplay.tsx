import React from 'react';
import { QuestionnaireItem } from 'fhir/r5';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplay(props: Props) {
  const { qItem } = props;

  return (
    <FullWidthFormComponentBox>
      <QItemLabel qItem={qItem} />
    </FullWidthFormComponentBox>
  );
}

export default QItemDisplay;
