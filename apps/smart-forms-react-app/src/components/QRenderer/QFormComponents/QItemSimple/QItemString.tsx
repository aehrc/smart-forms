import React from 'react';
import { Grid } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { getTextDisplayPrompt } from '../../../../functions/QItemFunctions';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardTextField } from '../../../StyledComponents/Textfield.styles';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemString(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  let qrString = qrItem ? qrItem : createQrItem(qItem);
  const valueString = qrString['answer'] ? qrString['answer'][0].valueString : '';

  let hasError = false;
  if (qItem.maxLength && valueString) {
    hasError = valueString.length > qItem.maxLength;
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    qrString = { ...qrString, answer: [{ valueString: event.target.value }] };
    onQrItemChange(qrString);
  }

  const stringInput = (
    <StandardTextField
      fullWidth
      isTabled={isTabled}
      error={hasError}
      id={qItem.linkId}
      value={valueString}
      onChange={handleChange}
      label={getTextDisplayPrompt(qItem)}
      helperText={hasError && qItem.maxLength ? `${qItem.maxLength} character limit exceeded` : ''}
    />
  );

  const renderQItemString = isRepeated ? (
    <>{stringInput}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {stringInput}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemString}</>;
}

export default QItemString;
