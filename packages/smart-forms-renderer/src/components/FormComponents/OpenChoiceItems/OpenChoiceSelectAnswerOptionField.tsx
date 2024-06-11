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

interface OpenChoiceSelectAnswerOptionFieldProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  readOnly: boolean;
  onChange: (newValue: QuestionnaireItemAnswerOption | string | null) => void;
}

function OpenChoiceSelectAnswerOptionField(props: OpenChoiceSelectAnswerOptionFieldProps) {
  const { qItem, options, valueSelect, readOnly, isTabled, onChange } = props;

  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  return (
    <Autocomplete
      id={qItem.linkId}
      value={valueSelect ?? null}
      options={options}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={(_, newValue) => onChange(newValue)}
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

export default OpenChoiceSelectAnswerOptionField;
