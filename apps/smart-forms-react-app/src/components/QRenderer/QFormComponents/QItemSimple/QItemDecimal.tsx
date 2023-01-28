import React, { useContext, useEffect, useState } from 'react';
import { Grid, InputAdornment } from '@mui/material';

import {
  CalculatedExpression,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { CalcExpressionContext } from '../../Form';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import { getDecimalPrecision } from '../../../../functions/ItemControlFunctions';
import { getTextDisplayUnit } from '../../../../functions/QItemFunctions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardOutlinedInput } from '../../../StyledComponents/Textfield.styles';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDecimal(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const calculatedExpressions = useContext(CalcExpressionContext);

  const precision = getDecimalPrecision(qItem);
  const displayUnit = getTextDisplayUnit(qItem);

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

  const decimalInput = (
    <StandardOutlinedInput
      id={qItem.linkId}
      value={input}
      onChange={handleChange}
      disabled={!!calculatedExpression}
      fullWidth
      isTabled={isTabled}
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*'
      }}
      endAdornment={<InputAdornment position={'end'}>{displayUnit}</InputAdornment>}
    />
  );

  const renderQItemDecimal = isRepeated ? (
    <>{decimalInput}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {decimalInput}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemDecimal}</>;
}

export default QItemDecimal;
