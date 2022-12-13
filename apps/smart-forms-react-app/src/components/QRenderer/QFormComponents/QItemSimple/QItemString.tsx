import React from 'react';
import { FormControl, Grid, TextField } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { getTextDisplayPrompt } from '../../../../functions/QItemFunctions';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import { QItemLabelMarkdown } from '../../../StyledComponents/Item.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemString(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

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
    <TextField
      error={hasError}
      id={qItem.linkId}
      value={valueString}
      onChange={handleChange}
      sx={{ mb: repeats ? 0 : 2 }} // mb:4 is MUI default value
      label={getTextDisplayPrompt(qItem)}
      helperText={hasError && qItem.maxLength ? `${qItem.maxLength} character limit exceeded` : ''}
    />
  );

  const renderQItemString = repeats ? (
    <>{stringInput}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabelMarkdown>{qItem.text}</QItemLabelMarkdown>
        </Grid>
        <Grid item xs={7}>
          {stringInput}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );

  return <>{renderQItemString}</>;
}

export default QItemString;
