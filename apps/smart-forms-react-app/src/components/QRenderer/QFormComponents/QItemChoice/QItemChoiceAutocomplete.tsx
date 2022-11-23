import React from 'react';
import { Autocomplete, CircularProgress, FormControl, Grid, TextField } from '@mui/material';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetAutocomplete from '../../../../custom-hooks/useValueSetAutocomplete';
import { QItemTypography } from '../../../StyledComponents/Item.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceAutocomplete(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrOpenChoice['answer']) {
    valueCoding = qrOpenChoice['answer'][0].valueCoding;
  }

  const answerValueSetUrl = qItem.answerValueSet;
  if (!answerValueSetUrl) return null;

  const maxlist = 10;

  const { options, loading, fetchNewOptions } = useValueSetAutocomplete(answerValueSetUrl, maxlist);

  function handleValueChange(event: any, newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...qrOpenChoice,
        answer: [{ valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createQrItem(qItem));
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    fetchNewOptions(event.target.value);
  }

  const choiceAutocomplete = (
    <Autocomplete
      id={qItem.id}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={valueCoding ?? null}
      options={options}
      getOptionLabel={(option) => `${option.display}`}
      onChange={handleValueChange}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label={valueCoding ? '' : 'Search ' + qItem.text?.toLowerCase() + '...'}
          onChange={handleInputChange}
          sx={{ ...(repeats && { mb: 0 }) }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );

  const renderQItemChoiceAutocomplete = repeats ? (
    <>{choiceAutocomplete}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemTypography>{qItem.text}</QItemTypography>
        </Grid>
        <Grid item xs={7}>
          {choiceAutocomplete}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemChoiceAutocomplete}</>;
}

export default QItemChoiceAutocomplete;
