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
import { Grid, InputAdornment } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { CalcExpressionContext } from '../../Form';
import { EnableWhenContext } from '../../../../custom-contexts/EnableWhenContext';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';
import { getTextDisplayUnit } from '../../../../functions/QItemFunctions';
import { StandardOutlinedInput } from '../../../StyledComponents/Textfield.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemInteger(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenLinkMap = { ...enableWhenContext.linkMap };

  const calculatedExpressions = useContext(CalcExpressionContext);

  const displayUnit = getTextDisplayUnit(qItem);

  let qrInteger = qrItem ? qrItem : createQrItem(qItem);
  const valueInteger = qrInteger['answer'] ? qrInteger['answer'][0].valueInteger : 0;

  useEffect(() => {
    // if integer item is an enableWhen linked question, and it does not have an answer yet
    // set default answer to 0 - to trigger enableWhen == 0
    if (qItem.linkId in enableWhenLinkMap && !qrInteger['answer']) {
      onQrItemChange({ ...qrInteger, answer: [{ valueInteger: 0 }] });
    }
  }, []);

  useEffect(() => {
    const expression = calculatedExpressions[qItem.linkId];

    if (expression && expression.value) {
      onQrItemChange({
        ...qrInteger,
        answer: [{ valueInteger: expression.value }]
      });
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

  const integerInput = (
    <StandardOutlinedInput
      id={qItem.linkId}
      value={valueInteger}
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
