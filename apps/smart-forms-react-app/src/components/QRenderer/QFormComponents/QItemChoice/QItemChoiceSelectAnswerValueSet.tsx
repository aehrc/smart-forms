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

import React, { SyntheticEvent, useEffect } from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
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

function QItemChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  const qrChoiceSelect = qrItem ? qrItem : createEmptyQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrChoiceSelect['answer']) {
    valueCoding = qrChoiceSelect['answer'][0].valueCoding;
  }

  const { options, serverError } = useValueSetOptions(qItem);

  // Check and remove populated answer if it is a string
  useEffect(() => {
    if (qrChoiceSelect['answer'] && qrChoiceSelect['answer'][0].valueString) {
      onQrItemChange(createEmptyQrItem(qItem));
    }
  }, []);

  function handleChange(event: SyntheticEvent<Element, Event>, newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...qrChoiceSelect,
        answer: [{ valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  const choiceSelectAnswerValueSet =
    options.length > 0 ? (
      <Autocomplete
        id={qItem.id}
        options={options}
        getOptionLabel={(option) => `${option.display}`}
        value={valueCoding ?? null}
        onChange={handleChange}
        autoHighlight
        fullWidth
        renderInput={(params) => <StandardTextField isTabled={isTabled} {...params} />}
      />
    ) : serverError ? (
      <Typography variant="subtitle2">
        There was an error fetching options from the terminology server.
      </Typography>
    ) : (
      <Typography variant="subtitle2">
        Unable to fetch options, contained resources not found in questionnaire.
      </Typography>
    );

  const renderQItemChoiceSelectAnswerValueSet = isRepeated ? (
    <>{choiceSelectAnswerValueSet}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceSelectAnswerValueSet}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemChoiceSelectAnswerValueSet}</>;
}

export default QItemChoiceSelectAnswerValueSet;
