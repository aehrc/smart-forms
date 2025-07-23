import InputAdornment from '@mui/material/InputAdornment';
import { StandardTextField } from '../Textfield.styles';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { useRendererStylingStore } from '../../../stores';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import { ClearButtonAdornment } from '../ItemParts/ClearButtonAdornment';
import { expressionUpdateFadingGlow } from '../../ExpressionUpdateFadingGlow.styles';

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

  let placeholderText = '0.0';
  if (displayPrompt) {
    placeholderText = displayPrompt;
  }

  if (entryFormat) {
    placeholderText = entryFormat;
  }

  return (
    <StandardTextField
      id={itemType + '-' + linkId + '-input'}
      multiline
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      onBlur={onBlur}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      placeholder={placeholderText}
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={isTabled}
      size="small"
      sx={[expressionUpdateFadingGlow(calcExpUpdated)]}
      slotProps={{
        htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' },
        input: {
          readOnly: readOnly && readOnlyVisualStyle === 'readonly',
          endAdornment: (
            <InputAdornment position={'end'}>
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
