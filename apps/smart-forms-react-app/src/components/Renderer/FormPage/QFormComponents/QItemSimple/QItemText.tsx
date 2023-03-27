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

import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { Fade, Grid, InputAdornment, TextField } from '@mui/material';

import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../../interfaces/Interfaces';
import { CalculatedExpression } from '../../../../../interfaces/Interfaces';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../../functions/QrItemFunctions';
import { getTextDisplayPrompt } from '../../../../../functions/QItemFunctions';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../../StyledComponents/Boxes.styles';
import { debounce } from 'lodash';
import { CalculatedExpressionContext } from '../../../../../custom-contexts/CalculatedExpressionContext';
import CheckIcon from '@mui/icons-material/Check';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemText(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange } = props;

  const { calculatedExpressions } = useContext(CalculatedExpressionContext);
  const calculatedExpression: CalculatedExpression | undefined =
    calculatedExpressions[qItem.linkId];

  let valueText = '';
  if (qrItem && qrItem.answer && qrItem.answer.length && qrItem.answer[0].valueString) {
    valueText = qrItem.answer[0].valueString;
  }

  const [input, setInput] = useState<string>(valueText);
  const [calExpIsCalculating, setCalExpIsCalculating] = useState(false);

  useEffect(() => {
    if (calculatedExpression?.value !== input && typeof calculatedExpression?.value === 'string') {
      // only update questionnaireResponse if calculated value is different from current value
      if (input !== calculatedExpression.value) {
        setCalExpIsCalculating(true);
        setTimeout(() => {
          setCalExpIsCalculating(false);
        }, 500);

        setInput(calculatedExpression.value);
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueString: calculatedExpression.value }]
        });
      }
    }
  }, [calculatedExpressions]); // Only trigger this effect if calculatedExpressions changes

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newInput = event.target.value;
    setInput(newInput);
    updateQrItemWithDebounce(newInput);
  }

  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      if (input !== '') {
        onQrItemChange({ ...createEmptyQrItem(qItem), answer: [{ valueString: input.trim() }] });
      } else {
        onQrItemChange(createEmptyQrItem(qItem));
      }
    }, 200),
    [onQrItemChange, qItem]
  );

  const textInput = (
    <TextField
      id={qItem.linkId}
      value={input}
      onChange={handleChange}
      disabled={!!calculatedExpression}
      label={getTextDisplayPrompt(qItem)}
      fullWidth
      multiline
      minRows={3}
      InputProps={{
        endAdornment: (
          <InputAdornment position={'end'}>
            <Fade in={calExpIsCalculating} timeout={{ enter: 100, exit: 300 }}>
              <CheckIcon color="success" fontSize="small" />
            </Fade>
          </InputAdornment>
        )
      }}
      data-test="q-item-text-field"
    />
  );

  const renderQItemText = isRepeated ? (
    <>{textInput}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-text-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {textInput}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemText}</>;
}

export default memo(QItemText);
