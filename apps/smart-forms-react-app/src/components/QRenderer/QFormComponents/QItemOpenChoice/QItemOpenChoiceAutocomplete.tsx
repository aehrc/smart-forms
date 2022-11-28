import React from 'react';
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  Grid,
  TextField,
  Typography
} from '@mui/material';
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

function QItemOpenChoiceAutocomplete(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

  let valueAutocomplete: Coding | string | undefined;
  if (qrOpenChoice['answer']) {
    const answer = qrOpenChoice['answer'][0];
    valueAutocomplete = answer.valueCoding ? answer.valueCoding : answer.valueString;
  }

  const answerValueSetUrl = qItem.answerValueSet;
  if (!answerValueSetUrl) return null;

  const maxlist = 10;

  const { options, loading, setLoading, searchResultsWithDebounce, serverError } =
    useValueSetAutocomplete(answerValueSetUrl, maxlist);

  function handleValueChange(event: any, newValue: Coding | string | null) {
    if (newValue) {
      onQrItemChange({
        ...qrOpenChoice,
        answer: [
          typeof newValue === 'string' ? { valueString: newValue } : { valueCoding: newValue }
        ]
      });
      return;
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newInput = event.target.value;

    setLoading(true);
    searchResultsWithDebounce(newInput);
    handleValueChange(event, newInput);
  }

  const openChoiceAutocomplete = (
    <>
      <Autocomplete
        id={qItem.id}
        freeSolo
        autoHighlight
        value={valueAutocomplete ?? null}
        options={options}
        noOptionsText={'No results'}
        getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
        loading={loading}
        loadingText={'Fetching results...'}
        clearOnEscape
        onChange={handleValueChange}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <TextField
            {...params}
            label={valueAutocomplete ? '' : 'Search...'}
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
      {serverError ? (
        <Typography variant="subtitle2">
          There was an error fetching results from the terminology server.
        </Typography>
      ) : null}
    </>
  );

  const renderQItemOpenChoiceAutocomplete = repeats ? (
    <>{openChoiceAutocomplete}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemTypography>{qItem.text}</QItemTypography>
        </Grid>
        <Grid item xs={7}>
          {openChoiceAutocomplete}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemOpenChoiceAutocomplete}</>;
}

export default QItemOpenChoiceAutocomplete;
