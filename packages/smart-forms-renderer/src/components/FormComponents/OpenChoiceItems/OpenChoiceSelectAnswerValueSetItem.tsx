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
import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import OpenChoiceSelectAnswerValueSetField from './OpenChoiceSelectAnswerValueSetField';
import useReadOnly from '../../../hooks/useReadOnly';

interface OpenChoiceSelectAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function OpenChoiceSelectAnswerValueSetItem(props: OpenChoiceSelectAnswerValueSetItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayInstructions } = useRenderingExtensions(qItem);

  // Init input value
  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem);
  let valueSelect: Coding | null = null;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0].valueCoding ?? null;
  }

  // Get codings/options from valueSet
  const { codings, serverError } = useValueSetCodings(qItem);

  // Event handlers
  function handleValueChange(newValue: Coding | string | null) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ valueString: newValue }]
        });
      } else {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ valueCoding: newValue }]
        });
      }
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  if (isRepeated) {
    return (
      <OpenChoiceSelectAnswerValueSetField
        qItem={qItem}
        options={codings}
        valueSelect={valueSelect}
        serverError={serverError}
        isTabled={isTabled}
        readOnly={readOnly}
        onValueChange={handleValueChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} readOnly={readOnly} />
        </Grid>
        <Grid item xs={7}>
          <OpenChoiceSelectAnswerValueSetField
            qItem={qItem}
            options={codings}
            valueSelect={valueSelect}
            serverError={serverError}
            isTabled={isTabled}
            readOnly={readOnly}
            onValueChange={handleValueChange}
          />
          <DisplayInstructions displayInstructions={displayInstructions} readOnly={readOnly} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceSelectAnswerValueSetItem;
