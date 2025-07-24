import Autocomplete from '@mui/material/Autocomplete';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import MuiTextField from '../TextItem/MuiTextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Quantity } from 'fhir/r4';
import { useRendererStylingStore } from '../../../stores';
import { expressionUpdateFadingGlow } from '../../ExpressionUpdateFadingGlow.styles';

interface QuantityComparatorFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  options: Quantity['comparator'][];
  valueSelect: Quantity['comparator'] | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onChange: (newValue: Quantity['comparator'] | null) => void;
}

function QuantityComparatorField(props: QuantityComparatorFieldProps) {
  const { linkId, itemType, options, valueSelect, readOnly, calcExpUpdated, onChange } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const hideQuantityComparatorField = useRendererStylingStore.use.hideQuantityComparatorField();
  if (hideQuantityComparatorField) {
    return null;
  }

  return (
    <Box>
      <Autocomplete
        id={itemType + '-' + linkId + '-comparator'}
        value={valueSelect ?? null}
        options={options}
        onChange={(_, newValue) => onChange(newValue as Quantity['comparator'])}
        autoHighlight
        sx={[expressionUpdateFadingGlow(calcExpUpdated), { width: 88 }]}
        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
        readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
        size="small"
        renderInput={(params) => <MuiTextField sx={{ width: 88 }} {...params} />}
      />
      <Typography variant="caption" color="text.secondary">
        (optional)
      </Typography>
    </Box>
  );
}

export default QuantityComparatorField;
