import React, { SyntheticEvent } from 'react';
import { Autocomplete, CircularProgress, Grid, Typography } from '@mui/material';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetAutocomplete from '../../../../custom-hooks/useValueSetAutocomplete';
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

function QItemOpenChoiceAutocomplete(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

  let valueAutocomplete: Coding | string | undefined;
  if (qrOpenChoice['answer']) {
    const answer = qrOpenChoice['answer'][0];
    valueAutocomplete = answer.valueCoding ? answer.valueCoding : answer.valueString;
  }

  const answerValueSetUrl = qItem.answerValueSet;
  if (!answerValueSetUrl) return null;

  const maxList = 10;

  const { options, loading, setLoading, searchResultsWithDebounce, serverError } =
    useValueSetAutocomplete(answerValueSetUrl, maxList);

  function handleValueChange(
    event: SyntheticEvent<Element, Event>,
    newValue: Coding | string | null
  ) {
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
        value={valueAutocomplete ?? null}
        options={options}
        noOptionsText={'No results'}
        getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
        loading={loading}
        loadingText={'Fetching results...'}
        clearOnEscape
        freeSolo
        autoHighlight
        fullWidth
        onChange={handleValueChange}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <StandardTextField
            {...params}
            label={valueAutocomplete ? '' : 'Search...'}
            onChange={handleInputChange}
            isTabled={isTabled}
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

  const renderQItemOpenChoiceAutocomplete = isRepeated ? (
    <>{openChoiceAutocomplete}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceAutocomplete}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemOpenChoiceAutocomplete}</>;
}

export default QItemOpenChoiceAutocomplete;
