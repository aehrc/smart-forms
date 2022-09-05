import React, { useEffect, useState } from 'react';
import {
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { AnswerOption, QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { findInAnswerOptions } from './QItemChoice';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoice(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  let qrChoiceSelect = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  let answerValue = '';
  if (qrChoiceSelect['answer']) {
    const answer = qrChoiceSelect['answer'][0];
    if (answer['valueCoding']) {
      answerValue = answer.valueCoding.code ? answer.valueCoding.code : '';
    } else if (answer['valueString']) {
      answerValue = answer.valueString;
    } else if (answer['valueInteger']) {
      answerValue = answer.valueInteger.toString();
    }
  }
  const [value, setValue] = useState(answerValue);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  function handleChange(e: SelectChangeEvent) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, e.target.value);
      if (qrAnswer) {
        setValue(e.target.value);
        qrChoiceSelect = { ...qrChoiceSelect, text: qItem.text, answer: [qrAnswer] };
        onQrItemChange(qrChoiceSelect);
      }
    }
  }

  return (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <Select
              labelId="demo-simple-select-label"
              id={qItem.id}
              name={qItem.text}
              value={value}
              onChange={handleChange}>
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                qItem.answerOption.map((option: AnswerOption) => {
                  if (option['valueCoding']) {
                    return (
                      <MenuItem key={option.valueCoding.display} value={option.valueCoding.code}>
                        {option.valueCoding.display}
                      </MenuItem>
                    );
                  } else if (option['valueString']) {
                    return (
                      <MenuItem key={option.valueString} value={option.valueString}>
                        {option.valueString}
                      </MenuItem>
                    );
                  } else if (option['valueInteger']) {
                    return (
                      <MenuItem key={option.valueInteger} value={option.valueInteger}>
                        {option.valueInteger}
                      </MenuItem>
                    );
                  }
                })
              }
            </Select>
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemChoice;
