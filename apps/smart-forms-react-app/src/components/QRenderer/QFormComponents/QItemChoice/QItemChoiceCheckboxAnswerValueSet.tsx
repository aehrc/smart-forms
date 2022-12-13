import React from 'react';
import { FormControl, Grid, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';
import { CheckBoxOptionType, QItemChoiceOrientation } from '../../../../interfaces/Enums';
import { updateQrCheckboxAnswers } from '../../../../functions/ChoiceFunctions';
import QItemCheckboxSingle from '../QItemParts/QItemCheckboxSingle';
import { QFormGroup, QItemLabelMarkdown } from '../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceCheckboxAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange, orientation } = props;

  const qrChoiceCheckbox = qrItem ? qrItem : createQrItem(qItem);
  const answers = qrChoiceCheckbox['answer'] ? qrChoiceCheckbox['answer'] : [];

  const { options, serverError } = useValueSetOptions(qItem);

  function handleCheckedChange(changedValue: string) {
    if (options.length < 1) return null;

    const updatedQrChoiceCheckbox = updateQrCheckboxAnswers(
      changedValue,
      answers,
      options,
      qrChoiceCheckbox,
      CheckBoxOptionType.AnswerValueSet,
      repeats
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  const choiceCheckbox =
    options.length > 0 ? (
      <QFormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
        {options.map((option) => {
          return (
            <QItemCheckboxSingle
              key={option.code ?? ''}
              value={option.code ?? ''}
              label={option.display ?? `${option.code}`}
              isChecked={answers.some(
                (answer) => JSON.stringify(answer) === JSON.stringify(option)
              )}
              onCheckedChange={handleCheckedChange}
            />
          );
        })}
      </QFormGroup>
    ) : serverError ? (
      <Typography variant="subtitle2">
        There was an error fetching options from the terminology server.
      </Typography>
    ) : (
      <Typography variant="subtitle2">
        Unable to fetch options, contained resources not found in questionnaire.
      </Typography>
    );

  return (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabelMarkdown>{qItem.text}</QItemLabelMarkdown>
        </Grid>
        <Grid item xs={7}>
          {choiceCheckbox}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemChoiceCheckboxAnswerValueSet;
