import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { StandardTextField } from '../Textfield.styles';
import Typography from '@mui/material/Typography';
import type {
  PropsWithIsTabledRequiredAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import { useRendererStylingStore } from '../../../stores';
import { StyledRequiredTypography } from '../Item.styles';

interface OpenChoiceSelectAnswerValueSetFieldProps
  extends PropsWithIsTabledRequiredAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: Coding[];
  valueSelect: Coding | null;
  terminologyError: TerminologyError;
  feedback: string;
  readOnly: boolean;
  onValueChange: (newValue: Coding | string | null) => void;
}

function OpenChoiceSelectAnswerValueSetField(props: OpenChoiceSelectAnswerValueSetFieldProps) {
  const {
    qItem,
    options,
    valueSelect,
    terminologyError,
    feedback,
    readOnly,
    isTabled,
    renderingExtensions,
    onValueChange
  } = props;

  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  return (
    <>
      <Autocomplete
        id={qItem.type + '-' + qItem.linkId}
        value={valueSelect ?? null}
        options={options}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : (option.display ?? `${option.code}`)
        }
        onChange={(_, newValue) => onValueChange(newValue)}
        onInputChange={(_, newValue) => onValueChange(newValue)}
        freeSolo
        autoHighlight
        sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160, flexGrow: 1 }}
        disabled={readOnly}
        size="small"
        renderInput={(params) => (
          <StandardTextField
            textFieldWidth={textFieldWidth}
            isTabled={isTabled}
            label={displayPrompt}
            placeholder={entryFormat}
            {...params}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {params.InputProps.endAdornment}
                    <Typography color={readOnly ? 'text.disabled' : 'text.secondary'}>
                      {displayUnit}
                    </Typography>
                  </>
                )
              }
            }}
          />
        )}
      />
      {terminologyError.error ? (
        <Typography>
          There was an error fetching options from the terminology server for{' '}
          {terminologyError.answerValueSet}
        </Typography>
      ) : null}

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default OpenChoiceSelectAnswerValueSetField;
