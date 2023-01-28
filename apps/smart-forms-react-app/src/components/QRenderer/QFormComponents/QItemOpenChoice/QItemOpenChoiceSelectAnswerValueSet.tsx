import React, { SyntheticEvent } from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithIsRepeatedAttribute
} from '../../../../interfaces/Interfaces';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';
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

function QItemOpenChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange } = props;

  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

  let valueSelect: Coding | undefined = undefined;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0].valueCoding;
  }

  const { options, serverError } = useValueSetOptions(qItem);

  function handleValueChange(
    event: SyntheticEvent<Element, Event>,
    newValue: Coding | string | null
  ) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueString: newValue }] });
      } else {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueCoding: newValue }] });
      }
      return;
    }
    onQrItemChange(createQrItem(qItem));
  }

  const openChoiceSelectAnswerValueSet = (
    <>
      <Autocomplete
        id={qItem.id}
        value={valueSelect ?? null}
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
        onChange={handleValueChange}
        onInputChange={(event, newValue) => handleValueChange(event, newValue)}
        freeSolo
        autoHighlight
        fullWidth
        renderInput={(params) => <StandardTextField {...params} />}
      />
      {serverError ? (
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server.
        </Typography>
      ) : null}
    </>
  );

  const renderQItemOpenChoiceSelectAnswerValueSet = isRepeated ? (
    <>{openChoiceSelectAnswerValueSet}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceSelectAnswerValueSet}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemOpenChoiceSelectAnswerValueSet}</>;
}

export default QItemOpenChoiceSelectAnswerValueSet;
