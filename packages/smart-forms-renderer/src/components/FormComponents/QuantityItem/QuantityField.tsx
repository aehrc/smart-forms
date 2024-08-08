import React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import { StandardTextField } from '../Textfield.styles';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';

interface QuantityFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
}

function QuantityField(props: QuantityFieldProps) {
  const {
    linkId,
    input,
    feedback,
    displayPrompt,
    displayUnit,
    entryFormat,
    readOnly,
    calcExpUpdated,
    isTabled,
    onInputChange
  } = props;

  return (
    <StandardTextField
      id={linkId}
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      disabled={readOnly}
      label={displayPrompt}
      placeholder={entryFormat === '' ? '0.0' : entryFormat}
      fullWidth
      isTabled={isTabled}
      size="small"
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      InputProps={{
        endAdornment: (
          <InputAdornment position={'end'}>
            <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
            {displayUnit}
          </InputAdornment>
        )
      }}
      helperText={feedback}
      data-test="q-item-quantity-field"
    />
  );
}

export default QuantityField;
