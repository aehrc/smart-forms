import React, { useEffect, useState } from 'react';
import { Autocomplete, Container, FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { AnswerValueSet } from '../../questionnaire/AnswerValueSet';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  let qrChoiceSelect = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  let answerValueCoding: Coding | undefined | null = null;
  if (qrChoiceSelect['answer']) {
    answerValueCoding = qrChoiceSelect['answer'][0].valueCoding;
  }
  const [value, setValue] = useState(answerValueCoding);
  const [options, setOptions] = useState<Coding[]>([]);

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

  function handleChange(e: any, newValue: Coding | null) {
    if (!newValue) return;

    setValue(newValue);
    qrChoiceSelect = {
      ...qrChoiceSelect,
      answer: [{ valueCoding: newValue }]
    };
    onQrItemChange(qrChoiceSelect);
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
              renderInput={(params) => <TextField {...params} />}
            />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemSelectAnswerValueSet;
