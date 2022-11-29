import React from 'react';
import { Autocomplete, FormControl, Grid, TextField, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';
import { QItemTypography } from '../../../StyledComponents/Item.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

  let valueSelect: Coding | undefined = undefined;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0].valueCoding;
  }

  const { options, serverError } = useValueSetOptions(qItem);

  function handleValueChange(event: any, newValue: Coding | string | null) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueString: newValue }] });
      } else {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueCoding: newValue }] });
      }
      return;
    }
    onQrItemChange(createQrItem(qItem));
  }

  const openChoiceSelectAnswerValueSet = (
    <>
      <Autocomplete
        id={qItem.id}
        freeSolo
        autoHighlight
        value={valueSelect ?? null}
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
        onChange={handleValueChange}
        onInputChange={(event, newValue) => handleValueChange(event, newValue)}
        renderInput={(params) => <TextField {...params} sx={{ ...(repeats && { mb: 0 }) }} />}
      />
      {serverError ? (
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server.
        </Typography>
      ) : null}
    </>
  );

  const renderQItemOpenChoiceSelectAnswerValueSet = repeats ? (
    <>{openChoiceSelectAnswerValueSet}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemTypography>{qItem.text}</QItemTypography>
        </Grid>
        <Grid item xs={7}>
          {openChoiceSelectAnswerValueSet}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemOpenChoiceSelectAnswerValueSet}</>;
}

export default QItemOpenChoiceSelectAnswerValueSet;
