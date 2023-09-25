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

import React from 'react';
import Grid from '@mui/material/Grid';
import type { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findInAnswerValueSetCodings } from '../../../utils/choice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import ChoiceRadioAnswerValueSetFields from './ChoiceRadioAnswerValueSetFields';

interface ChoiceRadioAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: ChoiceItemOrientation;
}

function ChoiceRadioAnswerValueSetItem(props: ChoiceRadioAnswerValueSetItemProps) {
  const { qItem, qrItem, isRepeated, onQrItemChange, orientation } = props;

  // Init input value
  const qrChoiceRadio = qrItem ?? createEmptyQrItem(qItem);

  let valueRadio: string | null = null;
  if (qrChoiceRadio.answer) {
    valueRadio = qrChoiceRadio.answer[0].valueCoding?.code ?? null;
  }

  // Get additional rendering extensions
  const { displayInstructions, readOnly } = useRenderingExtensions(qItem);

  // Get codings/options from valueSet
  const { codings, serverError } = useValueSetCodings(qItem);

  function handleChange(newValue: string) {
    if (codings.length > 0) {
      const qrAnswer = findInAnswerValueSetCodings(codings, newValue);
      if (qrAnswer) {
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueCoding: qrAnswer }]
        });
      }
    }
  }

  if (isRepeated) {
    return (
      <ChoiceRadioAnswerValueSetFields
        qItem={qItem}
        codings={codings}
        valueRadio={valueRadio}
        orientation={orientation}
        readOnly={readOnly}
        serverError={serverError}
        onCheckedChange={handleChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-choice-radio-answer-value-set-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <ChoiceRadioAnswerValueSetFields
            qItem={qItem}
            codings={codings}
            valueRadio={valueRadio}
            orientation={orientation}
            readOnly={readOnly}
            serverError={serverError}
            onCheckedChange={handleChange}
          />
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceRadioAnswerValueSetItem;
