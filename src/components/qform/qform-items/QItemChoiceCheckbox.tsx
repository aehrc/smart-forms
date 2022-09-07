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
import { AnswerOption, QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { findInAnswerOptions } from './QItemChoice';

interface QItemChoiceCheckboxProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceCheckbox(props: QItemChoiceCheckboxProps) {
  const { qItem, qrItem, onQrItemChange } = props;

  let qrChoiceCheckbox = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  const answers: AnswerOption[] = qrChoiceCheckbox['answer'] ? qrChoiceCheckbox['answer'] : [];

  function handleCheckedChange(changedValue: any) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, changedValue);
      if (!qrAnswer) return;

      if (qrChoiceCheckbox['answer']) {
        let qrAnswers = qrChoiceCheckbox.answer;
        if (qrChoiceCheckbox.answer.includes(qrAnswer)) {
          qrAnswers = qrAnswers.filter((item) => item !== qrAnswer);
        } else {
          qrAnswers.push(qrAnswer);
        }

        qrChoiceCheckbox = { ...qrChoiceCheckbox, text: qItem.text, answer: qrAnswers };
      } else {
        qrChoiceCheckbox = { ...qrChoiceCheckbox, text: qItem.text, answer: [qrAnswer] };
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
            <FormGroup>
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                qItem.answerOption.map((option: AnswerOption) => {
                  const isChecked: boolean = answers.includes(option);
                  if (option['valueCoding']) {
                    return (
                      <QItemSingleCheckbox
                        key={option.valueCoding.code}
                        value={option.valueCoding.code}
                        label={option.valueCoding.display}
                        isChecked={isChecked}
                        onCheckedChange={handleCheckedChange}
                      />
                    );
                  } else if (option['valueString']) {
                    return (
                      <QItemSingleCheckbox
                        key={option.valueString}
                        value={option.valueString}
                        label={option.valueString}
                        isChecked={isChecked}
                        onCheckedChange={handleCheckedChange}
                      />
                    );
                  } else if (option['valueInteger']) {
                    return (
                      <QItemSingleCheckbox
                        key={option.valueInteger}
                        value={option.valueInteger}
                        label={option.valueInteger}
                        isChecked={isChecked}
                        onCheckedChange={handleCheckedChange}
                      />
                    );
                  }
                })
              }
              <div>Checkbox placeholder</div>
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
    />
  );
}

export default QItemChoiceCheckbox;
