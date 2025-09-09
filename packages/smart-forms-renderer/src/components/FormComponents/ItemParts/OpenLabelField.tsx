import React, { type ChangeEvent } from 'react';
import { StandardTextField } from '../Textfield.styles';
import { useRendererStylingStore } from '../../../stores';
import InputAdornment from '@mui/material/InputAdornment';
import { ClearButtonAdornment } from './ClearButtonAdornment';

interface OpenLabelFieldProps {
  value: string | null;
  readOnly: boolean;
  openLabelOptionSelected: boolean;
  label: string;
  onInputChange: (input: string) => unknown;
}

function OpenLabelField(props: OpenLabelFieldProps) {
  const { value, readOnly, openLabelOptionSelected, label, onInputChange } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const fieldReadOnly = !openLabelOptionSelected || readOnly;

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onInputChange(event.target.value);
  }

  return (
    <StandardTextField
      data-test={`open-label-${label}`}
      multiline
      disabled={fieldReadOnly && readOnlyVisualStyle === 'disabled'}
      value={value}
      onChange={handleInputChange}
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={false}
      size="small"
      slotProps={{
        input: {
          readOnly: fieldReadOnly && readOnlyVisualStyle === 'readonly',
          endAdornment: (
            <InputAdornment position="end">
              <ClearButtonAdornment
                readOnly={fieldReadOnly}
                onClear={() => {
                  onInputChange('');
                }}
              />
            </InputAdornment>
          )
        },
        htmlInput: {
          'aria-label': label ?? 'Unnamed open label field'
        }
      }}
    />
  );
}

export default OpenLabelField;
