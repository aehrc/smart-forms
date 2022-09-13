import React, { useEffect, useState } from 'react';
import {
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography
} from '@mui/material';
import { PropsWithQrItemChangeHandler, QItemChoiceOrientation } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { findInAnswerOptions } from './QItemChoice';
import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r5';

interface QItemChoiceCheckboxProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceCheckbox(props: QItemChoiceCheckboxProps) {
  const { qItem, qrItem, onQrItemChange, orientation } = props;

  let qrChoiceCheckbox = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  const answers: QuestionnaireItemAnswerOption[] = qrChoiceCheckbox['answer']
    ? qrChoiceCheckbox['answer']
    : [];

  function handleCheckedChange(changedValue: any) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, changedValue);
      if (!qrAnswer) return;

      if (qrChoiceCheckbox['answer']) {
        let qrAnswers = qrChoiceCheckbox.answer;
        const changedValueInAnswers = findInAnswerOptions(qrChoiceCheckbox.answer, changedValue);
        if (changedValueInAnswers) {
          qrAnswers = qrAnswers.filter(
            (item) => JSON.stringify(item) !== JSON.stringify(changedValueInAnswers)
          );
        } else {
          qrAnswers.push(qrAnswer);
        }

        qrChoiceCheckbox = { ...qrChoiceCheckbox, answer: qrAnswers };
      } else {
        qrChoiceCheckbox = { ...qrChoiceCheckbox, answer: [qrAnswer] };
      }
      onQrItemChange(qrChoiceCheckbox);
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
            <FormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                qItem.answerOption.map((option: AnswerOption) => {
                  if (option['valueCoding']) {
                    return (
                      <QItemSingleCheckbox
                        key={option.valueCoding.code}
                        value={option.valueCoding.code}
                        label={option.valueCoding.display}
                        isChecked={answers.some(
                          (answer) => JSON.stringify(answer) === JSON.stringify(option)
                        )}
                        onCheckedChange={handleCheckedChange}
                      />
                    );
                  } else if (option['valueString']) {
                    return (
                      <QItemSingleCheckbox
                        key={option.valueString}
                        value={option.valueString}
                        label={option.valueString}
                        isChecked={answers.some(
                          (answer) => answer.valueString === option.valueString
                        )}
                        onCheckedChange={handleCheckedChange}
                      />
                    );
                  } else if (option['valueInteger']) {
                    return (
                      <QItemSingleCheckbox
                        key={option.valueInteger}
                        value={option.valueInteger}
                        label={option.valueInteger}
                        isChecked={answers.some(
                          (answer) => answer.valueInteger === option.valueInteger
                        )}
                        onCheckedChange={handleCheckedChange}
                      />
                    );
                  }
                })
              }
            </FormGroup>
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

interface QItemSingleCheckboxProps {
  value: string | number | undefined;
  label: string | number | undefined;
  isChecked: boolean;
  onCheckedChange: (value: string | number | undefined) => unknown;
}

function QItemSingleCheckbox(props: QItemSingleCheckboxProps) {
  const { value, label, isChecked, onCheckedChange } = props;

  const [checked, setChecked] = useState(isChecked);

  useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    onCheckedChange(value);
  };

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleChange} />}
      label={label}
      sx={{ mr: 3 }}
    />
  );
}

export default QItemChoiceCheckbox;
