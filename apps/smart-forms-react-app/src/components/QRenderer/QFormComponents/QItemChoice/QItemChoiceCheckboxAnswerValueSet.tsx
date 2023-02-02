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
import { Grid, Typography } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';
import { CheckBoxOptionType, QItemChoiceOrientation } from '../../../../interfaces/Enums';
import { updateQrCheckboxAnswers } from '../../../../functions/ChoiceFunctions';
import QItemCheckboxSingle from '../QItemParts/QItemCheckboxSingle';
import { QFormGroup } from '../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceCheckboxAnswerValueSet(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange, orientation } = props;

  const qrChoiceCheckbox = qrItem ? qrItem : createEmptyQrItem(qItem);
  const answers = qrChoiceCheckbox['answer'] ? qrChoiceCheckbox['answer'] : [];

  const { options, serverError } = useValueSetOptions(qItem);

  function handleCheckedChange(changedValue: string) {
    if (options.length < 1) return null;

    const updatedQrChoiceCheckbox = updateQrCheckboxAnswers(
      changedValue,
      answers,
      options,
      qrChoiceCheckbox,
      CheckBoxOptionType.AnswerValueSet,
      isRepeated
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  const choiceCheckbox =
    options.length > 0 ? (
      <QFormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
        {options.map((option) => {
          return (
            <QItemCheckboxSingle
              key={option.code ?? ''}
              value={option.code ?? ''}
              label={option.display ?? `${option.code}`}
              isChecked={answers.some(
                (answer) => JSON.stringify(answer) === JSON.stringify(option)
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
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceCheckbox}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default QItemChoiceCheckboxAnswerValueSet;
