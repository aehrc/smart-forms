import React from 'react';
import { FormControl, Grid, TextField } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { getTextDisplayPrompt } from '../../../../functions/QItemFunctions';
import { QItemTypography } from '../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from './QItemDisplayInstructions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemText(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrText = qrItem ? qrItem : createQrItem(qItem);
  const valueText = qrText['answer'] ? qrText['answer'][0].valueString : '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    qrText = { ...qrText, answer: [{ valueString: e.target.value }] };
    onQrItemChange(qrText);
  }

  const textInput = (
    <TextField
      id={qItem.linkId}
      value={valueText}
      onChange={handleChange}
      sx={{ mb: repeats ? 0 : 2 }} // mb:4 is MUI default value
      label={getTextDisplayPrompt(qItem)}
      fullWidth
      multiline
    />
  );

  const renderQItemText = repeats ? (
    <>{textInput}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemTypography>{qItem.text}</QItemTypography>
        </Grid>
        <Grid item xs={7}>
          {textInput}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );

  return <>{renderQItemText}</>;
}

export default QItemText;
