import React, { useContext, useEffect, useState } from 'react';
import { FormControl, Grid, TextField } from '@mui/material';

import {
  CalculatedExpression,
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { CalcExpressionContext } from '../../Form';
import { QItemTypography } from '../../../StyledComponents/Item.styles';
import QItemTextInstruction from './QItemTextInstruction';
import { getDecimalPrecision } from '../../../../functions/ItemControlFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDecimal(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const calculatedExpressions = useContext(CalcExpressionContext);

  const precision = getDecimalPrecision(qItem);
  const calculatedExpression: CalculatedExpression | undefined =
    calculatedExpressions[qItem.linkId];

  const qrDecimal = qrItem ? qrItem : createQrItem(qItem);
  const valueDecimal = qrDecimal['answer'] ? qrDecimal['answer'][0].valueDecimal : 0.0;

  const [input, setInput] = useState('0');

  useEffect(() => {
    if (valueDecimal && parseFloat(input) !== valueDecimal) {
      setInput(precision ? valueDecimal.toFixed(precision) : valueDecimal.toString());
    }
  }, [valueDecimal]);

  useEffect(() => {
    if (calculatedExpression && calculatedExpression.value) {
      const precision = getDecimalPrecision(qItem);
      const value = precision
        ? parseFloat(calculatedExpression.value.toFixed(precision))
        : calculatedExpression.value;

      onQrItemChange({ ...qrDecimal, answer: [{ valueDecimal: value }] });
    }
  }, [calculatedExpressions]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let input = event.target.value;

    // set input as 0 if no number in input
    const hasNumber = /\d/;
    if (!hasNumber.test(input)) {
      input = '0';
    }

    let parsedInput = parseFloat(input).toString();

    // restore decimal digits if parseFloat() removes them
    const decimalPoint = input.indexOf('.');
    if (decimalPoint !== -1) {
      const decimalDigits = input.slice(decimalPoint);
      if (parsedInput.indexOf('.') === -1) {
        parsedInput += decimalDigits;
      }
    }

    // truncate decimal digits based on precision
    const parsedDecimalPoint = input.indexOf('.');
    if (precision && parsedDecimalPoint !== -1) {
      parsedInput = parsedInput.substring(0, parsedDecimalPoint + precision + 1);
    }

    setInput(parsedInput);
    onQrItemChange({ ...qrDecimal, answer: [{ valueDecimal: parseFloat(input) }] });
  }

  const renderQItemDecimal = repeats ? (
    <TextField
      id={qItem.linkId}
      value={input}
      onChange={handleChange}
      disabled={!!calculatedExpression}
      sx={{ mb: 0 }}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
    />
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemTypography>{qItem.text}</QItemTypography>
        </Grid>
        <Grid item xs={7}>
          <TextField
            id={qItem.linkId}
            value={input}
            onChange={handleChange}
            disabled={!!calculatedExpression}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />

          {/* For demo purposes only*/}
          <QItemTextInstruction qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemDecimal}</>;
}

export default QItemDecimal;
