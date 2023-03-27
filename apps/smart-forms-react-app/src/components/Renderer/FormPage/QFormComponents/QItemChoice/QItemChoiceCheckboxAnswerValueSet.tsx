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

import React, { memo } from 'react';
import { Grid, Typography } from '@mui/material';

import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../../interfaces/Interfaces';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../../functions/QrItemFunctions';
import useValueSetCodings from '../../../../../custom-hooks/useValueSetCodings';
import { CheckBoxOptionType, QItemChoiceOrientation } from '../../../../../interfaces/Enums';
import {
  mapCodingsToOptions,
  updateQrCheckboxAnswers
} from '../../../../../functions/ChoiceFunctions';
import QItemCheckboxSingle from '../QItemParts/QItemCheckboxSingle';
import { QFormGroup } from '../../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../../StyledComponents/Boxes.styles';
import useRenderingExtensions from '../../../../../custom-hooks/useRenderingExtensions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceCheckboxAnswerValueSet(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange, orientation } = props;

  // Init input value
  const qrChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem);
  const answers = qrChoiceCheckbox.answer ? qrChoiceCheckbox.answer : [];

  // Get additional rendering extensions
  const { displayInstructions, readOnly } = useRenderingExtensions(qItem);

  // Get codings/options from valueSet
  const { codings, serverError } = useValueSetCodings(qItem);

  // Event handlers
  function handleCheckedChange(changedValue: string) {
    if (codings.length < 1) return null;

    const updatedQrChoiceCheckbox = updateQrCheckboxAnswers(
      changedValue,
      answers,
      mapCodingsToOptions(codings),
      qrChoiceCheckbox,
      CheckBoxOptionType.AnswerValueSet,
      isRepeated
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  const choiceCheckbox =
    codings.length > 0 ? (
      <QFormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
        {codings.map((coding) => {
          return (
            <QItemCheckboxSingle
              key={coding.code ?? ''}
              value={coding.code ?? ''}
              label={coding.display ?? `${coding.code}`}
              readOnly={readOnly}
              isChecked={answers.some(
                (answer) => JSON.stringify(answer.valueCoding) === JSON.stringify(coding)
              )}
              onCheckedChange={handleCheckedChange}
            />
          );
        })}
      </QFormGroup>
    ) : serverError ? (
      <Typography variant="subtitle2">
        There was an error fetching options from the terminology server.
      </Typography>
    ) : (
      <Typography variant="subtitle2">
        Unable to fetch options, contained resources not found in questionnaire.
      </Typography>
    );

  return (
    <FullWidthFormComponentBox data-test="q-item-choice-checkbox-answer-value-set-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceCheckbox}
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default memo(QItemChoiceCheckboxAnswerValueSet);
