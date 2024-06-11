import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { StandardTextField, TEXT_FIELD_WIDTH } from '../Textfield.styles';
import Typography from '@mui/material/Typography';
import type {
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute
} from '../../../interfaces/renderProps.interface';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';

interface OpenChoiceSelectAnswerValueSetFieldProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  options: Coding[];
  valueSelect: Coding | null;
  terminologyError: TerminologyError;
  readOnly: boolean;
  onValueChange: (newValue: Coding | string | null) => void;
}

function OpenChoiceSelectAnswerValueSetField(props: OpenChoiceSelectAnswerValueSetFieldProps) {
  const { qItem, options, valueSelect, terminologyError, readOnly, isTabled, onValueChange } =
    props;

  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  return (
    <>
      <Autocomplete
        id={qItem.linkId}
        value={valueSelect ?? null}
        options={options}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.display ?? `${option.code}`
        }
        onChange={(_, newValue) => onValueChange(newValue)}
        onInputChange={(_, newValue) => onValueChange(newValue)}
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
      {terminologyError.error ? (
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server for{' '}
          {terminologyError.answerValueSet}
        </Typography>
      ) : null}
    </>
  );
}

export default OpenChoiceSelectAnswerValueSetField;
