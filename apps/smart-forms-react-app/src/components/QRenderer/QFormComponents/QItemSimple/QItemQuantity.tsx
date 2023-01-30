/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { CalcExpressionContext } from '../../Form';
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

function QItemQuantity(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const calculatedExpressions = useContext(CalcExpressionContext);

  let qrQuantity = qrItem ? qrItem : createQrItem(qItem);
  let valueQuantity: number | undefined = 0.0;
  let unitQuantity: string | undefined = '';

  if (qrQuantity['answer']) {
    const answer = qrQuantity['answer'][0];
    valueQuantity = answer.valueQuantity ? answer.valueQuantity.value : 0.0;
    unitQuantity = answer.valueQuantity ? answer.valueQuantity.unit : '';
  }

  useEffect(() => {
    const expression = calculatedExpressions[qItem.linkId];

    if (expression && expression.value) {
      qrQuantity = {
        ...qrQuantity,
        answer: [{ valueQuantity: { value: expression.value, unit: unitQuantity } }]
      };
      onQrItemChange(qrQuantity);
    }
  }, [calculatedExpressions]);

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    let input = event.target.value;

    const hasNumber = /\d/;
    if (!hasNumber.test(input)) {
      input = '0';
    }
    qrQuantity = {
      ...qrQuantity,
      answer: [{ valueQuantity: { value: parseFloat(input), unit: unitQuantity } }]
    };
    onQrItemChange(qrQuantity);
  }

  function handleUnitChange(event: React.ChangeEvent<HTMLInputElement>) {
    onQrItemChange({
      ...qrQuantity,
      answer: [{ valueQuantity: { value: valueQuantity, unit: event.target.value } }]
    });
  }

  const QItemQuantityFields = (
    <Grid container columnSpacing={1}>
      <Grid item xs={6}>
        <StandardTextField
          type="number"
          id={qItem.linkId}
          value={valueQuantity}
          fullWidth
          isTabled={isTabled}
          onChange={handleValueChange}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField id={qItem.linkId + '_unit'} value={unitQuantity} onChange={handleUnitChange} />
      </Grid>
    </Grid>
  );

  if (isRepeated) {
    return <>{QItemQuantityFields}</>;
  } else {
    return (
      <FullWidthFormComponentBox>
        <Grid container columnSpacing={6}>
          <Grid item xs={5}>
            <QItemLabel qItem={qItem} />
          </Grid>
          <Grid item xs={7}>
            {QItemQuantityFields}
            <QItemDisplayInstructions qItem={qItem} />
          </Grid>
        </Grid>
      </FullWidthFormComponentBox>
    );
  }
}

export default QItemQuantity;
