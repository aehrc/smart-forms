import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import MuiTextField from '../TextItem/MuiTextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Quantity } from 'fhir/r4';

interface QuantityComparatorFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  options: Quantity['comparator'][];
  valueSelect: Quantity['comparator'] | null;
  readOnly: boolean;
  onChange: (newValue: Quantity['comparator'] | null) => void;
}

function QuantityComparatorField(props: QuantityComparatorFieldProps) {
  const { linkId, options, valueSelect, readOnly, onChange } = props;

  return (
    <Box>
      <Autocomplete
        id={linkId + '-comparator'}
        value={valueSelect ?? null}
        options={options}
        onChange={(_, newValue) => onChange(newValue as Quantity['comparator'])}
        autoHighlight
        sx={{ width: 88 }}
        disabled={readOnly}
        size="small"
        renderInput={(params) => <MuiTextField sx={{ width: 88 }} {...params} />}
      />
      <Typography variant="caption" color="text.secondary">
        Symbol (optional)
      </Typography>
    </Box>
  );
}

export default QuantityComparatorField;
