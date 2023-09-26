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

import React, { useEffect, useMemo } from 'react';
import Grid from '@mui/material/Grid';

import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { PropsWithParentIsReadOnlyAttribute } from '../../../interfaces/renderProps.interface';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import ChoiceSelectAnswerValueSetFields from './ChoiceSelectAnswerValueSetFields';

interface ChoiceSelectAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function ChoiceSelectAnswerValueSetItem(props: ChoiceSelectAnswerValueSetItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  // Init input value
  const qrChoiceSelect = qrItem ?? createEmptyQrItem(qItem);
  let valueCoding: Coding | null = null;
  if (qrChoiceSelect.answer) {
    valueCoding = qrChoiceSelect.answer[0].valueCoding ?? null;
  }

  // Get additional rendering extensions
  const { displayInstructions } = useRenderingExtensions(qItem);

  // Get codings/options from valueSet
  const { codings, serverError } = useValueSetCodings(qItem);

  valueCoding = useMemo(() => {
    const updatedValueCoding = codings.find(
      (queriedCoding) => queriedCoding.code === valueCoding?.code
    );
    return updatedValueCoding ?? valueCoding;
  }, [codings, valueCoding]);

  // Check and remove populated answer if it is a string
  // NOTE: $populate will try to populate answer as valueCoding,
  //       but will fail if answer provided is not within options
  useEffect(
    () => {
      if (qrChoiceSelect.answer && qrChoiceSelect.answer[0].valueString) {
        onQrItemChange(createEmptyQrItem(qItem));
      }
    },
    // Only run effect once - on populate
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Event handlers
  function handleChange(newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...createEmptyQrItem(qItem),
        answer: [{ valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  if (isRepeated) {
    return (
      <ChoiceSelectAnswerValueSetFields
        qItem={qItem}
        codings={codings}
        valueCoding={valueCoding}
        serverError={serverError}
        isTabled={isTabled}
        parentIsReadOnly={parentIsReadOnly}
        onSelectChange={handleChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-choice-dropdown-answer-value-set-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <ChoiceSelectAnswerValueSetFields
            qItem={qItem}
            codings={codings}
            valueCoding={valueCoding}
            serverError={serverError}
            isTabled={isTabled}
            parentIsReadOnly={parentIsReadOnly}
            onSelectChange={handleChange}
          />
          <DisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceSelectAnswerValueSetItem;
