import React, { type ChangeEvent } from 'react';
import { StandardTextField } from '../Textfield.styles';
import { useRendererStylingStore } from '../../../stores';

interface OpenLabelFieldProps {
  value: string | null;
  readOnly: boolean;
  openLabelOptionSelected: boolean;
  onInputChange: (input: string) => unknown;
}

function OpenLabelField(props: OpenLabelFieldProps) {
  const { value, readOnly, openLabelOptionSelected, onInputChange } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const fieldReadOnly = !openLabelOptionSelected || readOnly;

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onInputChange(event.target.value);
  }

  return (
    <StandardTextField
      disabled={fieldReadOnly && readOnlyVisualStyle === 'disabled'}
      value={value}
      onChange={handleInputChange}
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={false}
      size="small"
      slotProps={{
        input: {
          readOnly: fieldReadOnly && readOnlyVisualStyle === 'readonly'
        }
      }}
    />
  );
}

export default OpenLabelField;
