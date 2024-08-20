import React from 'react';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StandardTextField, TEXT_FIELD_WIDTH } from '../Textfield.styles';
import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItemAnswerOption } from 'fhir/r4';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';

interface QuantityUnitFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  readOnly: boolean;
  onChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
}

function QuantityUnitField(props: QuantityUnitFieldProps) {
  const { linkId, options, valueSelect, readOnly, isTabled, onChange } = props;

  return (
    <Autocomplete
      id={linkId + '-unit'}
      value={valueSelect ?? null}
      isOptionEqualToValue={(option, value) =>
        option.valueCoding?.code === value?.valueCoding?.code
      }
      options={options}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={(_, newValue) => onChange(newValue as QuestionnaireItemAnswerOption | null)}
      autoHighlight
      sx={{ maxWidth: !isTabled ? TEXT_FIELD_WIDTH : 3000, minWidth: 160, flexGrow: 1 }}
      disabled={readOnly}
      size="small"
      renderInput={(params) => <StandardTextField isTabled={isTabled} {...params} />}
    />
  );
}

export default QuantityUnitField;
