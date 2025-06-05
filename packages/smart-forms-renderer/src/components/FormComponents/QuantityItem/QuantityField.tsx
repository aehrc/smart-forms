import React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import { StandardTextField } from '../Textfield.styles';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { useRendererStylingStore } from '../../../stores';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import { ClearButtonAdornment } from '../ItemParts/ClearButtonAdornment';

interface QuantityFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
  onBlur: () => void;
}

function QuantityField(props: QuantityFieldProps) {
  const {
    linkId,
    itemType,
    input,
    feedback,
    displayPrompt,
    displayUnit,
    entryFormat,
    readOnly,
    calcExpUpdated,
    isTabled,
    onInputChange,
    onBlur
  } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  return (
    <StandardTextField
      id={itemType + '-' + linkId + '-input'}
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      onBlur={onBlur}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      label={displayPrompt}
      placeholder={entryFormat === '' ? '0.0' : entryFormat}
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={isTabled}
      size="small"
      slotProps={{
        htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' },
        input: {
          readOnly: readOnly && readOnlyVisualStyle === 'readonly',
          endAdornment: (
            <InputAdornment position={'end'}>
              <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
              <ClearButtonAdornment
                readOnly={readOnly}
                onClear={() => {
                  onInputChange('');
                }}
              />
              <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
            </InputAdornment>
          )
        }
      }}
      helperText={feedback}
      data-test="q-item-quantity-field"
    />
  );
}

export default QuantityField;
