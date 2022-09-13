import React, { useEffect, useState } from 'react';
import {
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import { AnswerOption, QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler, QItemChoiceOrientation } from '../FormModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { findInAnswerOptions } from './QItemChoice';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceRadio(props: Props) {
  const { qItem, qrItem, onQrItemChange, orientation } = props;

  let qrChoiceRadio = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  let answerValue: string | number | undefined = '';
  if (qrChoiceRadio['answer']) {
    const answer = qrChoiceRadio['answer'][0];
    if (answer['valueCoding']) {
      answerValue = answer.valueCoding.code;
    } else if (answer['valueString']) {
      answerValue = answer.valueString;
    } else if (answer['valueInteger']) {
      answerValue = answer.valueInteger;
    }
  }
  const [value, setValue] = useState(answerValue);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, e.target.value);
      if (qrAnswer) {
        setValue(e.target.value);
        qrChoiceRadio = { ...qrChoiceRadio, answer: [qrAnswer] };
        onQrItemChange(qrChoiceRadio);
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
            <RadioGroup
              row={orientation === QItemChoiceOrientation.Horizontal}
              name={qItem.text}
              id={qItem.id}
              onChange={handleChange}
              value={value}>
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                qItem.answerOption.map((option: AnswerOption) => {
                  if (option['valueCoding']) {
                    return (
                      <FormControlLabel
                        key={option.valueCoding.code}
                        value={option.valueCoding.code}
                        control={<Radio />}
                        label={option.valueCoding.display}
                        sx={{ mr: 3 }}
                      />
                    );
                  } else if (option['valueString']) {
                    return (
                      <FormControlLabel
                        key={option.valueString}
                        value={option.valueString}
                        control={<Radio />}
                        label={option.valueString}
                        sx={{ mr: 3 }}
                      />
                    );
                  } else if (option['valueInteger']) {
                    return (
                      <FormControlLabel
                        key={option.valueInteger}
                        value={option.valueInteger}
                        control={<Radio />}
                        label={option.valueInteger}
                        sx={{ mr: 3 }}
                      />
                    );
                  }
                })
              }
            </RadioGroup>
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemChoiceRadio;
