import React, { useEffect, useState } from 'react';
import { Autocomplete, Container, FormControl, Grid, TextField, Typography } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { AnswerValueSet } from '../../questionnaire/AnswerValueSet';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { ValueSet } from 'fhir/r5';
import { fhirclient } from 'fhirclient/lib/types';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemAutocomplete(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  let qrChoiceAutocomplete = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  let answerValueCoding: fhirclient.FHIR.Coding | undefined | null;
  if (qrChoiceAutocomplete['answer']) {
    answerValueCoding = qrChoiceAutocomplete['answer'][0].valueCoding;
  }
  const [value, setValue] = useState(answerValueCoding);
  const [options, setOptions] = useState<fhirclient.FHIR.Coding[]>([]);

  useEffect(() => {
    const answerValueSet = qItem.answerValueSet;
    if (!answerValueSet) return;

    const cachedAnswerOptions = AnswerValueSet.cache[answerValueSet];
    if (!cachedAnswerOptions) {
      AnswerValueSet.expand(answerValueSet, (newOptions: ValueSet) => {
        const contains = newOptions.expansion?.contains;
        if (contains) {
          const answerOptions = AnswerValueSet.getValueCodings(contains);
          AnswerValueSet.cache[answerValueSet] = answerOptions;
          setOptions(answerOptions);
        }
      });
    } else {
      setOptions(cachedAnswerOptions);
    }
  }, [qItem]);

  function handleChange(e: any, newValue: fhirclient.FHIR.Coding | null) {
    if (!newValue) return;

    setValue(newValue);
    qrChoiceAutocomplete = {
      ...qrChoiceAutocomplete,
      text: qItem.text,
      answer: [{ valueCoding: newValue }]
    };
    onQrItemChange(qrChoiceAutocomplete);
  }

  return (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <Autocomplete
              id={qItem.id}
              autoComplete
              includeInputInList
              options={options}
              getOptionLabel={(option) => option.display ?? ''}
              value={value}
              onChange={handleChange}
              renderInput={(params) => <TextField {...params} label="Search input" />}
            />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemAutocomplete;
