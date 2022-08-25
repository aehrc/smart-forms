import React from 'react';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  item: QuestionnaireItem;
}

function QItemGroup(props: Props) {
  const { item } = props;
  return (
    <div>
      <RadioGroup name={item.text}>
        <FormControlLabel value="female" control={<Radio />} label="Female" />
        <FormControlLabel value="male" control={<Radio />} label="Male" />
        <FormControlLabel value="other" control={<Radio />} label="Other" />
      </RadioGroup>
    </div>
  );
}

export default QItemGroup;
