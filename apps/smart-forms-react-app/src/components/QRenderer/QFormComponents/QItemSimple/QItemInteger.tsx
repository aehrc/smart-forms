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

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Grid, InputAdornment } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import { CalcExpressionContext } from '../../Form';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';
import { getTextDisplayUnit } from '../../../../functions/QItemFunctions';
import { StandardOutlinedInput } from '../../../StyledComponents/Textfield.styles';
import { debounce } from 'lodash';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemInteger(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  const calculatedExpressions = useContext(CalcExpressionContext);

  const displayUnit = getTextDisplayUnit(qItem);

  let qrInteger = qrItem ? qrItem : createEmptyQrItem(qItem);
  const valueInteger = qrInteger['answer'] ? qrInteger['answer'][0].valueInteger : 0;

  const [input, setInput] = useState<number | undefined>(valueInteger);

  useEffect(() => {
    const expression = calculatedExpressions[qItem.linkId];

    if (expression && expression.value) {
      qrInteger = {
        ...qrInteger,
        answer: [{ valueInteger: expression.value }]
      };
      onQrItemChange(qrInteger);
    }
  }, [calculatedExpressions]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let newInput = event.target.value;

    const hasNumber = /\d/;
    if (!hasNumber.test(newInput)) {
      newInput = '0';
    }

    const inputNumber = parseInt(newInput);
    setInput(inputNumber);
    updateQrItemWithDebounce(inputNumber);
  }

  const updateQrItemWithDebounce = useCallback(
    debounce((inputNumber: number) => {
      qrInteger = { ...qrInteger, answer: [{ valueInteger: inputNumber }] };
      onQrItemChange(qrInteger);
    }, 500),
    []
  );

  const integerInput = (
    <StandardOutlinedInput
      id={qItem.linkId}
      value={input}
      onChange={handleChange}
      fullWidth
      isTabled={isTabled}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      endAdornment={<InputAdornment position={'end'}>{displayUnit}</InputAdornment>}
    />
  );

  const renderQItemInteger = isRepeated ? (
    <>{integerInput}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {integerInput}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemInteger}</>;
}

export default QItemInteger;
