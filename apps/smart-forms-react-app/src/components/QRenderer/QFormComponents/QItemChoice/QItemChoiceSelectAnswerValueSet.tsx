import React, { SyntheticEvent, useEffect } from 'react';
import { Autocomplete, FormControl, Grid, TextField, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrChoiceSelect = qrItem ? qrItem : createQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrChoiceSelect['answer']) {
    valueCoding = qrChoiceSelect['answer'][0].valueCoding;
  }

  const { options, serverError } = useValueSetOptions(qItem);

  // Check and remove populated answer if it is a string
  useEffect(() => {
    if (qrChoiceSelect['answer'] && qrChoiceSelect['answer'][0].valueString) {
      onQrItemChange(createQrItem(qItem));
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
    onQrItemChange(createQrItem(qItem));
  }

  const choiceSelectAnswerValueSet =
    options.length > 0 ? (
      <Autocomplete
        id={qItem.id}
        autoHighlight
        options={options}
        getOptionLabel={(option) => `${option.display}`}
        value={valueCoding ?? null}
        onChange={handleChange}
        sx={{ maxWidth: 202 }}
        renderInput={(params) => <TextField {...params} sx={{ ...(repeats && { mb: 0 }) }} />}
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

  const renderQItemChoiceSelectAnswerValueSet = repeats ? (
    <>{choiceSelectAnswerValueSet}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceSelectAnswerValueSet}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemChoiceSelectAnswerValueSet}</>;
}

export default QItemChoiceSelectAnswerValueSet;
