import React from 'react';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StandardTextField, TEXT_FIELD_WIDTH } from '../Textfield.styles';
import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute
} from '../../../interfaces/renderProps.interface';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';

interface QuantityUnitFieldProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  readOnly: boolean;
  onChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
}

function QuantityUnitField(props: QuantityUnitFieldProps) {
  const { qItem, options, valueSelect, readOnly, isTabled, onChange } = props;

  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  return (
    <Autocomplete
      id={qItem.linkId}
      value={valueSelect ?? null}
      options={options}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={(_, newValue) => onChange(newValue as QuestionnaireItemAnswerOption | null)}
      freeSolo
      autoHighlight
      sx={{ maxWidth: !isTabled ? TEXT_FIELD_WIDTH : 3000, minWidth: 160, flexGrow: 1 }}
      disabled={readOnly}
      size="small"
      renderInput={(params) => (
        <StandardTextField
          isTabled={isTabled}
          label={displayPrompt}
          placeholder={entryFormat}
          {...params}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                {displayUnit}
              </>
            )
          }}
        />
      )}
    />
  );
}

export default QuantityUnitField;
