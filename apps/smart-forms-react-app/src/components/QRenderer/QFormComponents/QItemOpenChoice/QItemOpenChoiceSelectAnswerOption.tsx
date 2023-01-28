import React, { SyntheticEvent } from 'react';
import { Autocomplete, Grid } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithIsRepeatedAttribute
} from '../../../../interfaces/Interfaces';
import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r5';
import { getAnswerOptionLabel } from '../../../../functions/OpenChoiceFunctions';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardTextField } from '../../../StyledComponents/Textfield.styles';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoiceSelectAnswerOption(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange } = props;

  const answerOptions = qItem.answerOption;
  if (!answerOptions) return null;

  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

  let valueSelect: QuestionnaireItemAnswerOption | undefined = undefined;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0];
  }

  function handleChange(
    event: SyntheticEvent<Element, Event>,
    newValue: QuestionnaireItemAnswerOption | string | null
  ) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueString: newValue }] });
      } else {
        const option = newValue;
        if (option['valueCoding']) {
          onQrItemChange({ ...qrOpenChoice, answer: [{ valueCoding: option.valueCoding }] });
        } else if (option['valueString']) {
          onQrItemChange({ ...qrOpenChoice, answer: [{ valueString: option.valueString }] });
        } else if (option['valueInteger']) {
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ valueInteger: option.valueInteger }]
          });
        }
      }
      return;
    }
    onQrItemChange(createQrItem(qItem));
  }

  const openOpenChoiceSelectAnswerOption = (
    <Autocomplete
      id={qItem.id}
      value={valueSelect ?? null}
      options={answerOptions}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={handleChange}
      freeSolo
      autoHighlight
      fullWidth
      renderInput={(params) => <StandardTextField {...params} />}
    />
  );
  const renderQItemOpenChoiceAutocomplete = isRepeated ? (
    <>{openOpenChoiceSelectAnswerOption}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openOpenChoiceSelectAnswerOption}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemOpenChoiceAutocomplete}</>;
}

export default QItemOpenChoiceSelectAnswerOption;
