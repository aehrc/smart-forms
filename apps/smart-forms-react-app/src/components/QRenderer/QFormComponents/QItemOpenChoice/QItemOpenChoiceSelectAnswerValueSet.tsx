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

import React, { memo, SyntheticEvent } from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardTextField } from '../../../StyledComponents/Textfield.styles';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';
import useValueSetCodings from '../../../../custom-hooks/useValueSetCodings';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  const qrOpenChoice = qrItem ? qrItem : createEmptyQrItem(qItem);

  let valueSelect: Coding | undefined = undefined;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0].valueCoding;
  }

  const { codings, serverError } = useValueSetCodings(qItem);

  function handleValueChange(
    event: SyntheticEvent<Element, Event>,
    newValue: Coding | string | null
  ) {
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

  const openChoiceSelectAnswerValueSet = (
    <>
      <Autocomplete
        id={qItem.id}
        value={valueSelect ?? null}
        options={codings}
        getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
        onChange={handleValueChange}
        onInputChange={(event, newValue) => handleValueChange(event, newValue)}
        freeSolo
        autoHighlight
        fullWidth
        renderInput={(params) => <StandardTextField isTabled={isTabled} {...params} />}
      />
      {serverError ? (
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server.
        </Typography>
      ) : null}
    </>
  );

  const renderQItemOpenChoiceSelectAnswerValueSet = isRepeated ? (
    <>{openChoiceSelectAnswerValueSet}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceSelectAnswerValueSet}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemOpenChoiceSelectAnswerValueSet}</>;
}

export default memo(QItemOpenChoiceSelectAnswerValueSet);
