import React from 'react';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StandardTextField } from '../Textfield.styles';
import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItemAnswerOption } from 'fhir/r4';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { useRendererStylingStore } from '../../../stores';

interface QuantityUnitFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  readOnly: boolean;
  onChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
}

function QuantityUnitField(props: QuantityUnitFieldProps) {
  const { linkId, itemType, options, valueSelect, readOnly, isTabled, onChange } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  return (
    <Autocomplete
      id={itemType + '-' + linkId + '-unit'}
      value={valueSelect ?? null}
      isOptionEqualToValue={(option, value) =>
        option.valueCoding?.code === value?.valueCoding?.code
      }
      options={options}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={(_, newValue) => onChange(newValue as QuestionnaireItemAnswerOption | null)}
      autoHighlight
      sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160, flexGrow: 1 }}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      size="small"
      renderInput={(params) => (
        <StandardTextField
          textFieldWidth={textFieldWidth}
          isTabled={isTabled}
          {...params}
          slotProps={{
            input: {
              readOnly: readOnly && readOnlyVisualStyle === 'readonly'
            }
          }}
        />
      )}
    />
  );
}

export default QuantityUnitField;
