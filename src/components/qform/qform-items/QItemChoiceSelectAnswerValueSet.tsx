import React, { useEffect, useState } from 'react';
import { Autocomplete, FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { AnswerValueSet } from '../../questionnaire/AnswerValueSet';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrChoiceSelect = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  let valueCoding: Coding | undefined | null = null;
  if (qrChoiceSelect['answer']) {
    valueCoding = qrChoiceSelect['answer'][0].valueCoding;
  }

  const [options, setOptions] = useState<Coding[]>([]);

  useEffect(() => {
    const answerValueSetUrl = qItem.answerValueSet;
    if (!answerValueSetUrl) return;

    const cachedAnswerOptions = AnswerValueSet.cache[answerValueSetUrl];
    if (cachedAnswerOptions) {
      // set options from cached answer options
      setOptions(cachedAnswerOptions);
    } else {
      // expand valueSet, then set and cache answer options
      AnswerValueSet.expand(answerValueSetUrl, (newOptions: ValueSet) => {
        const contains = newOptions.expansion?.contains;
        if (contains) {
          const answerOptions = AnswerValueSet.getValueCodings(contains);
          AnswerValueSet.cache[answerValueSetUrl] = answerOptions;
          setOptions(answerOptions);
        }
      });
    }
  }, [qItem]);

  function handleChange(event: any, newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...qrChoiceSelect,
        answer: [{ valueCoding: newValue }]
      });
    }
  }

  const choiceSelectAnswerValueSet = (
    <Autocomplete
      id={qItem.id}
      options={options}
      getOptionLabel={(option) => option.display ?? ''}
      value={valueCoding}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} sx={{ ...(repeats && { mb: 0 }) }} />}
    />
  );

  const renderQItemChoiceSelectAnswerValueSet = repeats ? (
    <div>{choiceSelectAnswerValueSet}</div>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {choiceSelectAnswerValueSet}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemChoiceSelectAnswerValueSet}</div>;
}

export default QItemSelectAnswerValueSet;
