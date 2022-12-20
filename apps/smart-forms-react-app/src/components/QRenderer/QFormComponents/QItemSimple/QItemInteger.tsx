import React, { useContext, useEffect } from 'react';
import { FormControl, Grid, TextField } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { CalcExpressionContext } from '../../Form';
import { EnableWhenContext } from '../../../../custom-contexts/EnableWhenContext';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemInteger(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenLinkMap = { ...enableWhenContext.linkMap };

  const calculatedExpressions = useContext(CalcExpressionContext);

  let qrInteger = qrItem ? qrItem : createQrItem(qItem);
  const valueInteger = qrInteger['answer'] ? qrInteger['answer'][0].valueInteger : 0;

  useEffect(() => {
    // if integer item is an enableWhen linked question and it does not have an answer yet
    // set default answer to 0 - to trigger enableWhen == 0
    if (qItem.linkId in enableWhenLinkMap && !qrInteger['answer']) {
      onQrItemChange({ ...qrInteger, answer: [{ valueInteger: 0 }] });
    }
  }, []);

  useEffect(() => {
    const expression = calculatedExpressions[qItem.linkId];

    if (expression && expression.value) {
      qrInteger = { ...qrInteger, answer: [{ valueInteger: expression.value }] };
      onQrItemChange(qrInteger);
    }
  }, [calculatedExpressions]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let input = event.target.value;

    const hasNumber = /\d/;
    if (!hasNumber.test(input)) {
      input = '0';
    }
    qrInteger = { ...qrInteger, answer: [{ valueInteger: parseInt(input) }] };
    onQrItemChange(qrInteger);
  }

  const renderQItemInteger = repeats ? (
    <TextField
      id={qItem.linkId}
      value={valueInteger}
      onChange={handleChange}
      sx={{ mb: 0 }}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
    />
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <TextField
            id={qItem.linkId}
            value={valueInteger}
            onChange={handleChange}
            sx={{ mb: 0 }}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );

  return <>{renderQItemInteger}</>;
}

export default QItemInteger;
