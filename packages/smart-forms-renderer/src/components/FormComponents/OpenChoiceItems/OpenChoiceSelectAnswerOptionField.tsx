import React from 'react';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StandardTextField } from '../Textfield.styles';
import type { AutocompleteChangeReason } from '@mui/material/Autocomplete';
import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type {
  PropsWithIsTabledRequiredAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { useRendererStylingStore } from '../../../stores';
import Typography from '@mui/material/Typography';
import { StyledRequiredTypography } from '../Item.styles';

interface OpenChoiceSelectAnswerOptionFieldProps
  extends PropsWithIsTabledRequiredAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  feedback: string;
  readOnly: boolean;
  onValueChange: (
    newValue: QuestionnaireItemAnswerOption | string | null,
    reason: AutocompleteChangeReason | string
  ) => void;
}

function OpenChoiceSelectAnswerOptionField(props: OpenChoiceSelectAnswerOptionFieldProps) {
  const {
    qItem,
    options,
    valueSelect,
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
        getOptionLabel={(option) => getAnswerOptionLabel(option)}
        onChange={(_, newValue, reason) => onValueChange(newValue, reason)}
        onInputChange={(_, newValue, reason) => onValueChange(newValue, reason)}
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
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <Typography color={readOnly ? 'text.disabled' : 'text.secondary'}>
                    {displayUnit}
                  </Typography>
                </>
              )
            }}
          />
        )}
      />

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default OpenChoiceSelectAnswerOptionField;
