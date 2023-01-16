import React from 'react';
import { FormControl, Grid, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { findInAnswerOptions, getQrChoiceValue } from '../../../../functions/ChoiceFunctions';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceSelectAnswerOption(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrChoiceSelect = qrItem ? qrItem : createQrItem(qItem);
  const valueSelect = getQrChoiceValue(qrChoiceSelect);

  function handleChange(e: SelectChangeEvent) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, e.target.value);
      if (qrAnswer) {
        onQrItemChange({ ...qrChoiceSelect, answer: [qrAnswer] });
        return;
      }
    }
    onQrItemChange(createQrItem(qItem));
  }

  const choiceSelectAnswerOption = (
    <Select id={qItem.id} name={qItem.text} value={valueSelect} onChange={handleChange}>
      {qItem.answerOption?.map((option) => {
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
            <MenuItem key={option.valueInteger} value={option.valueInteger.toString()}>
              {option.valueInteger}
            </MenuItem>
          );
        }
      })}
    </Select>
  );

  const renderQItemChoiceSelectAnswerOption = repeats ? (
    <>{choiceSelectAnswerOption}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceSelectAnswerOption}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemChoiceSelectAnswerOption}</>;
}

export default QItemChoiceSelectAnswerOption;
